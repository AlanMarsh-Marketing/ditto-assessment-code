import type { AnswerResponse } from "./scoring";

/**
 * Resume-safe local session state, keyed by quiz slug (per the "Taking
 * experience" spec). Never touches the network — this is purely a client
 * convenience so a reload or a dropped connection doesn't lose progress.
 * "One submission per attempt": once `status` flips to "completed" the quiz
 * won't resume into an editable session again (see QuizRunner).
 */

export interface QuizSession {
  version: 1;
  status: "in-progress" | "completed";
  identity: Record<string, string>;
  /** Question ids in display order (shuffled once, then fixed for the attempt). */
  order: string[];
  currentIndex: number;
  responses: Record<string, AnswerResponse>;
  attemptStartedAt: number;
}

function storageKey(slug: string): string {
  return `ditto-quiz:${slug}`;
}

export function loadQuizSession(slug: string): QuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return null;
    return parsed as QuizSession;
  } catch {
    // Corrupt or blocked storage (private mode, quota) — treat as no session.
    return null;
  }
}

export function saveQuizSession(slug: string, session: QuizSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(session));
  } catch {
    // Storage blocked/full — the attempt still works in-memory for this
    // page load, it just won't survive a reload. Nothing to surface to the
    // taker over a lost resume convenience.
  }
}

export function clearQuizSession(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(slug));
  } catch {
    // Ignore — same reasoning as saveQuizSession.
  }
}
