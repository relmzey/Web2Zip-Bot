import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateTarget, resolvePublicUrl } from "../utils/url.js";
import { extensionFor, isTextAsset, safeName } from "../utils/files.js";
import { findReferences, rewriteReferences } from "./asset-parser.js";
import { fetchResource } from "./resource-fetcher.js";
import { createZip } from "./archive-builder.js";

const MAX_PAGE_BYTES = 3 * 1024 * 1024;
const MAX_ASSET_BYTES = 2 * 1024 * 1024;
const MAX_CONTENT_BYTES = 10 * 1024 * 1024;
const MAX_ARCHIVE_BYTES = 10 * 1024 * 1024;

function rewriteResolvedReferences(text, baseUrl, sourceLocalPath, assets) {
  const replacements = new Map();
  const sourceDirectory = path.posix.dirname(sourceLocalPath);

  for (const reference of findReferences(text)) {
    const resolved = resolvePublicUrl(reference, baseUrl);
    const asset = resolved && assets.get(resolved.href);
    if (!asset) continue;

    const localPath = path.posix.relative(sourceDirectory, asset.localPath) || path.posix.basename(asset.localPath);
    replacements.set(reference, localPath);
  }

  return rewriteReferences(text, replacements);
}

export async function cloneWebsite(input, onProgress = async () => {}) {
  const target = validateTarget(input);
  const workDirectory = path.join(os.tmpdir(), `web2zip-${randomUUID()}`);
  await mkdir(path.join(workDirectory, "assets"), { recursive: true });

  try {
    await onProgress("Fetching the page and discovering public assets...");
    const page = await fetchResource(target, MAX_PAGE_BYTES);
    const html = page.body.toString("utf8");
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || target.hostname;
    const assets = new Map();
    const queue = [];
    const seen = new Set();
    let contentBytes = page.body.byteLength;

    const enqueue = (reference, base) => {
      const url = resolvePublicUrl(reference, base);
      if (!url || seen.has(url.href)) return;
      seen.add(url.href);
      queue.push(url);
    };

    for (const reference of findReferences(html)) enqueue(reference, target);
    while (queue.length) {
      const url = queue.shift();
      try {
        const downloaded = await fetchResource(url, MAX_ASSET_BYTES);
        if (contentBytes + downloaded.body.byteLength > MAX_CONTENT_BYTES) continue;
        const hash = createHash("sha1").update(url.href).digest("hex").slice(0, 10);
        const baseName = safeName(path.basename(url.pathname) || "asset");
        const filename = `${hash}-${baseName}${path.extname(baseName) ? "" : extensionFor(url, downloaded.contentType)}`;
        const localPath = path.join("assets", filename);
        const asset = { url, contentType: downloaded.contentType, body: downloaded.body, localPath };
        assets.set(url.href, asset);
        contentBytes += downloaded.body.byteLength;
        if (isTextAsset(asset)) {
          for (const reference of findReferences(downloaded.body.toString("utf8"))) enqueue(reference, url);
        }
      } catch {
        // Optional resources such as analytics scripts should not fail the clone.
      }
    }

    await onProgress(`Downloaded ${assets.size} public assets. Building the ZIP...`);
    await writeFile(
      path.join(workDirectory, "index.html"),
      rewriteResolvedReferences(html, target, "index.html", assets),
    );
    for (const asset of assets.values()) {
      const body = isTextAsset(asset)
        ? Buffer.from(
            rewriteResolvedReferences(
              asset.body.toString("utf8"),
              asset.url,
              asset.localPath,
              assets,
            ),
          )
        : asset.body;
      await writeFile(path.join(workDirectory, asset.localPath), body);
    }
    await writeFile(
      path.join(workDirectory, "README.md"),
      `# ${title}\n\nCloned by Web2Zip Bot.\n\nSource: ${target.origin}\nAssets included: ${assets.size}\n\nThis is a front-end snapshot only. Server-side code, databases, accounts, payments, and private content are not copied.\n`,
    );

    const archiveName = `${safeName(target.hostname)}-web2zip.zip`;
    const archivePath = path.join(os.tmpdir(), `${randomUUID()}-${archiveName}`);
    await createZip(workDirectory, archivePath);
    const archiveSize = (await readFile(archivePath)).byteLength;
    if (archiveSize > MAX_ARCHIVE_BYTES) {
      await rm(archivePath, { force: true });
      throw new Error("The ZIP is larger than Discord's upload limit.");
    }
    return { archivePath, archiveName, archiveSize, assetCount: assets.size, title };
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
}

export function removeArchive(archivePath) {
  return rm(archivePath, { force: true });
}
