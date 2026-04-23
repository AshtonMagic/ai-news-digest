import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

function truncateSentences(text: string, maxLen = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return clean.slice(0, maxLen).trimEnd() + "…";

  let result = "";
  for (const s of sentences) {
    if ((result + s).length > maxLen) break;
    result += s;
  }
  return result.trim() || clean.slice(0, maxLen).trimEnd() + "…";
}

export async function extractSummary(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AINewsDigest/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return "";

  const html = await res.text();
  const { document } = parseHTML(html);
  const reader = new Readability(document as unknown as Document);
  const article = reader.parse();
  if (!article?.textContent) return "";

  return truncateSentences(article.textContent);
}
