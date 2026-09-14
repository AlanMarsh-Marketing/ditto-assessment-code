/**
 * One-off setup script: reads NOTION_PARENT_PAGE_ID, creates the Responses
 * and Answers databases under it, and prints their ids for .env. Idempotent
 * — if databases with those titles already exist as children of the parent
 * page, it reports them and exits rather than creating duplicates.
 *
 * Run with: npm run setup:notion
 */
import { getNotionClient, getPrimaryDataSourceId } from "../lib/notion";
import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints/common";
import type { UpdateDataSourceParameters } from "@notionhq/client/build/src/api-endpoints/data-sources";

// The update-data-source endpoint's per-property shape differs subtly from
// the create-database one (e.g. relation configs), so it needs its own type
// rather than reusing PropertyConfigurationRequest.
type UpdateDataSourceProperties = NonNullable<UpdateDataSourceParameters["properties"]>;

try {
  process.loadEnvFile(".env");
} catch {
  // .env not present — fall through, the checks below will report exactly
  // what's missing rather than failing on an unhelpful ENOENT.
}

const RESPONSES_TITLE = "Responses";
const ANSWERS_TITLE = "Answers";

async function main() {
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  if (!process.env.NOTION_TOKEN || !parentPageId) {
    console.error(
      "Missing NOTION_TOKEN and/or NOTION_PARENT_PAGE_ID.\n" +
        "Copy .env.example to .env, paste in your Notion integration token and the\n" +
        "id of the private page you shared with that integration, then re-run."
    );
    process.exit(1);
  }

  const notion = getNotionClient();

  const existing = await findExistingChildDatabases(parentPageId);
  const existingResponses = existing.get(RESPONSES_TITLE);
  const existingAnswers = existing.get(ANSWERS_TITLE);

  if (existingResponses && existingAnswers) {
    console.log(`"${RESPONSES_TITLE}" and "${ANSWERS_TITLE}" already exist under this page.\n`);
    const responsesDataSourceId = await getPrimaryDataSourceId(existingResponses);
    await ensureResponsesRollups(responsesDataSourceId);
    printEnvLines(existingResponses, existingAnswers);
    return;
  }

  if (existingResponses || existingAnswers) {
    console.error(
      `Found only one of the two expected databases under this page ` +
        `("${RESPONSES_TITLE}": ${existingResponses ?? "missing"}, "${ANSWERS_TITLE}": ${existingAnswers ?? "missing"}).\n` +
        `That's an inconsistent state this script won't try to repair automatically — ` +
        `delete the partial database from Notion (or rename it) and re-run.`
    );
    process.exit(1);
  }

  console.log(`Creating "${RESPONSES_TITLE}" database…`);
  const responsesDb = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: RESPONSES_TITLE } }],
    initial_data_source: { properties: RESPONSES_PROPERTIES },
  });
  if (!("data_sources" in responsesDb)) {
    throw new Error("Unexpected response creating Responses database (no data_sources).");
  }
  const responsesDataSourceId = responsesDb.data_sources[0].id;

  console.log(`Creating "${ANSWERS_TITLE}" database…`);
  const answersDb = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: ANSWERS_TITLE } }],
    initial_data_source: {
      properties: {
        ...ANSWERS_PROPERTIES,
        // Dual-property relation: this also creates the "Answers" relation
        // back on the Responses data source, in one call — no separate
        // rename step needed.
        Response: {
          type: "relation",
          relation: {
            data_source_id: responsesDataSourceId,
            type: "dual_property",
            dual_property: { synced_property_name: "Answers" },
          },
        },
      },
    },
  });
  if (!("data_sources" in answersDb)) {
    throw new Error("Unexpected response creating Answers database (no data_sources).");
  }

  console.log(`\n✓ Created both databases.\n`);
  await ensureResponsesRollups(responsesDataSourceId);
  printEnvLines(responsesDb.id, answersDb.id);
  printViewChecklist();
}

/**
 * Rollup columns on Responses that surface each answer's text/correctness
 * directly in the Responses table — added idempotently every run (not just
 * at creation) so re-running setup:notion after an upgrade backfills them
 * onto an already-existing database.
 */
const RESPONSES_ROLLUPS: UpdateDataSourceProperties = {
  "Answer text": {
    type: "rollup",
    rollup: { relation_property_name: "Answers", rollup_property_name: "Answer", function: "show_original" },
  },
  "Answer correct?": {
    type: "rollup",
    rollup: { relation_property_name: "Answers", rollup_property_name: "Correct", function: "show_original" },
  },
};

