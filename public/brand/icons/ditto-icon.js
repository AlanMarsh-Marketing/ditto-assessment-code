/* ============================================================
   <ditto-icon> — Ditto brand icon, with automatic recolouring.

   Usage (after loading this script):
     <ditto-icon name="approved"></ditto-icon>              → purple ink + orange accent (for white / light backgrounds)
     <ditto-icon name="approved" tone="on-purple"></ditto-icon>  → ink turns WHITE, accent stays orange (for purple backgrounds)

   Size with CSS: ditto-icon { width: 48px; height: 48px; }  (default 24px)
   Never place icons on orange backgrounds.

   How it works: each SVG embeds `fill: var(--icon-ink,#350063)` on its
   linework and `var(--icon-accent,#fd4e19)` on its accent. This component
   inlines the SVG and, for tone="on-purple", sets --icon-ink:#fff.
   CSS custom properties cross the shadow boundary, so you can also set
   --icon-ink / --icon-accent yourself on any ancestor.
   ============================================================ */
(function () {
  // Resolve the icon folder relative to THIS script, so it works from any page.
  // Prefer locating our own <script> tag by filename (reliable across preview /
  // bundler environments where document.currentScript can point elsewhere);
  // fall back to currentScript.
  function findBase() {
    var ss = document.getElementsByTagName("script");
    for (var i = 0; i < ss.length; i++) {
      if (ss[i].src && /ditto-icon\.js(?:[?#]|$)/.test(ss[i].src)) {
        return ss[i].src.replace(/[^/]*$/, "");
      }
    }
    var cs = document.currentScript && document.currentScript.src;
    return cs ? cs.replace(/[^/]*$/, "") : "";
  }
  var BASE = "";
  function base() {
    if (!BASE) BASE = findBase(); // resolve lazily; keep first non-empty result
    return BASE;
  }
  var cache = {};

  function load(name) {
    if (cache[name]) return cache[name];
    var p = fetch(base() + encodeURIComponent(name) + ".svg", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); });
    // Only memoize successful resolutions — never poison the cache with "".
    p.then(function (svg) { cache[name] = Promise.resolve(svg); }, function () {});
    return p.catch(function () { return ""; });
  }

  class DittoIcon extends HTMLElement {
    static get observedAttributes() { return ["name", "tone"]; }
    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }

    _render() {
      var name = this.getAttribute("name");
      if (!name) return;
      var tone = this.getAttribute("tone");
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      var root = this.shadowRoot;

      load(name).then((svg) => {
        if (this.getAttribute("name") !== name) return; // changed while loading
        var inkOverride = tone === "on-purple" ? "--icon-ink:#fff;" : "";
        root.innerHTML =
          '<style>' +
          ':host{display:inline-block;width:24px;height:24px;line-height:0;' + inkOverride + '}' +
          'svg{width:100%;height:100%;display:block}' +
          '</style>' + svg;
      });
    }
  }

  if (!customElements.get("ditto-icon")) customElements.define("ditto-icon", DittoIcon);
})();
