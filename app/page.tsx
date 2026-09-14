import { Button, Card, Badge, StatCallout, BrandIcon, Logo } from "@/components/ds";

/**
 * Brand system sampler — not a quiz screen. Proves the tokens, fonts, icons
 * and ported design-system components are wired up correctly before any
 * quiz-taking UI gets built on top of them (see CLAUDE.md / brand/BRAND.md).
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <header className="flex items-center justify-between">
          <Logo variant="color" height={32} />
          <Badge tone="orange" soft>
            Brand check
          </Badge>
        </header>

        <div className="mt-16">
          <p className="ditto-eyebrow">Ditto assessments</p>
          <h1 className="mt-2 text-h1 font-light text-text-strong">
            The quiz platform, wearing its own brand
          </h1>
          <p className="mt-4 max-w-[640px] text-lead text-text-body">
            This page renders the ported design-system components against the
            real tokens — colour, type, radii and icons all come from{" "}
            <code className="text-sm">brand/ditto-tokens.css</code>, nothing
            here is hand-picked.
          </p>
        </div>

        {/* Buttons */}
        <section className="mt-16">
          <h2 className="text-h4 font-semibold text-text-strong">Buttons</h2>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button variant="primary">Start assessment</Button>
            <Button variant="secondary">Save and continue</Button>
            <Button variant="outline">Previous</Button>
            <Button variant="ghost">Skip</Button>
          </div>
        </section>

        {/* Cards — five permitted styles */}
        <section className="mt-16">
          <h2 className="text-h4 font-semibold text-text-strong">Cards</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card tone="white">
              <p className="text-sm font-medium text-text-strong">Style 1 — hairline</p>
              <p className="mt-2 text-sm text-text-muted">No fill, subtle purple stroke.</p>
            </Card>
            <Card tone="subtle" style={{ background: "var(--purple-050)" }}>
              <p className="text-sm font-medium text-text-strong">Style 2 — tint</p>
              <p className="mt-2 text-sm text-text-muted">#F9F4FF fill, no stroke.</p>
            </Card>
            <Card tone="subtle" style={{ background: "var(--tint-cyan)" }}>
              <p className="text-sm font-medium text-text-strong">Style 3 — cyan</p>
              <p className="mt-2 text-sm text-text-muted">Tint cyan fill, no stroke.</p>
            </Card>
            <Card tone="purple">
              <p className="text-sm font-medium">Style 4 — purple</p>
              <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                Brand purple fill, white text.
              </p>
            </Card>
          </div>
        </section>

        {/* Stat callouts */}
        <section className="mt-16">
          <h2 className="text-h4 font-semibold text-text-strong">Stat callouts</h2>
          <div className="mt-6 flex flex-wrap gap-16">
            <StatCallout value="92" unit="%" label="Average pass rate" />
            <StatCallout value="4m 12s" label="Median completion time" />
            <StatCallout value="6" label="Questions answered" />
          </div>
        </section>

        {/* Icons */}
        <section className="mt-16">
          <h2 className="text-h4 font-semibold text-text-strong">Brand icons</h2>
          <div className="mt-6 flex flex-wrap items-center gap-8">
            <BrandIcon name="approved" size={40} />
            <BrandIcon name="protected" size={40} />
            <BrandIcon name="fingerprint" size={40} />
            <BrandIcon name="credentials" size={40} />
            <div
              className="flex items-center gap-8 rounded-md bg-ditto-purple px-6 py-4"
              style={{ background: "var(--ditto-purple)" }}
            >
              <BrandIcon name="approved" size={40} tone="on-purple" />
              <BrandIcon name="protected" size={40} tone="on-purple" />
            </div>
          </div>
        </section>

        {/* Writing style — orange bullet markers, sentence case */}
        <section className="mt-16 max-w-[560px]">
          <h2 className="text-h4 font-semibold text-text-strong">Before you start</h2>
          <ul className="mt-4 list-none space-y-2 p-0">
            {[
              "Answer every question before moving on",
              "Your progress saves automatically on this device",
              "You can only submit once per attempt",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-body text-text-body">
                <span style={{ color: "var(--ditto-orange)" }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
