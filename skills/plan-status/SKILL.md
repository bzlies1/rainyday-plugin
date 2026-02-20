---
name: plan-status
description: >
  Show the current status of a Rainyday plan. Displays progress, blockers,
  and recent activity for an epic and its subtasks.
argument-hint: "[epic identifier, e.g. RD-50]"
user-invocable: true
---

# Plan Status

## Overview

Quick at-a-glance view of a Rainyday plan's progress. Reads everything via MCP — no local state needed.

## Process

### Step 1: Load the plan

1. Call `get_item` on the epic identifier to get the plan overview and comments
2. Parse the `## Tasks` section to get subtask identifiers
3. Call `get_item` on each subtask to get current status and comments

### Step 2: Discover status mappings

Call `list_projects` to find the project's status definitions. Map each subtask's `statusId` to a human-readable name and category.

### Step 3: Present status

Format and display:

```
Plan: [epic title] ([epic identifier])
Branch: [from epic description]
Progress: X/Y tasks done

  [done]        RD-51  Set up JWT middleware
  [done]        RD-52  Create login endpoint
  [in_progress] RD-53  Add auth tests
  [todo]        RD-54  Wire up frontend

Blockers:
  RD-53: "Missing test fixtures" (comment from 2h ago)

Last activity: "[most recent comment text]" ([time ago])
```

### Step 4: Detect blockers

Scan subtask comments for keywords: "BLOCKED", "blocked", "blocker", "stuck", "waiting on".
Report any found in the Blockers section.

If no blockers found, show `Blockers: none`.
