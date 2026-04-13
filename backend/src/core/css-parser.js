import * as csstree from "css-tree";

export function parseStylesheet(cssText, baseUrl) {
  const assets = [];
  const fontFaces = [];

  try {
    const ast = csstree.parse(cssText, {
      parseAtrulePrelude: true,
      parseRulePrelude: true,
      parseValue: true,
    });

    // Extract @font-face sources
    csstree.walk(ast, {
      visit: "Atrule",
      enter(node) {
        if (node.name === "font-face" && node.block) {
          const face = { family: null, weight: null, style: null, sources: [] };

          csstree.walk(node.block, {
            visit: "Declaration",
            enter(decl) {
              const value = csstree.generate(decl.value);
              if (decl.property === "font-family") {
                face.family = value.replace(/['"]/g, "").trim();
              } else if (decl.property === "font-weight") {
                face.weight = value;
              } else if (decl.property === "font-style") {
                face.style = value;
              } else if (decl.property === "src") {
                const urls = extractUrlsFromValue(value, baseUrl);
                face.sources.push(...urls);
                urls.forEach((url) => assets.push({ url, type: "fonts" }));
              }
            },
          });

          if (face.family) fontFaces.push(face);
        }

        // Extract @import urls
        if (node.name === "import") {
          const prelude = csstree.generate(node.prelude);
          const match = prelude.match(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/);
          if (match) {
            assets.push({ url: resolveUrl(match[1], baseUrl), type: "css" });
          } else {
            // @import "file.css"
            const strMatch = prelude.match(/['"]([^'"]+)['"]/);
            if (strMatch) {
              assets.push({ url: resolveUrl(strMatch[1], baseUrl), type: "css" });
            }
          }
        }
      },
    });

    // Extract all url() references in declarations
    csstree.walk(ast, {
      visit: "Url",
      enter(node) {
        const url = node.value.trim().replace(/^['"]|['"]$/g, "");
        if (url && !url.startsWith("data:")) {
          const resolved = resolveUrl(url, baseUrl);
          if (resolved && !assets.some((a) => a.url === resolved)) {
            const type = guessType(resolved);
            assets.push({ url: resolved, type });
          }
        }
      },
    });
  } catch {
    // Graceful fallback for malformed CSS
    const urls = extractUrlsFallback(cssText, baseUrl);
    assets.push(...urls);
  }

  return { assets, fontFaces };
}

function extractUrlsFromValue(value, baseUrl) {
  const urls = [];
  const re = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  let match;
  while ((match = re.exec(value)) !== null) {
    const url = match[1];
    if (!url.startsWith("data:")) {
      urls.push(resolveUrl(url, baseUrl));
    }
  }
  return urls;
}

function extractUrlsFallback(css, baseUrl) {
  const urls = [];
  const re = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    if (!match[1].startsWith("data:")) {
      urls.push({ url: resolveUrl(match[1], baseUrl), type: guessType(match[1]) });
    }
  }
  return urls;
}

function resolveUrl(url, base) {
  if (!url || !base) return url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function guessType(url) {
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(url)) return "fonts";
  if (/\.(png|jpg|jpeg|gif|webp|ico)(\?|$)/i.test(url)) return "images";
  if (/\.svg(\?|$)/i.test(url)) return "svg";
  if (/\.css(\?|$)/i.test(url)) return "css";
  return "images";
}
