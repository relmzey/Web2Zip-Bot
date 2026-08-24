const privateIpv4 = /^(0|10|127)\.|^169\.254\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./;

export function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "::1" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80:") ||
    privateIpv4.test(host)
  );
}

export function validateTarget(input) {
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("That is not a valid website URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only public HTTP and HTTPS websites are supported.");
  }
  if (url.username || url.password || isPrivateHostname(url.hostname)) {
    throw new Error("Private networks and authenticated URLs are not allowed.");
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    throw new Error("Custom ports are not supported.");
  }
  url.hash = "";
  return url;
}

export function resolvePublicUrl(reference, base) {
  try {
    const url = new URL(reference, base);
    url.hash = "";
    if (!["http:", "https:"].includes(url.protocol) || isPrivateHostname(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}