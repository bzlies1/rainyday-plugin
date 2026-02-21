# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build the MCP server (required after any change to server/src/)
cd server && npm run build

# Watch mode during development
cd server && npm run dev

# Test the plugin locally without installing
claude --plugin-dir /path/to/rainyday-plugin
```

No test suite exists. Verify changes by loading the plugin locally and exercising the affected MCP tools.

## Architecture

This is a **Claude Code plugin** — a directory that Claude Code's plugin system reads to install an MCP server, load skills (slash commands), and register hooks.

```
rainyday-plugin/
├── .claude-plugin/      # Plugin manifest (plugin.json, marketplace.json)
├── .mcp.json            # MCP server registration — points to npx @bzlies1/mcp-server
├── hooks/hooks.json     # SessionStart hook → scripts/check-credentials.sh
├── scripts/             # Shell helpers: credential check, identifier extraction
├── server/              # TypeScript MCP server (the actual Rainyday API bridge)
│   └── src/
│       ├── index.ts     # Tool + resource registration
│       └── client.ts    # RainydayClient — thin wrapper around the REST API
└── skills/              # One directory per skill, each containing SKILL.md
```

### MCP Server (`server/`)

Built with `@modelcontextprotocol/sdk` + `zod`. The server:
- Reads `RAINYDAY_API_URL` and `RAINYDAY_API_TOKEN` from env — exits immediately if missing
- Exposes 9 tools: `list_projects`, `list_items`, `get_item`, `create_item`, `update_item`, `add_comment`, `search_items`, `assign_item`, `create_subtask`
- Exposes 3 resources: `rainyday://projects`, `rainyday://projects/{shortcode}`, `rainyday://items/{identifier}`
- `RainydayClient` wraps a REST API at `{RAINYDAY_API_URL}/api/...` with Bearer auth

All API responses follow `{ data: ... }` shape; errors follow `{ error: string }`. The client throws on non-2xx.

### Skills (`skills/`)

Each `SKILL.md` contains frontmatter (`name`, `description`, `user-invocable`, `argument-hint`) and a prose prompt that Claude follows when the skill is invoked. Skills are markdown — no code to build.

Key skills and their role:
- `rainyday/SKILL.md` — background knowledge, auto-loaded, not user-invocable
- `track` — start-of-session: load item details, move to In Progress, persist to `.claude/current-task`
- `done` — end-of-session: move tracked item to Review, clear `.claude/current-task`
- `log-progress` — post a git-context-aware progress comment on an item
- `link-commit` — attach the latest commit to referenced Rainyday items
- `create-item` — create a new item with duplicate checking
- `sprint-review` — generate a project status report
- `triage` — review and prioritize backlog items

### Hooks

`hooks/hooks.json` registers a `SessionStart` hook that runs `scripts/check-credentials.sh`. The script:
1. Auto-builds `server/dist/` if it doesn't exist
2. If credentials are missing, emits a `claudeResponse` JSON blob that prompts the user for setup

### Known Limitations

- `create_subtask` passes `parentIdentifier` to the MCP tool, but the REST API currently ignores it — subtasks are created as top-level items. Always verify after creation.
- Status IDs are project-specific. Never hardcode them — always call `list_projects` first to get valid IDs.
- `create_item` has no `status` parameter; use `update_item` immediately after creation to set initial status.
