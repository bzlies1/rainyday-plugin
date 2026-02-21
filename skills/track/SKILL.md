---
name: track
description: >
  Track a Rainyday item for this session. Loads item details, moves it to
  In Progress, persists the identifier to .claude/current-task, and posts
  a starting comment.
argument-hint: <identifier>
user-invocable: true
allowed-tools: Bash(mkdir*), Bash(cat*), Write
---

Track a Rainyday item for this coding session. Follow these steps:

1. **Read the identifier**: Use `$ARGUMENTS` as the item identifier (e.g., `PER-22`). If not provided, tell the user to run `/rainyday:track <identifier>` with a valid identifier and stop.

2. **Load the item**: Call `get_item` with the identifier. Display the following to orient the session:
   - Title
   - Type (bug, task, feature, etc.)
   - Current status
   - Description (first 300 chars if long)
   - Assignees (if any)

3. **Move to In Progress**:
   - Call `list_projects` to get valid status IDs for the item's project
   - Find the status with category `in_progress`
   - Call `update_item` to set that status

4. **Persist to `.claude/current-task`**: In the current working directory (not the plugin directory), write a file at `.claude/current-task` with two lines:
   ```
   <identifier>
   <title>
   ```
   Create the `.claude/` directory first if it doesn't exist.

5. **Post a comment**: Call `add_comment` with the message: `Starting work on this item`

6. **Confirm to user**: Tell the user the item is now tracked, that it's been moved to In Progress, and that they can run `/rainyday:done` when finished.
