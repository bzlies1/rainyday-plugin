---
name: rainyday
description: >
  Background knowledge about the Rainyday project management system.
  Loaded automatically when Rainyday MCP tools are available. Provides
  data model context, tool selection guidance, and error recovery patterns.
user-invocable: false
---

## Data Model

- **Workspace** is the top-level container. All data belongs to one workspace.
- **Projects** belong to a workspace. Each project has a shortcode (2–4 uppercase letters, e.g., `RD`, `MKTG`).
- **Items** are the primary work unit. Each item has an identifier like `RD-42` (shortcode + sequential number).
- Items can have **sub-tasks** (one level deep only — no sub-tasks of sub-tasks).

Always use the `PROJ-123` identifier format when referring to items. Never use internal Convex document IDs.

**Item Types:** `task` (default) | `bug` | `feature` | `epic` | `note`

**Priority Levels:** `none` (default) | `low` | `medium` | `high` | `urgent`

**Statuses:** Statuses are project-specific — there is no global list. Valid status IDs vary per project. Always call `list_projects` or read `rainyday://projects` to discover valid status IDs before setting a status.

Status categories (for context): `backlog`, `todo`, `in_progress`, `done`, `cancelled`

## Tool Selection Guide

| Goal | Use |
|------|-----|
| Start of session — orient yourself | `list_projects` or resource `rainyday://projects` |
| Have a keyword, no identifier | `search_items` |
| Have an identifier | `get_item` or resource `rainyday://items/{identifier}` |
| Browse a project's items | `list_items` with optional filters |
| Check for duplicates before creating | `search_items` first |
| Create a new item | `create_item` |
| Update fields on an item | `update_item` |
| Move item to a different status | `update_item` with `status` — first confirm valid status IDs via `list_projects` |
| Add progress note | `add_comment` |
| Assign someone | `assign_item` (requires their email) |
| Break down an item into smaller pieces | `create_subtask` |

## Loading These Tools

Rainyday MCP tools are **deferred** — they do not exist until loaded. You MUST call `ToolSearch` before using any of them.

The tools are registered with the prefix `mcp__rainyday__`. The short names in the table above (e.g. `get_item`) are what the server calls them — Claude Code sees them as `mcp__rainyday__get_item`.

Use `select:` syntax for deterministic loading. Keyword searches may silently fail; `select:` is a direct lookup:

```
ToolSearch: select:mcp__rainyday__list_projects
ToolSearch: select:mcp__rainyday__get_item
ToolSearch: select:mcp__rainyday__update_item
ToolSearch: select:mcp__rainyday__add_comment
ToolSearch: select:mcp__rainyday__search_items
ToolSearch: select:mcp__rainyday__create_item
ToolSearch: select:mcp__rainyday__assign_item
ToolSearch: select:mcp__rainyday__create_subtask
ToolSearch: select:mcp__rainyday__list_items
```

Load only the tools you need. One `ToolSearch` call loads the tool immediately — you can call it right after.

## Error Recovery

- **"Invalid identifier format"** — actual message includes the bad value and correct format. The identifier must be `PROJ-123` (2–4 uppercase letters, dash, number). Check for lowercase or missing dash.
- **"Project not found"** — actual message lists available shortcodes. Use one from that list.
- **"Item not found"** — actual message states the valid range (e.g., `RD-1 through RD-47`). Use a number within that range.
- **Status update fails or silently ignored** — status IDs are project-specific strings. Call `list_projects` to see valid IDs for the target project.
- **Assignee not added** — the user must be a workspace member. The assignment is silently skipped if the email isn't found. The response from `assign_item` is the updated item — check its `assignees` array to confirm the assignment took effect.

## Important Notes

- `dueDate` is a Unix timestamp in **milliseconds** (JavaScript `Date.now()` format), not seconds.
- Comments are plain text. Use `add_comment` to log progress, decisions, or notes. Comments are visible to all workspace members.
- Sub-tasks are one level deep only — you cannot create sub-tasks of sub-tasks.
- **`create_subtask` known limitation:** The `parentIdentifier` field is passed by the MCP tool but is currently not handled by the REST API, so sub-tasks are created as top-level items. Verify after creation that the item appeared where expected.
- **Initial status on `create_item`:** The MCP tool does not expose a `status` parameter for item creation. To set the status immediately after creation, use `update_item` with the returned identifier.

## Credential Reconfiguration

If the user says "reconfigure Rainyday credentials" or similar, help them update credentials:

```bash
claude mcp update-env rainyday RAINYDAY_API_URL=<new_url>
claude mcp update-env rainyday RAINYDAY_API_TOKEN=<new_token>
```

Then verify by calling `list_projects`.
