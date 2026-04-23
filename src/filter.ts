import type { Article } from "./parser.js";

export function filterLast24Hours(articles: Article[]): Article[] {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return articles.filter((a) => a.pubDate >= cutoff);
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    return u.href.replace(/\/+$/, "");
  } catch {
    return url;
  }
}

export function deduplicateByUrl(articles: Article[]): Article[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = normalizeUrl(a.link);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortByDateDesc(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
