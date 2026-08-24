import { createWriteStream } from "node:fs";
import archiver from "archiver";

export function createZip(sourceDirectory, outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDirectory, false);
    archive.finalize();
  });
}