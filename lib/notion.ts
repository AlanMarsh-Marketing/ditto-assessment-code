import { Client } from "@notionhq/client";

/**
 * Notion is the only persistence layer for this app (see
 * ../../ditto-quiz-tool-prompt-final.md). Pinned to the current SDK's
 * default API version (2025-09-03), which introduced "data sources" as a
 * layer under databases — a database can hold one or more data sources, and
 * pages/relations/queries all target a data_source_id, not a database_id
 * directly. `NOTION_RESPONSES_DB_ID` / `NOTION_ANSWERS_DB_ID` in .env stay
 * plain database ids (matching the original spec's .env.example) —
 * `getPrimaryDataSourceId()` below resolves the single data source under
 * each at runtime, cached per process, so nothing else in the app needs to
 * know this API detail exists.
 */

let client: Client | null = null;

export function getNotionClient(): Client {
  if (client) return client;
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN is not set. Copy .env.example to .env and fill in your Notion integration token."
    );
  }
  client = new Client({ auth: token });
  return client;
}

const dataSourceIdCache = new Map<string, string>();

/**
 * A database created via `databases.create` holds exactly one data source
 * (this app never splits one into multiple sources) — this resolves that
 * id from a plain database id, so every other module can keep working with
 * the database ids stored in .env.
 */
export async function getPrimaryDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceIdCache.get(databaseId);
  if (cached) return cached;

  const notion = getNotionClient();
  const database = await notion.databases.retrieve({ database_id: databaseId });
  if (!("data_sources" in database) || database.data_sources.length === 0) {
    throw new Error(`Database ${databaseId} has no data sources — was it created correctly?`);
  }
  const id = database.data_sources[0].id;
  dataSourceIdCache.set(databaseId, id);
  return id;
}

/** Retry an async operation with brief exponential backoff. Notion's API is rate-limited to ~3 req/s. */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 400): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
