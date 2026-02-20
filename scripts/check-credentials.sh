#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$PLUGIN_ROOT/server"

# Build server if not already built
if [ ! -f "$SERVER_DIR/dist/index.js" ]; then
  if [ -f "$SERVER_DIR/package.json" ]; then
    cd "$SERVER_DIR"
    npm install --silent 2>/dev/null
    npm run build --silent 2>/dev/null
  fi
fi

# Check if credentials are configured
if [ -z "${RAINYDAY_API_URL:-}" ] || [ -z "${RAINYDAY_API_TOKEN:-}" ]; then
  cat <<'RESPONSE'
{
  "claudeResponse": "The Rainyday plugin needs to be configured with your deployment URL and API token.\n\nPlease ask the user for:\n1. Their Rainyday deployment URL (the Convex site URL, e.g. https://xyz.convex.site)\n2. Their API token (generated from Rainyday Settings → API Tokens → Create Token)\n\nThen run these commands to save the credentials:\n- claude mcp update-env rainyday RAINYDAY_API_URL=<url>\n- claude mcp update-env rainyday RAINYDAY_API_TOKEN=<token>\n\nAfter configuring, verify by calling the list_projects MCP tool."
}
RESPONSE
fi
