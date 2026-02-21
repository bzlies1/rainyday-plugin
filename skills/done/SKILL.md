---
name: done
description: >
  Mark the currently tracked Rainyday item as complete. Reads .claude/current-task,
  prompts for confirmation, moves item to Review status, posts a completion comment,
  and clears the tracking file.
user-invocable: true
allowed-tools: Read, Bash(rm*)
---

Complete the currently tracked Rainyday item. Follow these steps:

0. **Load Rainyday tools**: Load these tools via ToolSearch before calling any Rainyday APIs:
   - `select:mcp__rainyday__list_projects`
   - `select:mcp__rainyday__update_item`
   - `select:mcp__rainyday__add_comment`

1. **Read the tracked item**: Read `.claude/current-task` in the current working directory. If the file doesn't exist, tell the user there is no tracked item — they should run `/rainyday:track <identifier>` first, then stop.

   The file has two lines: identifier on line 1, title on line 2.

2. **Confirm with user**: Use AskUserQuestion to ask:
   > "Move **<identifier>: <title>** to Review?"

   Options: "Yes, move to Review" / "No, keep as-is"

3. **On cancel**: Tell the user the item was left unchanged. Stop.

4. **On confirm**:
   - Call `list_projects` to get valid status IDs for the item's project. Use the item's project shortcode (e.g., `PER` from `PER-22`) to find the matching project entry.
   - Find the status with category `in_review` (this is the Review column — not `done`)
   - Call `update_item` to set that status
   - Call `add_comment` with the message: `Work complete, moved to review`
   - Delete `.claude/current-task`:
     ```bash
     rm .claude/current-task
     ```
   - Tell the user the item has been moved to Review and the session tracking is cleared.
