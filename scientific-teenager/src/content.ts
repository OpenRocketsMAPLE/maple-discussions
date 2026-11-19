export class ContentError extends Error {}

export const NO_MENTIONS = { parse: [] as [], users: [] as string[], roles: [] as string[], repliedUser: false };
export const EVERYONE_MENTION = { parse: ["everyone"] as ["everyone"], users: [] as string[], roles: [] as string[], repliedUser: false };

export function safeUrl(value?: string | null): string | null {
  if (!value || value.length > 2048) return null;
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}

function* linkMatches(body: string) {
  for (const match of body.matchAll(/\bhttps?:\/\/[^\s<>`"]+/gi)) {
    let url = match[0].replace(/[.,!?;:'"]+$/, "");
    const pairs = [["(", ")"], ["[", "]"], ["{", "}"]];
    let changed = true;
    while (changed) {
      changed = false;
      for (const [open, close] of pairs) {
        if (url.endsWith(close) && url.split(close).length > url.split(open).length) {
          url = url.slice(0, -1).replace(/[.,!?;:'"]+$/, "");
          changed = true;
        }
      }
    }
    if (safeUrl(url)) yield { url, index: match.index! };
  }
}

export function firstHttpUrl(body: string) {
  return linkMatches(body).next().value?.url || null;
}

export async function rewriteLinks(body: string, track: (url: string) => Promise<string>) {
  const cache = new Map<string, string>();
  let result = "", offset = 0;
  for (const { url, index: start } of linkMatches(body)) {
    result += body.slice(offset, start);
    let replacement = cache.get(url);
    if (!replacement) { replacement = await track(url); cache.set(url, replacement); }
    result += replacement;
    offset = start + url.length;
  }
  return result + body.slice(offset);
}

export async function validateContent(title: string | null, body: string, link: string | null, image: string | null, _publicBase: string) {
  if (!body.trim() || body.length > 4000) throw new ContentError("Announcement text must contain 1–4000 characters. Shorten the message before submitting.");
  if (title && title.length > 200) throw new ContentError("The title must be at most 200 characters.");
  if (link && !safeUrl(link)) throw new ContentError("The primary link must be an HTTP(S) URL without credentials, at most 2048 characters.");
  if (image && !safeUrl(image)) throw new ContentError("The image URL is invalid.");
}

export function splitDescription(body: string): string[] {
  if (!body || body.length > 5400) throw new ContentError("Announcement exceeds the supported embed size.");
  const chunks: string[] = [];
  while (body.length > 4000) {
    let end = 4000;
    if (/[\uD800-\uDBFF]/.test(body[end - 1])) end--;
    chunks.push(body.slice(0, end));
    body = body.slice(end);
  }
  chunks.push(body);
  return chunks;
}