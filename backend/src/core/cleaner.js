import * as cheerio from "cheerio";

const ANALYTICS_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /www\.googletagmanager\.com\/gtag/i,
  /\/ga\.js/i,
  /hotjar\.com/i,
  /connect\.facebook\.net.*fbevents/i,
  /cdn\.segment\.com/i,
  /cdn\.mxpnl\.com/i,
  /cdn\.amplitude\.com/i,
  /posthog/i,
  /sentry/i,
];

// Scripts to KEEP — these are safe for offline viewing
const KEEP_PATTERNS = [
  /iconify/i,
];

export function clean(html) {
  const $ = cheerio.load(html);

  $("script").each((_, el) => {
    const src = $(el).attr("src") || "";
    const type = $(el).attr("type") || "";
    const content = $(el).html() || "";

    // Keep explicitly safe scripts
    if (KEEP_PATTERNS.some((p) => p.test(src))) return;

    // Remove all external scripts with src — they are SPA bundles, analytics, etc.
    // The rendered HTML already has all the content; JS only breaks offline viewing
    // by attempting hydration, API calls, or re-rendering.
    if (src) {
      $(el).remove();
      return;
    }

    // Remove inline analytics/tracking scripts
    if (ANALYTICS_PATTERNS.some((p) => p.test(content))) {
      $(el).remove();
      return;
    }

    // Remove hydration/framework inline scripts
    if (
      content.includes("__NEXT_DATA__") ||
      content.includes("__NUXT__") ||
      content.includes("__GATSBY") ||
      content.includes("__remixContext") ||
      content.includes("self.__next") ||
      content.includes("webpackChunk") ||
      content.includes("serviceWorker") ||
      content.includes("dataLayer") ||
      content.includes("fbq(") ||
      content.includes("_gaq")
    ) {
      $(el).remove();
      return;
    }

    // Remove large inline scripts (likely bundled framework code)
    if (content.length > 5000) {
      $(el).remove();
      return;
    }
  });

  // Remove crossorigin attribute (blocks loading on file:// protocol)
  $("[crossorigin]").removeAttr("crossorigin");

  // Remove integrity attribute (fails on rewritten assets)
  $("[integrity]").removeAttr("integrity");

  // Remove noscript tags
  $("noscript").remove();

  // Remove Lenis/Locomotive classes
  $("html").removeClass("lenis lenis-smooth");
  $("body").removeClass("lenis lenis-smooth");

  // Inject scroll-fix CSS
  if (!$('style[data-scroll-fix]').length) {
    $("head").append(`
<style data-scroll-fix="true">
html, body {
  overflow: auto !important;
  overflow-x: hidden !important;
  height: auto !important;
  min-height: 100% !important;
  scroll-behavior: auto !important;
  opacity: 1 !important;
  visibility: visible !important;
}
body, .wrapper, main, #__next, #app, .page, .content, #root {
  opacity: 1 !important;
  visibility: visible !important;
}
.loader, .preloader, .loading, [class*="loader"], [class*="preloader"] {
  display: none !important;
}
main, #__next, #__nuxt, #app, #root, .main-content {
  overflow: visible !important;
  height: auto !important;
}
</style>`);
  }

  return $.html();
}
