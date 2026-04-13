import "dotenv/config";

const config = Object.freeze({
  port: parseInt(process.env.PORT || "3500", 10),
  maxConcurrent: parseInt(process.env.MAX_CONCURRENT || "3", 10),
  cleanupIntervalMin: parseInt(process.env.CLEANUP_INTERVAL_MIN || "30", 10),
  maxFileAgeMin: parseInt(process.env.MAX_FILE_AGE_MIN || "60", 10),
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || "30000", 10),
  defaultViewportW: parseInt(process.env.DEFAULT_VIEWPORT_W || "1440", 10),
  defaultViewportH: parseInt(process.env.DEFAULT_VIEWPORT_H || "900", 10),
  maxAssetSizeMb: parseInt(process.env.MAX_ASSET_SIZE_MB || "10", 10),
  downloadsDir: process.env.DOWNLOADS_DIR || "./downloads",
});

export default config;
