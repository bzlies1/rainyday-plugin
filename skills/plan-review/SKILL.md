---
name: plan-review
description: >
  Generate a retrospective for a Rainyday plan. Reviews shipped work, blockers
  encountered, and patterns from the execution history. Posts the review as a
  comment on the epic.
argument-hint: "[epic identifier, e.g. RD-50]"
user-invocable: true
---

# Plan Review / Retrospective

## Overview

Generate a retrospective by reading the full execution history from Rainyday. Useful after completing a plan or as a mid-plan checkpoint.

## Process

### Step 1: Gather data from Rainyday

1. Call `get_item` on the epic identifier (includes comments)
2. Parse the `## Tasks` section for subtask identifiers
3. Call `get_item` on each subtask (includes comments and status)
4. Call `list_projects` to map status IDs to names

### Step 2: Analyze execution history

From the comments and status data, extract:

**Timeline:**
- When was the epic created?
- When did each subtask move to `in_progress`?
- When did each subtask move to `done`?
- Were there gaps (interrupted sessions)?

**Blockers:**
- Scan comments for "BLOCKED", "blocker", "stuck", "waiting" keywords
- How were they resolved? (look for subsequent comments)

**Review findings:**
- Scan comments for spec review or code quality issues
- How many review cycles per task?
- Common patterns in review feedback

### Step 3: Generate retrospective

Format:

```
## Retrospective: [epic title] ([epic identifier])

### Shipped
- RD-51: Set up JWT middleware — [one-line summary from completion comment]
- RD-52: Create login endpoint — [one-line summary]
- ...

### Blockers Encountered
- RD-53: "Missing test fixtures" — resolved by adding fixture generator
- (or "None — clean execution")

### Observations
- [Patterns noticed, e.g., "3/4 tasks needed spec review fixes — consider more detailed specs"]
- [Review efficiency, e.g., "Average 1.2 review cycles per task"]
- [Any other insights from the data]

### Stats
- Tasks: X completed, Y skipped, Z blocked
- Review cycles: N total across all tasks
```

### Step 4: Post and present

1. Call `add_comment` on the epic with the retrospective
2. Present the retrospective to the user in the terminal
