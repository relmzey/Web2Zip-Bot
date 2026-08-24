const referencePatterns = [
  /\b(?:src|href|poster|data-src|srcset)\s*=\s*["']([^"']+)["']/gi,
  /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
];

export function findReferences(text) {
  const references = new Set();
  for (const pattern of referencePatterns) {
    for (const match of text.matchAll(pattern)) {
      for (const candidate of (match[1] || "").split(",")) {
        const reference = candidate.trim().split(/\s+/)[0];
        if (reference && !reference.startsWith("#") && !reference.startsWith("data:")) {
          references.add(reference);
        }
      }
    }
  }
  return [...references];
}

export function rewriteReferences(text, replacements) {
  let output = text;
  for (const [remote, local] of replacements) output = output.split(remote).join(local);
  return output;
}