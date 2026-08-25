import { isPrivateHostname } from "../utils/url.js";

const TIMEOUT_MS = 15000;

export async function fetchResource(url, maxBytes) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "Web2ZipBot/1.0 (+https://saveweb2zip.com)",
        accept: "text/html, text/css, application/javascript, image/*, font/*, */*",
      },
    });
    const finalUrl = new URL(response.url);
    if (
      !["http:", "https:"].includes(finalUrl.protocol) ||
      finalUrl.username ||
      finalUrl.password ||
      isPrivateHostname(finalUrl.hostname)
    ) {
      throw new Error("The website redirected to a private or unsupported URL.");
    }
    if (!response.ok) throw new Error(`The website returned HTTP ${response.status}.`);
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > maxBytes) throw new Error("A page or asset is too large.");
    if (!response.body) throw new Error("The website returned an empty response.");

    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("A page or asset is too large.");
      }
      chunks.push(Buffer.from(value));
    }
    return {
      body: Buffer.concat(chunks),
      contentType: response.headers.get("content-type")?.split(";")[0].trim() || "",
    };
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The website took too long to respond.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
