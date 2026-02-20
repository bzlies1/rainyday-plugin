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

## Error Recovery

- **"Invalid identifier format"** — the identifier must be `PROJ-123` (uppercase letters, dash, number). Check for lowercase or missing dash.
- **"Project not found"** — use `list_projects` to get the correct shortcode.
- **"Item not found"** — check the number is within range. The error message tells you the valid range.
- **Status update fails or silently ignored** — status IDs are project-specific strings. Call `list_projects` to see valid IDs for the target project.
- **Assignee not added** — the user must be a workspace member. The assignment is silently skipped if the email isn't found (check returned `assignees` array).

## Important Notes

- `dueDate` is a Unix timestamp in **milliseconds** (JavaScript `Date.now()` format), not seconds.
- Comments are plain text. Use `add_comment` to log progress, decisions, or notes. Comments are visible to all workspace members.
- Sub-tasks are one level deep only — you cannot create sub-tasks of sub-tasks.

## Credential Reconfiguration

If the user says "reconfigure Rainyday credentials" or similar, help them update credentials:

```bash
claude mcp update-env rainyday RAINYDAY_API_URL=<new_url>
claude mcp update-env rainyday RAINYDAY_API_TOKEN=<new_token>
```

Then verify by calling `list_projects`.
