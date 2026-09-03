import localFont from "next/font/local";

/**
 * The source homepage self-hosts these exact font binaries. Keeping the
 * declarations in one module makes the four semantic typography roles
 * explicit and lets Next preload the two fonts needed above the fold.
 */
export const trionnDisplayFont = localFont({
  src: "./fonts/FamiljenGroteskVariable-Regular.woff2",
  variable: "--font-trionn-display",
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: "Arial",
  preload: true,
});

export const trionnBodyFont = localFont({
  src: "./fonts/NeueHaasDisplay-Roman.woff2",
  variable: "--font-trionn-body",
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: "Arial",
  preload: true,
});

export const trionnMonoFont = localFont({
  src: "./fonts/MartianMono-Light.woff2",
  variable: "--font-trionn-mono",
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: "Arial",
  preload: true,
});

export const trionnEditorialFont = localFont({
  src: "./fonts/PPEditorialNew-Ultralight.woff2",
  variable: "--font-trionn-editorial",
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: "Arial",
  preload: false,
});
