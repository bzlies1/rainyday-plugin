# Rainyday Plugin for Claude Code

Manage your [Rainyday](https://github.com/bzlies1/rainyday-web) projects, items, and workflows directly from Claude Code — with natural language, slash commands, and full MCP tool access.

## What You Get

- **MCP Server** — 9 tools and 3 resources for full Rainyday API access
- **Background Knowledge** — Claude automatically understands Rainyday's data model, identifier format, and error patterns
- **Planning & Execution Workflow** — Full development lifecycle tracked in Rainyday as epics + subtasks (see [Workflow Skills](#workflow-skills) below)
- **Slash Commands:**
  - `/rainyday:create-item [title]` — Create items with duplicate checking and guided setup
  - `/rainyday:triage [project]` — Review backlog items and assign priorities interactively
  - `/rainyday:sprint-review [project]` — Generate a sprint status report (shipped, in progress, blocked)
  - `/rainyday:log-progress [identifier]` — Log a progress comment using your git context
  - `/rainyday:link-commit` — Link the latest commit to any Rainyday items it references
  - `/rainyday:brainstorm` — Brainstorm a feature into a design, then store the plan in Rainyday
  - `/rainyday:write-plan [topic]` — Create an epic + subtasks from an approved design
  - `/rainyday:execute-plan [epic]` — Execute a plan with subagents, updating Rainyday as you go
  - `/rainyday:plan-status [epic]` — Quick progress view for any plan
  - `/rainyday:resume-plan [epic]` — Pick up where you left off after a session interruption
  - `/rainyday:finish-plan [epic]` — Close out a completed plan and handle git merge/PR
  - `/rainyday:plan-review [epic]` — Generate a retrospective from execution history
  - `/rainyday:plan-handoff [epic] [email]` — Transfer remaining work to another developer
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

## Workflow Skills

The workflow skills give Claude a full planning and execution lifecycle — tracked entirely in Rainyday. Instead of local files and todo lists, your plans live as epics with subtasks that anyone on the team can see.

### How It Works

```
brainstorm → write-plan → execute-plan → finish-plan
                              ↑
                         resume-plan (if interrupted)
```

1. **Brainstorm** a feature into an approved design through collaborative dialogue
2. **Write the plan** — Claude creates a Rainyday epic with subtasks, each containing full implementation details
3. **Execute the plan** — Claude dispatches a fresh subagent per subtask, runs spec and code quality reviews, and updates Rainyday status in real time
4. **Finish the plan** — Claude closes the epic and handles git merge/PR

At any point you can check progress, resume after an interruption, generate a retrospective, or hand off to a teammate.

### The Planning Chain

#### `/rainyday:brainstorm`

Start here. Claude explores your codebase, asks questions one at a time, proposes 2-3 approaches with trade-offs, and walks you through the design section by section. Once approved, it transitions to `write-plan`.

```
"I need to add real-time notifications to the dashboard"
/rainyday:brainstorm
```

#### `/rainyday:write-plan [topic]`

Creates a Rainyday epic with the plan overview in its description, then creates subtask items — one per implementation task — each with full TDD steps (failing test, implementation, verification, commit message).

```
/rainyday:write-plan Add real-time notifications
```

**What gets created:**
```
RD-50 [epic] "Add real-time notifications"    ← Plan overview
  ├── RD-51 [task] "Set up WebSocket server"  ← Full steps in description
  ├── RD-52 [task] "Create notification API"
  ├── RD-53 [task] "Build notification UI"
  └── RD-54 [task] "Add integration tests"
```

#### `/rainyday:execute-plan [epic identifier]`

Reads the epic and subtasks from Rainyday, then for each subtask:

1. Marks it `in_progress` in Rainyday
2. Dispatches a fresh implementer subagent with the full task spec
3. Runs a **spec compliance review** (did they build what was requested?)
4. Runs a **code quality review** (is it clean, tested, secure?)
5. Verifies tests pass with actual evidence
6. Marks it `done` and posts a completion comment

```
/rainyday:execute-plan RD-50
```

If something goes wrong, Claude posts a `BLOCKED` comment and stops to ask you.

#### `/rainyday:finish-plan [epic identifier]`

Verifies all subtasks are done, runs the full test suite, posts a summary comment on the epic, marks it `done`, then offers git options (merge locally, create PR, keep branch, or discard).

```
/rainyday:finish-plan RD-50
```

### Utility Skills

These can be used at any point during or after plan execution.

#### `/rainyday:plan-status [epic identifier]`

Quick at-a-glance view of where a plan stands. Reads everything from Rainyday — no local state.

```
/rainyday:plan-status RD-50
```

Output:
```
Plan: Add real-time notifications (RD-50)
Branch: feature/realtime-notifications
Progress: 2/4 tasks done

  [done]        RD-51  Set up WebSocket server
  [done]        RD-52  Create notification API
  [in_progress] RD-53  Build notification UI
  [todo]        RD-54  Add integration tests

Blockers: none
Last activity: "Completed notification API" (1h ago)
```

#### `/rainyday:resume-plan [epic identifier]`

Pick up after a crashed session, closed terminal, or next-day restart. Reads plan state from Rainyday, detects interrupted tasks, restores the git worktree, and resumes execution.

```
/rainyday:resume-plan RD-50
```

If a task was interrupted mid-work, Claude shows you where it stopped and asks whether to continue, retry, or skip.

#### `/rainyday:plan-review [epic identifier]`

Generates a retrospective from the execution history — shipped items, blockers encountered, review cycle patterns, and stats. Posts the review as a comment on the epic.

```
/rainyday:plan-review RD-50
```

#### `/rainyday:plan-handoff [epic identifier] [assignee email]`

Transfer remaining work to another developer. Generates a handoff summary with completed work, remaining tasks, branch info, and gotchas. Re-assigns incomplete subtasks and posts a handoff comment on the epic.

```
/rainyday:plan-handoff RD-50 alice@example.com
```

### Works With Superpowers

The workflow skills integrate with the [Superpowers](https://github.com/anthropics/claude-plugins-official/tree/main/superpowers) plugin:

| Superpowers skill | How it's used |
|---|---|
| `using-git-worktrees` | `execute-plan` creates an isolated worktree before starting |
| `finishing-a-development-branch` | `finish-plan` delegates git merge/PR to this skill |
| `verification-before-completion` | `verify` extends this with Rainyday-aware checks |
| `dispatching-parallel-agents` | Used internally for orchestration |

The workflow skills **replace** `superpowers:writing-plans`, `superpowers:executing-plans`, and `superpowers:subagent-driven-development` with Rainyday-backed equivalents. Brainstorming, verification, git worktrees, and branch finishing remain in superpowers.

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
