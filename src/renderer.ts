import type { Article } from "./parser.js";

function formatDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 16);
}

export function renderMarkdown(articles: Article[], date: string): string {
  const sources = [...new Set(articles.map((a) => a.source))];
  const header = [
    `# AI 新闻日报 · ${date}`,
    "",
    `> 共收录 ${articles.length} 篇，来自 ${sources.length} 个源（${sources.join(" · ")}）`,
    "",
    "---",
    "",
  ].join("\n");

  const body = articles
    .map((a) => {
      return [
        `## ${formatDateTime(a.pubDate)} · ${a.source}`,
        `### [${a.title}](${a.link})`,
        a.summary ? a.summary : "",
        "",
        "---",
        "",
      ]
        .filter((line, i) => !(i === 2 && !a.summary))
        .join("\n");
    })
    .join("\n");

  return header + body;
}
