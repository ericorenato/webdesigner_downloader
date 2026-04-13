import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import config from "./config.js";
import { run } from "./core/downloader.js";
import { ensureDir, cleanOldFiles } from "./utils/file.js";
import { closeBrowser } from "./core/renderer.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

// CORS for frontend dev
await app.register(fastifyCors, { origin: true });

// Ensure downloads directory exists
const downloadsAbsPath = resolve(config.downloadsDir);
await ensureDir(downloadsAbsPath);

// Serve ZIP downloads
await app.register(fastifyStatic, {
  root: downloadsAbsPath,
  prefix: "/downloads/",
  decorateReply: false,
});

// Serve frontend static files in production
// Try module-relative "public" first (Docker), then CWD-relative
const frontendDist = existsSync(resolve(__dirname, "..", "public"))
  ? resolve(__dirname, "..", "public")
  : resolve("public");
if (existsSync(frontendDist)) {
  await app.register(fastifyStatic, {
    root: frontendDist,
    prefix: "/",
    decorateReply: false,
  });
}

// Track active downloads for concurrency limiting
let activeDownloads = 0;

// ========== ROUTES ==========

// Health check
app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  activeDownloads,
}));

// Main download endpoint — returns SSE stream
app.post("/api/download", async (request, reply) => {
  const { url, options = {} } = request.body || {};

  if (!url) {
    return reply.code(400).send({ error: "URL is required" });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return reply.code(400).send({ error: "Invalid URL" });
  }

  // Concurrency check — increment first to avoid race condition
  activeDownloads++;
  if (activeDownloads > config.maxConcurrent) {
    activeDownloads--;
    return reply.code(429).send({
      error: "Muitos downloads simultâneos. Tente novamente em instantes.",
    });
  }

  // Hijack the response for SSE streaming
  reply.hijack();

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const sendEvent = (event, data) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await run(url, options, (progressData) => {
      sendEvent("progress", progressData);
    });

    sendEvent("complete", result);
  } catch (err) {
    app.log.error(err);
    sendEvent("error", {
      message: err.message || "Falha no download",
      code: "DOWNLOAD_ERROR",
    });
  } finally {
    activeDownloads--;
    reply.raw.end();
  }
});

// Delete a download
app.delete("/downloads/:id", async (request, reply) => {
  const { id } = request.params;
  const zipPath = join(downloadsAbsPath, `${id}.zip`);
  const dirPath = join(downloadsAbsPath, id);

  try {
    if (existsSync(zipPath)) await rm(zipPath);
    if (existsSync(dirPath)) await rm(dirPath, { recursive: true });
    return { status: "deleted", id };
  } catch (err) {
    return reply.code(500).send({ error: err.message });
  }
});

// ========== CLEANUP TIMER ==========
const cleanupInterval = setInterval(
  () => cleanOldFiles(downloadsAbsPath, config.maxFileAgeMin),
  config.cleanupIntervalMin * 60 * 1000
);

// ========== GRACEFUL SHUTDOWN ==========
const shutdown = async () => {
  clearInterval(cleanupInterval);
  await closeBrowser();
  await app.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ========== START ==========
try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`\n  Webdesign Downloader running on http://localhost:${config.port}\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
