# Rainyday Plugin for Claude Code

Manage your [Rainyday](https://github.com/terodato/rainyday-web) projects, items, and workflows directly from Claude Code.

## What You Get

- **MCP Server** — 9 tools and 3 resources for full Rainyday API access
- **Background Knowledge** — Claude automatically understands the Rainyday data model
- **Slash Commands:**
  - `/rainyday:create-item [title]` — Create items with duplicate checking
  - `/rainyday:triage [project]` — Triage backlog items with priority suggestions
  - `/rainyday:sprint-review [project]` — Generate sprint status reports
  - `/rainyday:log-progress [identifier]` — Log progress using git context
  - `/rainyday:link-commit` — Link commits to Rainyday items
- **Auto-Setup** — Credentials are requested on first session, no manual config needed

## Installation

```bash
# Add the marketplace
/plugin marketplace add terodato/rainyday-plugin

# Install the plugin
/plugin install rainyday@rainyday-plugin
```

On your next Claude Code session, you'll be prompted for your Rainyday deployment URL and API token. That's it.

## Prerequisites

- Claude Code 1.0.33+
- Node.js 20+
- A running Rainyday instance with an API token (Settings → API Tokens → Create Token)

## Usage

After setup, Claude automatically knows how to work with Rainyday. You can:

- Ask naturally: "Create a high-priority bug in RD for the login redirect issue"
- Use slash commands: `/rainyday:create-item Fix login redirect bug`
- Run workflows: `/rainyday:triage RD` to triage the backlog

## Reconfiguring Credentials

Say "reconfigure Rainyday credentials" in any session and Claude will walk you through updating your deployment URL and API token.

## Development

To test the plugin locally without installing:

```bash
claude --plugin-dir /path/to/rainyday-plugin
```

To rebuild the MCP server after changes:

```bash
cd server && npm run build
```
