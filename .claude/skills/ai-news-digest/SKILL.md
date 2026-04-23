---
name: ai-news-digest
description: Use when the user asks for today's AI news, an AI industry digest, recent AI articles, or a Markdown summary of AI headlines from RSS sources (TechCrunch AI, The Verge AI, Hacker News).
---

# AI News Digest

## Overview

Generates a Markdown digest of AI news from the last 24 hours, sourced from TechCrunch AI, The Verge AI, and Hacker News (AI keyword). Output is cached daily so repeated asks for the same day are free.

Backed by https://github.com/AshtonChen/ai-news-digest. The skill installs it on demand to `~/.local/share/ai-news-digest`, so no project must be pre-cloned.

## When to Use

Triggers (Chinese or English):
- "今天的 AI 新闻" / "AI 日报" / "最近 AI 圈"
- "today's AI news" / "AI digest" / "recent AI headlines"
- User wants a Markdown summary of AI industry articles

**Don't use for:**
- Specific company/product searches → use web search
- News outside the AI domain
- Articles older than 24h

## How to Use

Set a stable install path and use it for all steps:

```bash
APP_DIR="$HOME/.local/share/ai-news-digest"
```

**Step 1 — Install if missing.** First run on a machine:

```bash
if [ ! -d "$APP_DIR" ]; then
  mkdir -p "$(dirname "$APP_DIR")"
  git clone https://github.com/AshtonChen/ai-news-digest "$APP_DIR"
  (cd "$APP_DIR" && npm install)
fi
```

Requires `git`, `node`, `npm` on PATH. If any is missing, tell the user — don't try to install them.

**Step 2 — Check today's cache.**

```bash
TODAY=$(date -u +%Y-%m-%d)
CACHE="$APP_DIR/output/$TODAY.md"
[ -f "$CACHE" ] && echo "cached" || echo "stale"
```

If cached, skip to Step 4.

**Step 3 — Generate.**

```bash
(cd "$APP_DIR" && npm start)
```

Takes 30–60s (3 RSS feeds + ~30 article-page fetches with concurrency=5). No API keys required.

**Step 4 — Present.** `Read` `$CACHE` and answer the user's actual question — full digest, top 3 headlines, Chinese summary, etc. Don't dump the raw file unless asked.

## Output Format

`output/YYYY-MM-DD.md`:

```
# AI 日报 — YYYY-MM-DD

## <Article title>
- 来源: <source name>
- 链接: <url>
- 时间: <ISO timestamp>

<summary paragraph>

---
```

## Updating

To pull source-list updates from upstream:

```bash
(cd "$APP_DIR" && git pull && npm install)
```

Only do this if the user explicitly asks, or if generation breaks in a way that suggests a stale checkout.

## Customization

Source list is in `src/index.ts` as `SOURCES`. To add a feed locally, edit that file in `$APP_DIR` and re-run.
