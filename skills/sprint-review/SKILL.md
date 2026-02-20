---
name: sprint-review
description: >
  Generate a sprint status report for a Rainyday project. Shows shipped items,
  in-progress work, and blockers.
argument-hint: [project]
user-invocable: true
---

Generate a sprint status report for a Rainyday project. Follow these steps:

1. **Identify project**: Use `$ARGUMENTS` as the project shortcode. If not provided, call `list_projects` and ask the user.

2. **Get project statuses**: Call `list_projects` to discover status IDs and their categories for the target project.

3. **Fetch active items**: Make parallel calls to `list_items`:
   - Items with statuses in the `in_progress` category
   - Items with statuses in the `done` category

4. **Gather context on in-progress items**: For items that are in-progress, call `get_item` on each to read recent comments for blocker context.

5. **Present report** in this format:

   ## Sprint Review: [Project Name]

   ### Shipped (N items)
   - [identifier] [title] — [type], [priority]

   ### In Progress (N items)
   - [identifier] [title] — [type], [priority], assigned to [name]
     - Latest update: [most recent comment summary, if any]

   ### Blocked (N items)
   - [identifier] [title] — [blocker context from comments]

   ### Stats
   - Total active: N
   - Completed this period: N
   - Blocked: N

Items are "blocked" if their most recent comment mentions blocking, waiting, or dependency issues. Use your judgment.
