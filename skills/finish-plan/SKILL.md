---
name: finish-plan
description: >
  Complete a Rainyday plan by verifying all subtasks are done, updating the
  epic status, and delegating to superpowers for git merge/PR/cleanup.
argument-hint: "[epic identifier, e.g. RD-50]"
user-invocable: true
---

# Finish Rainyday Plan

## Overview

Complete a plan by verifying all work is done, closing the epic in Rainyday, and handling the git workflow.

**Announce at start:** "I'm using the finish-plan skill to complete this plan."

## Process

### Step 1: Load and verify the plan

1. Call `get_item` on the epic identifier
2. Parse the `## Tasks` section to get all subtask identifiers
3. Call `get_item` on each subtask
4. Check every subtask status — must be in the `done` category

**If incomplete subtasks exist:**
```
Plan is not fully complete:

  [done]        RD-51  Set up JWT middleware
  [done]        RD-52  Create login endpoint
  [in_progress] RD-53  Add auth tests    <- NOT DONE
  [todo]        RD-54  Wire up frontend  <- NOT DONE

Options:
1. Go back to execute-plan to finish remaining tasks
2. Proceed anyway (mark epic as done despite incomplete subtasks)
3. Cancel (keep everything as-is)
```

Wait for user choice.

### Step 2: Final verification

Run the project's full test suite. Verify all tests pass with evidence.

If tests fail, report and stop. Do not proceed with failing tests.

### Step 3: Close the epic

1. Discover the project's `done` status ID via `list_projects`
2. Call `add_comment` on the epic with a summary:
   ```
   Plan completed.
   Tasks: X/Y done
   Files changed: [list from git diff --stat against base branch]
   All tests passing (N/N pass)
   ```
3. Call `update_item` on the epic: set status to the `done` status ID

### Step 4: Git workflow

Invoke `superpowers:finishing-a-development-branch` which will:
- Present 4 options: merge locally, push & PR, keep as-is, discard
- Execute the chosen option
- Clean up worktree if applicable

## Integration

**Called by:** `rainyday:execute-plan` (when all subtasks are done)
**Delegates to:** `superpowers:finishing-a-development-branch` (for git operations)
