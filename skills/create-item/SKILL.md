---
name: create-item
description: >
  Create a new Rainyday item with duplicate checking and guided project selection.
  Use when the user wants to create a task, bug, feature, or other work item.
argument-hint: [title]
user-invocable: true
---

Create a new item in Rainyday. Follow these steps:

1. **Determine project**: If `$ARGUMENTS` doesn't specify a project, call `list_projects` to get available projects. Ask the user which project to use if there are multiple.

2. **Check for duplicates**: Call `search_items` with the title from `$ARGUMENTS`. If similar items exist, show them and ask the user whether to proceed or reference an existing item.

3. **Gather details**: Ask the user for any missing details:
   - Type (task/bug/feature/epic/note) — default to task
   - Priority (none/low/medium/high/urgent) — default to none
   - Description (optional)

4. **Create the item**: Call `create_item` with the project shortcode, title, and any details provided.

5. **Report**: Show the created item's identifier (e.g., RD-43) and a summary.

If the user provided everything in the arguments (e.g., `/rainyday:create-item Fix login bug in RD as a high-priority bug`), skip the interactive questions and create directly.
