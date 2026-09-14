"use client";

import * as React from "react";

/** The id EmbedResizeReporter measures — must wrap the embed page's actual content. */
export const EMBED_CONTENT_ID = "ditto-embed-content";

/**
 * Reports the page's actual content height to whatever parent window
 * embedded this iframe, on mount and whenever it changes — the intro,
 * question and end screens are all different heights, and the iframe
 * itself has no way to know that on its own. public/embed.js listens for
 * this and resizes the iframe element to match. A no-op outside an iframe.
 *
 * Measures `#ditto-embed-content`'s own height, not
 * `document.documentElement`'s — `scrollHeight` is `max(content height,
 * viewport height)`, so once the parent grows the iframe to fit a tall
 * screen (the intro form), the document root can never report a *smaller*
 * height for a shorter one (a question with no explanation panel yet) even
 * though the actual content shrank. A dedicated wrapper sized only by its
 * own content sidesteps that ratchet.
 */
export function EmbedResizeReporter() {
  React.useEffect(() => {
    if (window.parent === window) return;

    const el = document.getElementById(EMBED_CONTENT_ID) ?? document.documentElement;
    const report = () => {
      window.parent.postMessage({ source: "ditto-quiz-embed", height: el.scrollHeight }, "*");
    };

    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
