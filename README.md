# ai-news-digest

抓取多个 AI 相关 RSS 源，过滤最近 24 小时的文章，去重后生成 Markdown 日报。

## 数据源

- TechCrunch AI
- The Verge AI
- Hacker News（关键词：AI）

## 使用

```bash
npm install
npm start              # 立即生成一次日报
npm start -- --cron    # 定时模式：每天 08:00 自动运行
```

输出写入 `output/YYYY-MM-DD.md`。

## 技术栈

- TypeScript + tsx
- `fast-xml-parser` 解析 RSS
- `@mozilla/readability` + `linkedom` 抽取正文摘要
- `node-cron` 定时调度
