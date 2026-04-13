import * as cheerio from "cheerio";

export function rewrite(html, assetMap, baseUrl) {
  const $ = cheerio.load(html);

  const lookup = (url) => {
    if (!url) return null;
    // Try direct match first
    let local = assetMap.get(url);
    if (local) return local;
    // Try resolving relative URL to absolute
    if (baseUrl) {
      try {
        const resolved = new URL(url, baseUrl).href;
        local = assetMap.get(resolved);
        if (local) return local;
      } catch {}
    }
    return null;
  };

  // Rewrite <img src>
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    const local = lookup(src);
    if (local) $(el).attr("src", local);
  });

  // Rewrite <img srcset>
  $("img[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    $(el).attr("srcset", rewriteSrcset(srcset, lookup));
  });

  // Rewrite <picture> <source srcset>
  $("picture source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    $(el).attr("srcset", rewriteSrcset(srcset, lookup));
  });

  // Rewrite <source src>
  $("source[src]").each((_, el) => {
    const local = lookup($(el).attr("src"));
    if (local) $(el).attr("src", local);
  });

  // Rewrite <link href> (CSS, favicons)
  $("link[href]").each((_, el) => {
    const local = lookup($(el).attr("href"));
    if (local) $(el).attr("href", local);
  });

  // Rewrite <script src>
  $("script[src]").each((_, el) => {
    const local = lookup($(el).attr("src"));
    if (local) $(el).attr("src", local);
  });

  // Rewrite <meta og:image>
  $('meta[property="og:image"][content]').each((_, el) => {
    const local = lookup($(el).attr("content"));
    if (local) $(el).attr("content", local);
  });

  // Rewrite inline style background-image
  $("[style]").each((_, el) => {
    let style = $(el).attr("style");
    style = rewriteCssUrls(style, assetMap, baseUrl);
    $(el).attr("style", style);
  });

  // Rewrite <style> blocks
  $("style").each((_, el) => {
    let css = $(el).html();
    if (css) {
      css = rewriteCssUrls(css, assetMap, baseUrl);
      $(el).html(css);
    }
  });

  return $.html();
}

/**
 * Rewrite CSS URLs.
 * @param {string} css - CSS content
 * @param {Map} assetMap - URL -> local path map
 * @param {string} baseUrl - Base URL for resolving relative URLs
 * @param {string} [cssLocalPath] - Local path of the CSS file (e.g. "assets/css/style.css")
 *   Used to compute relative paths from CSS to other assets.
 */
export function rewriteCss(css, assetMap, baseUrl, cssLocalPath) {
  return rewriteCssUrls(css, assetMap, baseUrl, cssLocalPath);
}

function rewriteSrcset(srcset, lookup) {
  if (!srcset) return srcset;
  return srcset
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      const local = lookup(parts[0]);
      if (local) parts[0] = local;
      return parts.join(" ");
    })
    .join(", ");
}

function rewriteCssUrls(css, assetMap, baseUrl, cssLocalPath) {
  // Calculate CSS directory depth for relative paths
  // e.g. "assets/css/style.css" -> depth 2 -> prefix "../../"
  const cssDir = cssLocalPath ? cssLocalPath.replace(/[/\\][^/\\]*$/, "") : null;

  return css.replace(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g, (match, url) => {
    let local = assetMap.get(url);
    if (!local && baseUrl) {
      try {
        local = assetMap.get(new URL(url, baseUrl).href);
      } catch {}
    }
    if (!local) return match;

    // If CSS is in a subdirectory, make paths relative to CSS location
    if (cssDir) {
      const depth = cssDir.split(/[/\\]/).length;
      const prefix = "../".repeat(depth);
      return `url('${prefix}${local}')`;
    }
    return `url('${local}')`;
  });
}
