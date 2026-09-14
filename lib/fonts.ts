import localFont from "next/font/local";

/**
 * Ditto brand typeface — Poppins, self-hosted from /brand/fonts (the design
 * system handoff bundle). Never substitute another typeface or pull this
 * from a CDN. Exposed as the --font-sans CSS variable, wired into Tailwind's
 * theme in app/globals.css.
 */
export const poppins = localFont({
  src: [
    { path: "../brand/fonts/poppins-300.woff2", weight: "300", style: "normal" },
    { path: "../brand/fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "../brand/fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../brand/fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../brand/fonts/poppins-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});
