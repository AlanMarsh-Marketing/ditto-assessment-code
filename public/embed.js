/* ============================================================
   Ditto quiz embed — paste one line where the quiz should appear:

     <script src="https://learn.ditto.id/embed.js" data-quiz="your-quiz-slug"></script>

   The script inserts a responsive iframe right where it sits and resizes
   it as the quiz's height changes (intro → question → end are all
   different heights) via postMessage from the embedded page — see
   components/quiz/EmbedResizeReporter.tsx. Only `live` quizzes work here;
   `closed` shows the same closed message as the full site, and `draft`
   404s unless data-preview="1" is also set (matching /q/[slug]'s own
   ?preview=1 gate) — a draft previewed this way never writes to Notion,
   same as everywhere else. One <script> tag per quiz on the page — for
   more than one, paste it again with a different data-quiz.
   ============================================================ */
(function () {
  var thisScript =
    document.currentScript ||
    (function () {
      // Fallback for browsers/contexts where document.currentScript isn't set
      // (matches brand/icons/ditto-icon.js's approach) — find our own tag by
      // filename among all scripts on the page.
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (/embed\.js(?:[?#]|$)/.test(scripts[i].src)) return scripts[i];
      }
      return null;
    })();

  if (!thisScript) {
    console.error("[ditto-embed] couldn't locate its own <script> tag — cannot determine the quiz origin.");
    return;
  }

  var quiz = thisScript.getAttribute("data-quiz");
  if (!quiz) {
    console.error('[ditto-embed] missing required data-quiz="<slug>" attribute.');
    return;
  }

  var origin = thisScript.src.replace(/\/embed\.js(?:[?#].*)?$/, "");
  var initialHeight = parseInt(thisScript.getAttribute("data-height"), 10) || 480;
  var preview = thisScript.getAttribute("data-preview") === "1";

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/embed/" + encodeURIComponent(quiz) + (preview ? "?preview=1" : "");
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.height = initialHeight + "px";
  iframe.style.transition = "height 0.2s ease";
  iframe.setAttribute("title", "Ditto assessment");

  thisScript.insertAdjacentElement("afterend", iframe);

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.source !== "ditto-quiz-embed" || event.source !== iframe.contentWindow) return;
    if (typeof data.height === "number" && data.height > 0) {
      iframe.style.height = data.height + "px";
    }
  });
})();
