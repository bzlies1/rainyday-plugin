---
name: link-commit
description: >
  Link the most recent git commit to referenced Rainyday items.
  Adds a comment with the commit hash and summary. Optionally updates status
  if the commit message contains "closes" or "fixes".
user-invocable: true
allowed-tools: Bash(git log*)
---

Link the most recent git commit to any Rainyday items it references. Follow these steps:

1. **Read the commit**: Run `git log -1 --format="%H%n%s%n%b"` to get the full hash, subject, and body of the most recent commit.

2. **Extract identifiers**: Scan the commit subject and body for patterns matching `[A-Z]{2,4}-\d+` (e.g., `RD-42`, `MKTG-7`). Collect all unique candidates found.

3. **Validate identifiers**: For each candidate, call `get_item` to confirm it's a real Rainyday item. Discard candidates that return "not found" or "invalid identifier" — these are likely non-Rainyday tokens (e.g., `UTF-8`, `PR-42` from another system).

4. **If no valid identifiers found**: Tell the user no Rainyday item references were found in the commit message. Suggest they use the `PROJ-123` format in commit messages.

5. **For each valid identifier**: Call `add_comment` with a message like:
   ```
   Commit abc1234: Fix login redirect handling
   ```
   Use the short hash (first 7 chars) and the commit subject line.

6. **Check for close/fix keywords**: If the commit message contains "closes [identifier]", "fixes [identifier]", or "resolves [identifier]":
   - Extract the shortcode prefix from the identifier (e.g., `RD` from `RD-42`) and find the matching project in the `list_projects` response
   - Identify the done-category status IDs for that project
   - Ask the user if they want to move the item to done
   - If yes, call `update_item` with the done status ID

7. **Report**: Summarize which items were linked and any status changes made.
