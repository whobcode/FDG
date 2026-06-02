# File Dispatcher (FDG)

Paste a list of filenames and get a proposed folder organization scheme — on Cloudflare Workers
(TypeScript + Hono + Workers AI). Originally specced as an Electron desktop GUI; rebuilt as a
Worker web app. Two strategies: deterministic by-extension, or AI "smart" grouping by topic/project/type.

## Features
- Smart AI grouping (Llama 3.1 on Workers AI) that clusters by content/topic and type
- Deterministic by-extension fallback (also auto-used if the AI plan is incomplete/invalid)
- Validates that every file is placed exactly once
- Folder-tree preview + copy plan as JSON

## Run
```bash
npm install
npm run dev
```

## Deploy
```bash
npm run deploy
```

## API
- `POST /api/organize` `{ files: string[], strategy?: "smart"|"extension" }` → `{ strategy, plan }`

`plan` maps folder paths → filenames.

## Stack
Cloudflare Workers · Hono · Workers AI
