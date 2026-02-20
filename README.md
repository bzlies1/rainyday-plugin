# Rainyday Plugin for Claude Code

Manage your [Rainyday](https://github.com/bzlies1/rainyday-web) projects, items, and workflows directly from Claude Code — with natural language, slash commands, and full MCP tool access.

## What You Get

- **MCP Server** — 9 tools and 3 resources for full Rainyday API access
- **Background Knowledge** — Claude automatically understands Rainyday's data model, identifier format, and error patterns
- **Slash Commands:**
  - `/rainyday:create-item [title]` — Create items with duplicate checking and guided setup
  - `/rainyday:triage [project]` — Review backlog items and assign priorities interactively
  - `/rainyday:sprint-review [project]` — Generate a sprint status report (shipped, in progress, blocked)
  - `/rainyday:log-progress [identifier]` — Log a progress comment using your git context
  - `/rainyday:link-commit` — Link the latest commit to any Rainyday items it references
- **Auto-Setup** — On first session, Claude detects missing credentials and walks you through setup

---

## Installation

```
/plugin marketplace add bzlies1/rainyday-plugin
/plugin install rainyday@rainyday-plugin
```

**Requirements:** Claude Code 1.0.33+, Node.js 20+, a running Rainyday instance.

On your next session, Claude will ask for:
1. Your **Rainyday deployment URL** (the Convex site URL, e.g. `https://xyz.convex.site`)
2. Your **API token** — generate one in Rainyday at **Settings → API Tokens → Create Token**

That's it. Claude is ready.

---

## Quick Start

After setup, just talk to Claude naturally:

```
"List my projects"
"Create a high-priority bug in RD: login redirect broken after OAuth"
"What's the status of RD-42?"
"Triage the backlog for the MKTG project"
"Log progress on RD-55"
```

Or use slash commands directly:

```
/rainyday:create-item Fix login redirect bug
/rainyday:triage RD
/rainyday:sprint-review MKTG
/rainyday:log-progress RD-42
/rainyday:link-commit
```

---

## MCP Tools Reference

Claude uses these tools automatically. You can also ask Claude to call them directly.

### `list_projects`
List all projects with their shortcodes and status IDs. **Always call this first** — status IDs are project-specific.

### `list_items`
List items in a project, with optional filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | Project shortcode (e.g. `"RD"`) |
| `status` | string[] | Filter by status IDs |
| `priority` | string[] | `urgent` \| `high` \| `medium` \| `low` \| `none` |

### `get_item`
Get full item details including description, assignees, labels, and comments.

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | Item identifier, e.g. `"RD-42"` |

### `create_item`
Create a new item in a project.

| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | Project shortcode |
| `title` | string | Item title |
| `type` | string | `task` (default) \| `bug` \| `feature` \| `epic` \| `note` |
| `priority` | string | `none` (default) \| `low` \| `medium` \| `high` \| `urgent` |
| `description` | string | Optional markdown description |

### `update_item`
Update one or more fields on an existing item.

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | Item identifier |
| `title` | string | New title |
| `status` | string | Status ID (use `list_projects` to find valid IDs) |
| `priority` | string | New priority |
| `type` | string | New item type |
| `description` | string | New description |
| `dueDate` | number | Unix timestamp in **milliseconds** |

### `add_comment`
Add a plain-text comment to an item. Visible to all workspace members.

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | Item identifier |
| `body` | string | Comment text |

### `search_items`
Search by keyword, optionally scoped to a project.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search query |
| `project` | string | Optional: scope to a project shortcode |

### `assign_item`
Assign a workspace member to an item by email.

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | Item identifier |
| `email` | string | User's email (must be a workspace member) |

### `create_subtask`
Create a sub-task under a parent item. Sub-tasks are one level deep only.

| Parameter | Type | Description |
|-----------|------|-------------|
| `parentIdentifier` | string | Parent item identifier |
| `project` | string | Project shortcode |
| `title` | string | Sub-task title |
| `type` | string | Optional item type |
| `priority` | string | Optional priority |

---

## Resources

Claude can read these as context without making tool calls:

| Resource | Description |
|----------|-------------|
| `rainyday://projects` | All projects with statuses |
| `rainyday://projects/{shortcode}` | A specific project's details |
| `rainyday://items/{identifier}` | Full item detail including comments |

---

## Data Model

- **Workspace** → **Projects** → **Items**
- Each project has a **shortcode** (2–4 uppercase letters, e.g. `RD`, `MKTG`)
- Each item has an **identifier**: `PROJ-123` (shortcode + sequential number)
- **Statuses** are project-specific — always discover them via `list_projects`
- Status categories: `backlog` · `todo` · `in_progress` · `done` · `cancelled`

---

## Common Workflows

**Create and assign a bug:**
```
"Create a high-priority bug in RD: payment webhook not firing. Assign to alice@example.com."
```

**Move an item to done:**
```
"Mark RD-42 as done"
```
Claude will call `list_projects` to find the done status ID, then `update_item`.

**Sprint review:**
```
/rainyday:sprint-review RD
```
Claude fetches in-progress and completed items, reads recent comments for blockers, and generates a formatted report.

**Log progress from git:**
```
/rainyday:log-progress RD-55
```
Claude reads your last 5 commits and current diff, composes a progress comment, and posts it to the item.

**Link a commit:**
```
# After committing: "fix: resolve login redirect RD-42"
/rainyday:link-commit
```
Claude reads the commit, extracts `RD-42`, posts a comment with the commit hash, and offers to move the item to done.

---

## Reconfiguring Credentials

Say **"reconfigure Rainyday credentials"** in any session. Claude will run:

```bash
claude mcp update-env rainyday RAINYDAY_API_URL=<new_url>
claude mcp update-env rainyday RAINYDAY_API_TOKEN=<new_token>
```

Then verify with `list_projects`.

---

## npm Package

The MCP server is also available standalone for use with Claude Desktop or any generic MCP client:

```bash
npx @bzlies1/mcp-server
```

Configure with env vars `RAINYDAY_API_URL` and `RAINYDAY_API_TOKEN`.

---

## Development

Test the plugin locally without installing:

```bash
claude --plugin-dir /path/to/rainyday-plugin
```

Rebuild the bundled MCP server after changes:

```bash
cd server && npm run build
```
