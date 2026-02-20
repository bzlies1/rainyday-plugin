---
name: resume-plan
description: >
  Resume execution of a Rainyday plan after a session interruption. Detects
  where execution left off by reading Rainyday state and picks up from there.
argument-hint: "[epic identifier, e.g. RD-50]"
user-invocable: true
---

# Resume Rainyday Plan

## Overview

Resume a plan that was interrupted (crashed session, closed terminal, next day). All state lives in Rainyday, so resumption reads from MCP and picks up where things left off.

**Announce at start:** "I'm using the resume-plan skill to pick up where we left off."

## Process

### Step 1: Load plan state from Rainyday

1. Call `get_item` on the epic identifier
2. Parse the `## Tasks` section for subtask identifiers
3. Call `get_item` on each subtask to get current status and comments
4. Call `list_projects` to map status IDs to categories

### Step 2: Detect execution state

Categorize each subtask:
- **done** — completed in a previous session
- **in_progress** — was being worked on when session was interrupted
- **todo** — not yet started

### Step 3: Handle interrupted tasks

If any subtask is `in_progress`:
1. Read its comments for the last known progress
2. Check `git log` for commits related to this task
3. Present to user:

```
Found interrupted task:

  [in_progress] RD-53  Add auth tests

  Last comment: "Completed Step 3. Tests passing." (from previous session)
  Recent commits: abc1234 "feat: add auth test fixtures"

  Options:
  1. Continue from where it left off (attempt to pick up at Step 4)
  2. Retry from scratch (reset to Step 1)
  3. Skip this task (mark as done or leave in-progress)
```

Wait for user choice.

### Step 4: Restore workspace

1. Extract branch name from epic description
2. Check if the branch exists locally: `git branch --list [branch-name]`
3. Check for existing worktree: `git worktree list`
4. If branch/worktree exists, switch to it
5. If not, create a new worktree via `superpowers:using-git-worktrees` using the existing branch

### Step 5: Resume execution

Determine the first subtask that is not `done` and hand off to `rainyday:execute-plan` starting from that subtask.

Report before resuming:
```
Resuming plan: [epic title] ([epic identifier])
Progress: X/Y tasks done
Resuming from: RD-53 — Add auth tests
```
