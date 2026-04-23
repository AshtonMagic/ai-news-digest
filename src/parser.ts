import { XMLParser } from "fast-xml-parser";

export interface Article {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  summary: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, (entity) => {
    const map: Record<string, string> = {
      "&amp;": "&", "&lt;": "<", "&gt;": ">",
      "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
      "&hellip;": "…", "&#8230;": "…",
    };
    return map[entity] ?? entity;
  }).trim();
}

function truncate(text: string, maxLen = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen).trimEnd() + "…" : clean;
}

function extractText(val: unknown): string {
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj["#text"] === "string") return obj["#text"];
  }
  return val != null ? String(val) : "";
}

function extractLink(val: unknown): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    const alt = val.find(
      (v) => typeof v === "object" && v !== null && (v as Record<string, unknown>)["@_rel"] === "alternate"
    );
    const target = alt ?? val[0];
    if (typeof target === "object" && target !== null) {
      return String((target as Record<string, unknown>)["@_href"] ?? "");
    }
  }
  if (typeof val === "object" && val !== null) {
    return String((val as Record<string, unknown>)["@_href"] ?? "");
  }
  return "";
}

function extractSummary(i: Record<string, unknown>, sourceName: string): string {
  if (sourceName === "Hacker News") {
    return "";
  }
  const rawDesc = i["summary"] ?? i["description"] ?? i["content:encoded"] ?? i["content"] ?? "";
  const text = stripHtml(extractText(rawDesc));
  const cleaned = text.replace(/Read the full story at.*$/, "").trim();
  return truncate(cleaned);
}

export function parseRSS(xml: string, sourceName: string): Article[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
    htmlEntities: true,
  });
  const result = parser.parse(xml);

  const channel = result?.rss?.channel ?? result?.feed;
  if (!channel) return [];

  const items: unknown[] = Array.isArray(channel.item)
    ? channel.item
    : channel.item
    ? [channel.item]
    : Array.isArray(channel.entry)
    ? channel.entry
    : channel.entry
    ? [channel.entry]
    : [];

  const articles: Article[] = [];

  for (const item of items) {
    if (typeof item !== "object" || item === null) continue;
    const i = item as Record<string, unknown>;

    const title = stripHtml(extractText(i["title"]));
    const link = extractLink(i["link"]);

    const rawDate = i["pubDate"] ?? i["published"] ?? i["updated"] ?? "";
    const pubDate = new Date(String(rawDate));
    if (isNaN(pubDate.getTime())) continue;

    const summary = extractSummary(i, sourceName);

    if (!title || !link) continue;

    articles.push({ title, link, pubDate, source: sourceName, summary });
  }

  return articles;
}
