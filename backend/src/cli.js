#!/usr/bin/env node
import { Command } from "commander";
import { resolve } from "path";
import { run } from "./core/downloader.js";
import { closeBrowser } from "./core/renderer.js";
import config from "./config.js";

const program = new Command();

program
  .name("webdesign-downloader")
  .description("Download all visual assets from a webpage for design system analysis")
  .version("1.0.0")
  .argument("<url>", "URL of the webpage to download")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option("--no-tokens", "Skip design token extraction")
  .option("--no-screenshots", "Skip screenshots")
  .option("--viewport <size>", "Viewport size (WxH)", "1440x900")
  .option("--timeout <ms>", "Page load timeout in ms", "30000")
  .option("--no-scroll", "Skip scrolling to bottom")
  .action(async (url, opts) => {
    const [viewportW, viewportH] = opts.viewport.split("x").map(Number);

    const options = {
      extractDesignTokens: opts.tokens,
      screenshots: opts.screenshots,
      scrollToBottom: opts.scroll,
      timeout: parseInt(opts.timeout, 10),
      viewportW: viewportW || 1440,
      viewportH: viewportH || 900,
      downloadsDir: resolve(opts.output),
    };

    console.log(`\n  Webdesign Downloader`);
    console.log(`  URL: ${url}`);
    console.log(`  Output: ${resolve(opts.output)}\n`);

    try {
      const result = await run(url, options, (data) => {
        const bar = progressBar(data.percent || 0);
        process.stdout.write(`\r  ${bar} ${data.percent || 0}% — ${data.message || data.step}`);
      });

      console.log(`\n\n  Done! ZIP: ${result.zipUrl}`);
      console.log(`  Assets: ${result.manifest.totalAssets}`);
      console.log(`  Size: ${result.manifest.totalSize}`);

      if (result.tokens?.colors?.length) {
        console.log(`  Colors: ${result.tokens.colors.length}`);
      }
      if (result.tokens?.fonts?.length) {
        console.log(`  Fonts: ${result.tokens.fonts.map((f) => f.family).join(", ")}`);
      }

      console.log();
    } catch (err) {
      console.error(`\n  Error: ${err.message}\n`);
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

function progressBar(percent) {
  const width = 30;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}

program.parse();
