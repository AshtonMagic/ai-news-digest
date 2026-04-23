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

## Claude Code Skill

仓库自带一个 Claude Code skill 定义（`.claude/skills/ai-news-digest/SKILL.md`），让 Claude 在用户问"今天的 AI 新闻"时自动调用本工具。

- **项目内自动生效**：在本目录下运行 Claude Code 即可。
- **全局安装**（任何会话都能用）：

  ```bash
  mkdir -p ~/.claude/skills
  cp -r .claude/skills/ai-news-digest ~/.claude/skills/
  ```

  Skill 会按需把本仓库 clone 到 `~/.local/share/ai-news-digest` 并运行。
