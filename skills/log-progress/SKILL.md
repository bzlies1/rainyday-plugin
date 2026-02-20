---
name: log-progress
description: >
  Log a progress update on a Rainyday item using current git context.
  Reads recent commits and diff to compose a meaningful status comment.
argument-hint: [identifier]
user-invocable: true
allowed-tools: Bash(git log*), Bash(git diff*)
---

Log a progress update on a Rainyday item. Follow these steps:

1. **Identify item**: Use `$ARGUMENTS` as the item identifier (e.g., `RD-42`). If not provided, ask the user.

2. **Get current item state**: Call `get_item` with the identifier to see the current title, status, and recent comments.

3. **Gather git context**: Run these commands to understand recent work:
   - `git log --oneline -5` — recent commits
   - `git diff --stat` — current uncommitted changes (if any)

4. **Compose progress comment**: Based on the git context, write a concise progress update. Format:

   ```
   Progress update:
   - [Summary of recent commits related to this item]
   - [Current state of uncommitted work, if any]
   - [Next steps, if obvious from context]
   ```

5. **Post the comment**: Call `add_comment` with the identifier and the composed comment.

6. **Offer status update**: If the work appears complete (e.g., "fix" commits, all tests passing), ask the user if they want to move the item to a done status.

Keep comments factual and concise. Don't pad with filler text.
