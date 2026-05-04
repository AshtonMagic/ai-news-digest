import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import cron from "node-cron";
import { fetchRSS } from "./fetcher.js";
import { parseRSS } from "./parser.js";
import { filterLast24Hours, deduplicateByUrl, sortByDateDesc } from "./filter.js";
import { renderMarkdown } from "./renderer.js";
import { extractSummary } from "./extractor.js";

const SOURCES = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/newest?q=AI&count=30",
  },
];

async function main() {
  console.log("正在抓取 RSS 源...");

  const allArticles = (
    await Promise.all(
      SOURCES.map(async ({ name, url }) => {
        try {
          console.log(`  fetching ${name}...`);
          const xml = await fetchRSS(url);
          const articles = parseRSS(xml, name);
          console.log(`  ${name}: 解析到 ${articles.length} 篇`);
          return articles;
        } catch (err) {
          console.error(`  ${name} 抓取失败:`, (err as Error).message);
          return [];
        }
      })
    )
  ).flat();

  const filtered = filterLast24Hours(allArticles);
  const unique = deduplicateByUrl(filtered);
  const sorted = sortByDateDesc(unique);

  console.log(`\n过滤后：${sorted.length} 篇（最近 24 小时，去重后）`);

  const needSummary = sorted.filter((a) => !a.summary);
  if (needSummary.length > 0) {
    console.log(`\n正在抓取 ${needSummary.length} 篇文章正文...`);
    const CONCURRENCY = 5;
    for (let i = 0; i < needSummary.length; i += CONCURRENCY) {
      const batch = needSummary.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (article) => {
          try {
            article.summary = await extractSummary(article.link);
            console.log(`  ✓ ${article.title.slice(0, 50)}`);
          } catch {
            console.log(`  ✗ ${article.title.slice(0, 50)}`);
          }
        })
      );
    }
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
  }).format(new Date());
  const markdown = renderMarkdown(sorted, today);

  const outputDir = join(process.cwd(), "output");
  mkdirSync(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${today}.md`);
  writeFileSync(outputPath, markdown, "utf-8");

  console.log(`\n日报已生成：${outputPath}`);
}

if (process.argv.includes("--cron")) {
  console.log("定时模式已启动，每天 08:00 自动运行\n");
  cron.schedule("0 8 * * *", () => {
    console.log(`\n[${new Date().toLocaleString()}] 定时任务触发`);
    main().catch((err) => console.error("运行出错：", err));
  });
} else {
  main().catch((err) => {
    console.error("运行出错：", err);
    process.exit(1);
  });
}
