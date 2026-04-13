import { join } from "path";
import { writeFile } from "fs/promises";
import pLimit from "p-limit";
import { nanoid } from "nanoid";
import { render } from "./renderer.js";
import { extract as extractAssets } from "./asset-extractor.js";
import { parseStylesheet } from "./css-parser.js";
import { rewrite, rewriteCss } from "./rewriter.js";
import { clean } from "./cleaner.js";
import { extract as extractTokens } from "./token-extractor.js";
import { ensureDir, writeFileSafe } from "../utils/file.js";
import { getFileName, categorizeUrl, resetFileNames } from "../utils/url.js";
import { createZip } from "../utils/zip.js";
import config from "../config.js";

export async function run(url, options = {}, onProgress) {
  const id = nanoid(12);
  const downloadsDir = options.downloadsDir || config.downloadsDir;
  const outputDir = join(downloadsDir, id);
  const assetsDir = join(outputDir, "assets");

  resetFileNames();
  await ensureDir(outputDir);
  await ensureDir(join(assetsDir, "css"));
  await ensureDir(join(assetsDir, "images"));
  await ensureDir(join(assetsDir, "fonts"));
  await ensureDir(join(assetsDir, "svg"));
  await ensureDir(join(assetsDir, "js"));

  const progress = (data) => onProgress?.({ ...data });

  // Step 1: Render page
  progress({ step: "rendering", message: "Renderizando página com Playwright...", percent: 5 });
  const renderResult = await render(url, options, onProgress);
  const networkAssets = renderResult.networkAssets;
  const screenshots = renderResult.screenshots;

  // Normalize HTML: decode &quot; entities in src/href attributes
  // (common in iframe-rendered SPAs where React serializes with entities)
  const html = renderResult.html
    .replace(/(src|href|content|srcset)=(&quot;)(.*?)(&quot;)/gi, (_, attr, _q1, val, _q2) => `${attr}="${val}"`)
    .replace(/(src|href|content|srcset)=(&#34;)(.*?)(&#34;)/gi, (_, attr, _q1, val, _q2) => `${attr}="${val}"`);

  // Step 2: Extract asset URLs
  progress({ step: "extracting", message: "Extraindo referências de assets...", percent: 20 });
  const assetList = extractAssets(html, networkAssets, url);

  // Step 3: Download all assets
  const totalAssets = assetList.size;
  progress({ step: "downloading_assets", message: `Baixando ${totalAssets} assets...`, percent: 30 });

  const limit = pLimit(10);
  const assetMap = new Map(); // original URL -> local relative path
  const cssTexts = [];
  let downloaded = 0;

  const downloadTasks = [...assetList.entries()].map(([assetUrl, { type }]) =>
    limit(async () => {
      try {
        let body;
        const contentType = networkAssets.get(assetUrl)?.contentType || "";

        // Try from network cache first
        if (networkAssets.has(assetUrl)) {
          body = networkAssets.get(assetUrl).body;
        } else {
          // Fetch directly
          const res = await fetch(assetUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0" },
            signal: AbortSignal.timeout(15000),
          });
          if (!res.ok) return;

          const buffer = await res.arrayBuffer();
          // Check size limit
          if (buffer.byteLength > config.maxAssetSizeMb * 1024 * 1024) return;
          body = Buffer.from(buffer);
        }

        if (!body || body.length === 0) return;

        const category = type || categorizeUrl(assetUrl, contentType);
        const fileName = getFileName(assetUrl, contentType);
        if (!fileName) return;
        const localPath = `assets/${category}/${fileName}`;
        const fullPath = join(outputDir, localPath);

        await writeFileSafe(fullPath, body);
        assetMap.set(assetUrl, localPath);

        // Collect CSS text for token extraction
        if (category === "css" && body.length < 5 * 1024 * 1024) {
          const text = body.toString("utf-8");
          cssTexts.push(text);

          // Parse CSS for additional asset references (fonts, @import, etc.)
          const { assets: cssAssets } = parseStylesheet(text, assetUrl);
          for (const cssAsset of cssAssets) {
            if (!assetList.has(cssAsset.url) && !assetMap.has(cssAsset.url)) {
              // Download sub-assets from CSS
              try {
                const subRes = await fetch(cssAsset.url, {
                  headers: { "User-Agent": "Mozilla/5.0" },
                  signal: AbortSignal.timeout(10000),
                });
                if (subRes.ok) {
                  const subBuffer = Buffer.from(await subRes.arrayBuffer());
                  if (subBuffer.length > 0 && subBuffer.length < config.maxAssetSizeMb * 1024 * 1024) {
                    const subCategory = cssAsset.type || categorizeUrl(cssAsset.url, "");
                    const subName = getFileName(cssAsset.url, "");
                    const subLocalPath = `assets/${subCategory}/${subName}`;
                    await writeFileSafe(join(outputDir, subLocalPath), subBuffer);
                    assetMap.set(cssAsset.url, subLocalPath);
                  }
                }
              } catch (err) {
                console.warn(`[wdd] Failed to download sub-asset: ${cssAsset.url} — ${err.message}`);
              }
            }
          }
        }

        downloaded++;
        if (downloaded % 5 === 0 || downloaded === totalAssets) {
          const pct = 30 + Math.floor((downloaded / Math.max(totalAssets, 1)) * 30);
          progress({
            step: "downloading_assets",
            message: `Baixados ${downloaded}/${totalAssets} assets...`,
            percent: pct,
          });
        }
      } catch (err) {
        console.warn(`[wdd] Failed to download asset: ${assetUrl} — ${err.message}`);
      }
    })
  );

  await Promise.all(downloadTasks);

  // Step 4: Rewrite URLs in HTML
  progress({ step: "rewriting", message: "Reescrevendo URLs para visualização offline...", percent: 65 });
  let processedHtml = rewrite(html, assetMap, url);

  // Rewrite CSS files
  for (const [assetUrl, localPath] of assetMap) {
    if (localPath.startsWith("assets/css/")) {
      try {
        const cssPath = join(outputDir, localPath);
        const { readFile } = await import("fs/promises");
        let cssContent = await readFile(cssPath, "utf-8");
        cssContent = rewriteCss(cssContent, assetMap, assetUrl, localPath);
        await writeFile(cssPath, cssContent);
      } catch {
        // Skip failed CSS rewrites
      }
    }
  }

  // Step 5: Clean HTML
  progress({ step: "cleaning", message: "Removendo scripts desnecessários...", percent: 72 });
  processedHtml = clean(processedHtml);

  // Step 6: Extract inline CSS for tokens
  const inlineCss = extractInlineCss(processedHtml);
  cssTexts.push(...inlineCss);

  // Step 7: Extract design tokens
  let tokens = {};
  if (options.extractDesignTokens !== false) {
    progress({ step: "tokens", message: "Extraindo design tokens...", percent: 78 });
    tokens = extractTokens(cssTexts);
    await writeFile(join(outputDir, "design-tokens.json"), JSON.stringify(tokens, null, 2));
  }

  // Step 8: Save HTML
  progress({ step: "saving", message: "Salvando HTML processado...", percent: 82 });
  await writeFile(join(outputDir, "index.html"), processedHtml);

  // Step 9: Save screenshots
  if (screenshots.full) {
    await writeFile(join(outputDir, "screenshot-full.png"), screenshots.full);
  }
  if (screenshots.viewport) {
    await writeFile(join(outputDir, "screenshot-viewport.png"), screenshots.viewport);
  }

  // Step 10: Create manifest
  const manifest = {
    url,
    date: new Date().toISOString(),
    totalAssets: assetMap.size,
    totalSize: formatBytes(await getDirSize(outputDir)),
    assetBreakdown: getAssetBreakdown(assetMap),
    options,
  };
  await writeFile(join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Step 11: Create ZIP
  progress({ step: "packaging", message: "Criando pacote ZIP...", percent: 90 });
  const zipPath = join(downloadsDir, `${id}.zip`);
  await createZip(outputDir, zipPath);

  progress({ step: "complete", message: "Download concluído!", percent: 100 });

  return {
    id,
    zipUrl: `/downloads/${id}.zip`,
    manifest,
    tokens,
  };
}

function extractInlineCss(html) {
  const styles = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    if (match[1].trim()) styles.push(match[1]);
  }
  return styles;
}

async function getDirSize(dir) {
  const { readdir, stat } = await import("fs/promises");
  let size = 0;
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        size += await getDirSize(fullPath);
      } else {
        const stats = await stat(fullPath);
        size += stats.size;
      }
    }
  } catch {}
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getAssetBreakdown(assetMap) {
  const breakdown = {};
  for (const [, localPath] of assetMap) {
    const category = localPath.split(/[/\\]/)[1] || "other";
    breakdown[category] = (breakdown[category] || 0) + 1;
  }
  return breakdown;
}
