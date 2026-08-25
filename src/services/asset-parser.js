const resourceTagPattern = /<(?:link|script|img|source|video|audio|input)\b[^>]*>/gi;
const attributePattern = /\b(?:src|href|poster|data-src|srcset)\s*=\s*["']([^"']+)["']/gi;
const cssUrlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

export function findReferences(text, type = "html") {
  const references = new Set();
  const normalizedType = type.toLowerCase();
  const addCandidates = (value) => {
    for (const candidate of value.split(",")) {
      const reference = candidate.trim().split(/\s+/)[0];
      if (reference && !reference.startsWith("#") && !reference.startsWith("data:")) {
        references.add(reference);
      }
    }
  };

  if (normalizedType.includes("javascript") || normalizedType.includes("json")) {
    return [];
  }

  const pattern = normalizedType.includes("css") ? cssUrlPattern : resourceTagPattern;
  for (const match of text.matchAll(pattern)) {
    if (type === "css") {
      addCandidates(match[1] || "");
      continue;
    }
    for (const attribute of (match[0] || "").matchAll(attributePattern)) {
      addCandidates(attribute[1] || "");
    }
  }
  return [...references];
}

export function rewriteReferences(text, replacements) {
  let output = text;
  for (const [remote, local] of replacements) output = output.split(remote).join(local);
  return output;
}
