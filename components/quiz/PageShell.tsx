import { Logo } from "@/components/ds";

/**
 * Header + footer for the standalone /q/[slug] pages. Deliberately not used
 * by /embed/[slug] — an embedded quiz sits inside someone else's page, which
 * already has its own chrome.
 */
export function PageShell({ quizTitle, children }: { quizTitle: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <a href="https://ditto.id" aria-label="Ditto" style={{ display: "inline-flex" }}>
          <Logo variant="color" height={26} />
        </a>
        <span
          className="hidden sm:block"
          style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", textAlign: "right" }}
        >
          {quizTitle}
        </span>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>

      <footer
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "16px 24px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "var(--fs-caption)",
          color: "var(--text-muted)",
        }}
      >
        <span>© {new Date().getFullYear()} Ditto</span>
        <a href="https://ditto.id">ditto.id</a>
      </footer>
    </div>
  );
}
