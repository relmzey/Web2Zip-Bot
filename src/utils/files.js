import path from "node:path";

export function safeName(value, fallback = "asset") {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || fallback;
}

export function extensionFor(url, contentType) {
  const extension = path.extname(url.pathname).toLowerCase();
  if (extension && extension.length <= 8) return extension;
  const types = {
    "text/css": ".css",
    "text/javascript": ".js",
    "application/javascript": ".js",
    "application/json": ".json",
    "image/svg+xml": ".svg",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
  };
  return types[contentType] || ".bin";
}

export function isTextAsset(asset) {
  return /text|javascript|json/.test(asset.contentType) || /\.(css|js|mjs|json|svg|html?)$/i.test(asset.url.pathname);
}