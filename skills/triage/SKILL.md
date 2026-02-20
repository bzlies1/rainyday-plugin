---
name: triage
description: >
  Triage backlog items in a Rainyday project. Reviews unprioritized items
  and suggests priority, type, and assignments.
argument-hint: [project]
user-invocable: true
---

Triage the backlog for a Rainyday project. Follow these steps:

1. **Identify project and statuses**: Call `list_projects` to get all projects and their statuses. If `$ARGUMENTS` specifies a shortcode, find it in the results; otherwise ask the user which project to triage. From the same response, identify which status IDs have category `backlog` for the target project.

3. **Fetch backlog items**: Call `list_items` with the project shortcode and the backlog status IDs.

4. **Triage each item**: For each backlog item, present it and suggest:
   - **Priority**: Based on the title and any description context
   - **Type**: Whether it looks like a task, bug, feature, etc.
   - Ask the user to confirm, modify, or skip each suggestion

5. **Apply updates**: For each confirmed triage decision, call `update_item` to set the priority and/or type.

6. **Summary**: Present a summary of all changes made (e.g., "Triaged 5 items: 2 set to high priority, 1 reclassified as bug, 2 skipped").

Keep the flow efficient — present items in batches if there are many, and let the user skip items they want to deal with later.
