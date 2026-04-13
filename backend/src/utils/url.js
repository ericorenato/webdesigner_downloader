import { lookup } from "mime-types";
import { createHash } from "crypto";

export function resolveUrl(href, base) {
  if (!href) return null;
  if (href.startsWith("data:") || href.startsWith("blob:")) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

// Track used filenames per run to avoid collisions
const usedNames = new Map();

export function resetFileNames() {
  usedNames.clear();
}

export function getFileName(url, contentType) {
  const hash = createHash("md5").update(url).digest("hex").slice(0, 8);

  try {
    const parsed = new URL(url);
    // Extract filename from path
    let name = parsed.pathname.split("/").filter(Boolean).pop() || "";
    name = name.split("?")[0];
    // Sanitize: keep only safe chars
    name = name.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Remove leading/trailing underscores and dots
    name = name.replace(/^[_.-]+|[_.-]+$/g, "");

    // If name is empty or too short, use hash
    if (!name || name.length < 2) {
      const ext = extensionFromContentType(contentType) || "bin";
      name = `${hash}.${ext}`;
    }

    // If no extension, add one from content type
    if (!name.includes(".") && contentType) {
      const ext = extensionFromContentType(contentType);
      if (ext) name = `${name}.${ext}`;
    }

    // Truncate long names
    if (name.length > 100) {
      const ext = name.split(".").pop();
      name = `${hash}.${ext}`;
    }

    // Deduplicate: always make unique if name collision
    if (usedNames.has(name) && usedNames.get(name) !== url) {
      const dotIdx = name.lastIndexOf(".");
      if (dotIdx > 0) {
        name = `${name.slice(0, dotIdx)}_${hash}${name.slice(dotIdx)}`;
      } else {
        name = `${name}_${hash}`;
      }
    }

    usedNames.set(name, url);
    return name;
  } catch {
    return `${hash}.bin`;
  }
}

export function categorizeUrl(url, contentType) {
  const lowerUrl = url.toLowerCase();
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/.test(lowerUrl)) return "fonts";
  if (/\.svg(\?|$)/.test(lowerUrl)) return "svg";
  if (/\.css(\?|$)/.test(lowerUrl)) return "css";
  if (/\.(png|jpg|jpeg|gif|webp|ico|avif|bmp)(\?|$)/.test(lowerUrl)) return "images";
  if (/\.(js|mjs)(\?|$)/.test(lowerUrl)) return "js";

  if (contentType) {
    if (contentType.startsWith("font/")) return "fonts";
    if (contentType.includes("svg")) return "svg";
    if (contentType.startsWith("text/css")) return "css";
    if (contentType.startsWith("image/")) return "images";
  }

  return "images";
}

function extensionFromContentType(ct) {
  if (!ct) return null;
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "image/avif": "avif",
    "font/woff": "woff",
    "font/woff2": "woff2",
    "font/ttf": "ttf",
    "font/otf": "otf",
    "text/css": "css",
  };
  for (const [mime, ext] of Object.entries(map)) {
    if (ct.includes(mime)) return ext;
  }
  return null;
}
