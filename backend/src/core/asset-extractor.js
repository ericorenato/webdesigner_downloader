import * as cheerio from "cheerio";

export function extract(html, networkAssets, baseUrl) {
  const $ = cheerio.load(html);
  const assets = new Map(); // url -> { type, source }

  const base = new URL(baseUrl);

  function resolve(href) {
    if (!href || href.startsWith("data:") || href.startsWith("blob:") || href.startsWith("javascript:")) {
      return null;
    }
    // Skip JS template variables like {imageSrc}, {cleanedUrl}, etc.
    if (/^\{.*\}$/.test(href.trim()) || href.includes("${")) {
      return null;
    }
    try {
      return new URL(href, base).href;
    } catch {
      return null;
    }
  }

  function add(url, type, source) {
    const resolved = resolve(url);
    if (resolved) {
      assets.set(resolved, { type, source });
    }
  }

  // Images: <img src>, <img srcset>
  $("img[src]").each((_, el) => {
    add($(el).attr("src"), "images", "img-src");
  });
  $("img[srcset]").each((_, el) => {
    parseSrcset($(el).attr("srcset")).forEach((url) => add(url, "images", "img-srcset"));
  });

  // <picture> <source>
  $("picture source[srcset]").each((_, el) => {
    parseSrcset($(el).attr("srcset")).forEach((url) => add(url, "images", "picture-source"));
  });
  $("source[src]").each((_, el) => {
    add($(el).attr("src"), "images", "source-src");
  });

  // CSS files
  $('link[rel="stylesheet"][href]').each((_, el) => {
    add($(el).attr("href"), "css", "link-stylesheet");
  });

  // Favicons and icons
  $('link[rel="icon"][href], link[rel="shortcut icon"][href], link[rel="apple-touch-icon"][href]').each((_, el) => {
    add($(el).attr("href"), "images", "favicon");
  });

  // Open Graph images
  $('meta[property="og:image"][content]').each((_, el) => {
    add($(el).attr("content"), "images", "og-image");
  });

  // Scripts — only keep iconify and similar offline-safe libraries
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (/iconify/i.test(src)) {
      add(src, "js", "script-src");
    }
  });

  // SVGs (external)
  $('img[src$=".svg"]').each((_, el) => {
    const url = resolve($(el).attr("src"));
    if (url) assets.set(url, { type: "svg", source: "img-svg" });
  });

  // Inline style background-image
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const urls = extractUrlsFromCss(style);
    urls.forEach((url) => add(url, "images", "inline-style"));
  });

  // Inline <style> blocks — extract url() references
  $("style").each((_, el) => {
    const css = $(el).html() || "";
    const urls = extractUrlsFromCss(css);
    urls.forEach((url) => add(url, "images", "style-block"));
  });

  // Add network-intercepted assets not found in HTML
  if (networkAssets) {
    for (const [url, { contentType }] of networkAssets) {
      if (!assets.has(url)) {
        const type = categorizeByContentType(contentType, url);
        if (type) {
          assets.set(url, { type, source: "network" });
        }
      }
    }
  }

  return assets;
}

function parseSrcset(srcset) {
  if (!srcset) return [];
  return srcset
    .split(",")
    .map((s) => s.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractUrlsFromCss(css) {
  const urls = [];
  const re = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    const url = match[1];
    if (!url.startsWith("data:")) {
      urls.push(url);
    }
  }
  return urls;
}

function categorizeByContentType(contentType, url) {
  if (/^image\//i.test(contentType)) return "images";
  if (/^font\//i.test(contentType) || /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(url)) return "fonts";
  if (/^text\/css/i.test(contentType) || /\.css(\?|$)/i.test(url)) return "css";
  if (/\.svg(\?|$)/i.test(url)) return "svg";
  if (/\.(js|mjs)(\?|$)/i.test(url) || /javascript/i.test(contentType)) return "js";
  return null;
}
