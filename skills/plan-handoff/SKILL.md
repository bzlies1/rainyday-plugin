---
name: plan-handoff
description: >
  Hand off a Rainyday plan to another developer. Generates a handoff summary,
  re-assigns remaining tasks, and posts context for the new assignee.
argument-hint: "[epic identifier] [assignee email]"
user-invocable: true
---

# Plan Handoff

## Overview

Transfer ownership of a plan's remaining work to another developer (or another Claude session). Generates context, re-assigns items, and posts a handoff comment.

## Process

### Step 1: Load plan state

1. Call `get_item` on the epic identifier
2. Parse subtask identifiers from the `## Tasks` section
3. Call `get_item` on each subtask for status and comments

### Step 2: Identify the new assignee

- If email is provided in arguments, use it
- Otherwise, ask the user for the assignee's email address

### Step 3: Generate handoff summary

Compile:

```
## Handoff: [epic title] ([epic identifier])

**Branch:** [from epic description]
**Handed off by:** [current user context]
**Handed off to:** [assignee email]

### Completed Work
- RD-51: Set up JWT middleware — [summary from completion comment]
- RD-52: Create login endpoint — [summary]

### Remaining Work
- RD-53: Add auth tests — [current status, any blocker context from comments]
- RD-54: Wire up frontend — [status: todo, no blockers]

### Important Context
- [Any gotchas extracted from blocker comments]
- [Architecture decisions noted in epic description]
- [Dependencies between remaining tasks]

### How to Resume
Run: rainyday:resume-plan [epic identifier]
Branch: [branch name]
```

### Step 4: Re-assign remaining tasks

For each subtask that is NOT in `done` status:
- Call `assign_item` with the subtask identifier and the new assignee's email

### Step 5: Post handoff comment

Call `add_comment` on the epic:
```
Handed off to [assignee email].
Completed: X/Y tasks.
Remaining: [list of remaining subtask identifiers and titles]
See handoff summary above for context.
```

### Step 6: Present to user

Display the handoff summary so the user can share it directly with the new assignee if needed (e.g., paste into Slack/email).