async function ensureResponsesRollups(responsesDataSourceId: string) {
  const notion = getNotionClient();
  const dataSource = await notion.dataSources.retrieve({ data_source_id: responsesDataSourceId });
  const existingNames = new Set(Object.keys(dataSource.properties ?? {}));
  const missing = Object.fromEntries(
    Object.entries(RESPONSES_ROLLUPS).filter(([name]) => !existingNames.has(name))
  );
  if (Object.keys(missing).length === 0) {
    console.log("Rollup columns (Answer text / Answer correct?) already present on Responses.");
    return;
  }
  console.log(`Adding rollup column(s) to Responses: ${Object.keys(missing).join(", ")}`);
  await notion.dataSources.update({ data_source_id: responsesDataSourceId, properties: missing });
}

const RESPONSES_PROPERTIES: Record<string, PropertyConfigurationRequest> = {
  Name: { type: "title", title: {} },
  Quiz: { type: "select", select: {} },
  Audience: { type: "select", select: {} },
  Respondent: { type: "rich_text", rich_text: {} },
  Email: { type: "email", email: {} },
  Partner: { type: "rich_text", rich_text: {} },
  "Identity (raw)": { type: "rich_text", rich_text: {} },
  Score: { type: "number", number: {} },
  "Max score": { type: "number", number: {} },
  Percentage: { type: "formula", formula: { expression: 'prop("Score") / prop("Max score")' } },
  Passed: { type: "checkbox", checkbox: {} },
  "Duration (s)": { type: "number", number: {} },
  Submitted: { type: "date", date: {} },
};

const ANSWERS_PROPERTIES: Record<string, PropertyConfigurationRequest> = {
  Name: { type: "title", title: {} },
  Quiz: { type: "select", select: {} },
  "Question ID": { type: "rich_text", rich_text: {} },
  Question: { type: "rich_text", rich_text: {} },
  Type: { type: "select", select: {} },
  Tags: { type: "multi_select", multi_select: {} },
  Answer: { type: "rich_text", rich_text: {} },
  Correct: { type: "checkbox", checkbox: {} },
  Unscored: { type: "checkbox", checkbox: {} },
  "Time taken (s)": { type: "number", number: {} },
};

/**
 * Databases created as page children show up in the parent page's block
 * children as `child_database` blocks — walk those (paginated) rather than
 * `search`, since search can lag or surface databases from elsewhere that
 * happen to share a title.
 */
async function findExistingChildDatabases(parentPageId: string): Promise<Map<string, string>> {
  const notion = getNotionClient();
  const found = new Map<string, string>();
  let cursor: string | undefined;
  do {
    const res = await notion.blocks.children.list({ block_id: parentPageId, start_cursor: cursor });
    for (const block of res.results) {
      if ("type" in block && block.type === "child_database") {
        found.set(block.child_database.title, block.id);
      }
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return found;
}

function printEnvLines(responsesDbId: string, answersDbId: string) {
  console.log("Paste these into .env:\n");
  console.log(`NOTION_RESPONSES_DB_ID=${responsesDbId}`);
  console.log(`NOTION_ANSWERS_DB_ID=${answersDbId}`);
}

function printViewChecklist() {
  console.log(
    "\nViews to create manually in Notion (grouping/filtering isn't exposed via the API):\n" +
      "  - Responses grouped by Quiz, sorted by Submitted descending\n" +
      "  - Responses filtered to Passed = false\n" +
      "  - Answers grouped by Question ID, filtered to one quiz — distractor analysis\n" +
      "  - Answers grouped by Tags, with the Correct checkbox rolled up — topic-level weakness\n" +
      "  - Answers filtered to Type = shortText — free text in one place for Notion AI to summarise\n" +
      "\n" +
      "Optional, one-time: open a Response page → type /linked view → pick Answers →\n" +
      "  filter \"Response\" contains \"This page\" → save as the default template for new\n" +
      "  Response pages, so every response opens with a live table of just its own answers.\n" +
      "  (\"Answer text\" / \"Answer correct?\" rollup columns already show a compact version\n" +
      "  of this directly in the Responses grid, no setup needed.)\n"
  );
}

main().catch((err) => {
  console.error("\n✗ setup:notion failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
