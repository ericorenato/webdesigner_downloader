import { chromium } from "playwright";
import config from "../config.js";

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function render(url, options = {}, onProgress) {
  const {
    timeout = config.defaultTimeout,
    viewportW = config.defaultViewportW,
    viewportH = config.defaultViewportH,
    scrollToBottom = true,
    waitForSelector = null,
  } = options;

  const b = await getBrowser();
  const context = await b.newContext({
    viewport: { width: viewportW, height: viewportH },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  const networkAssets = new Map();

  // Intercept network responses to capture dynamically loaded assets
  page.on("response", async (response) => {
    const resUrl = response.url();
    const contentType = response.headers()["content-type"] || "";
    const isAsset =
      /\.(css|js|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|otf|eot|ico)(\?|$)/i.test(resUrl) ||
      /^(image|font|text\/css)/i.test(contentType);

    if (isAsset && response.ok()) {
      try {
        const body = await response.body();
        networkAssets.set(resUrl, { contentType, body });
      } catch {
        // Some responses can't be read
      }
    }
  });

  onProgress?.({ step: "navigating", message: `Navegando para ${url}...`, percent: 8 });

  await page.goto(url, { waitUntil: "networkidle", timeout });

  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout: 10000 }).catch(() => {});
  }

  // Wait for dynamic content to render (SPAs need extra time)
  await page.waitForTimeout(5000);

  // Check for content iframe (common in site builders like Aura, Wix, Webflow previews)
  // Retry detection since some SPAs take longer to inject the iframe
  let targetPage = page;
  let html = "";
  let iframeContent = await detectContentIframe(page);

  if (!iframeContent) {
    // Wait more and try again — some builders are slow to inject srcdoc
    await page.waitForTimeout(3000);
    iframeContent = await detectContentIframe(page);
  }

  if (iframeContent) {
    onProgress?.({ step: "iframe", message: "Detectado iframe — extraindo conteúdo...", percent: 11 });
    targetPage = iframeContent;
    await page.waitForTimeout(2000);
  }

  // Scroll to bottom to trigger lazy-loaded content
  if (scrollToBottom) {
    onProgress?.({ step: "scrolling", message: "Rolando página para carregar conteúdo lazy...", percent: 12 });
    await autoScroll(targetPage);
    await page.waitForTimeout(2000);
  }

  onProgress?.({ step: "capturing", message: "Capturando HTML renderizado...", percent: 18 });

  // Get rendered HTML from the best source
  html = await targetPage.content();

  // If main page HTML looks empty (SPA shell), try to get iframe content
  const hasContent = /<(section|article|main|header|h1|h2|img)/i.test(html);
  if (!hasContent && !iframeContent) {
    // Try harder: wait more and check again
    await page.waitForTimeout(5000);
    html = await page.content();
  }

  // Screenshots
  const screenshots = {};
  if (options.screenshots !== false) {
    onProgress?.({ step: "screenshots", message: "Tirando capturas de tela...", percent: 22 });
    // If content is in an iframe, screenshot the iframe element for better results
    if (iframeContent) {
      try {
        const iframeEl = await page.$("iframe");
        if (iframeEl) {
          screenshots.viewport = await iframeEl.screenshot({ type: "png" });
        }
      } catch {}
    }
    // Always take full page screenshot from main page
    screenshots.full = await page.screenshot({ fullPage: true, type: "png" });
    if (!screenshots.viewport) {
      screenshots.viewport = await page.screenshot({ fullPage: false, type: "png" });
    }
  }

  await context.close();

  return { html, networkAssets, screenshots };
}

/**
 * Detect if the page has a content iframe (site builders often render in iframes)
 * Returns the Frame object if found, null otherwise
 */
async function detectContentIframe(page) {
  try {
    const frames = page.frames();
    let bestFrame = null;
    let bestScore = 0;

    for (const frame of frames) {
      if (frame === page.mainFrame()) continue;
      const frameUrl = frame.url();
      // Skip truly empty frames (but allow about:srcdoc — site builders use srcdoc iframes)
      if (!frameUrl || frameUrl === "about:blank") continue;

      // Score this frame by real content indicators
      const score = await frame.evaluate(() => {
        const imgs = document.querySelectorAll("img[src]").length;
        const sections = document.querySelectorAll("section, article, main, header").length;
        const headings = document.querySelectorAll("h1, h2, h3").length;
        const bodyLen = document.body?.innerHTML?.length || 0;
        return (imgs * 10) + (sections * 15) + (headings * 8) + (bodyLen > 2000 ? 20 : 0);
      }).catch(() => 0);

      if (score > bestScore) {
        bestScore = score;
        bestFrame = frame;
      }
    }

    // Only use iframe if it has meaningful content
    if (bestFrame && bestScore > 30) {
      return bestFrame;
    }
  } catch {}
  return null;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  }).catch(() => {});
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
