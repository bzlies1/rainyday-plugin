---
name: execute-plan
description: >
  Execute a Rainyday plan by dispatching subagents per subtask with two-stage
  review. Reads the epic and subtasks from Rainyday, implements each task via
  fresh subagents, updates status via MCP, and records progress as comments.
argument-hint: "[epic identifier, e.g. RD-50]"
user-invocable: true
---

# Execute Rainyday Plan

## Overview

Execute an implementation plan stored as a Rainyday epic. For each subtask, dispatch a fresh implementer subagent, run spec and code quality reviews, then update Rainyday status via MCP.

**Announce at start:** "I'm using the execute-plan skill to implement the plan from Rainyday."

## Prerequisites

- A Rainyday epic with subtasks (created by `rainyday:write-plan`)
- The epic identifier (e.g., `RD-50`) — from arguments or ask the user

## Process

### Step 1: Load the plan

1. Call `get_item` with the epic identifier to read the plan overview
2. Extract the branch name from the epic description
3. Parse the `## Tasks` section in the epic description for subtask identifiers
4. Call `get_item` on each subtask to get full details
5. Sort subtasks by identifier number (execution order)

### Step 2: Set up workspace

Invoke `superpowers:using-git-worktrees` to create an isolated workspace for implementation.

Use the branch name from the epic description if specified.

### Step 3: Discover status IDs

Call `list_projects` and find the project's status definitions. You need:
- The status ID with `category: "in_progress"` (for marking tasks started)
- The status ID with `category: "done"` (for marking tasks complete)

### Step 4: Execute subtasks

For each subtask that is not in `done` status, in order:

#### 4a. Mark in-progress

Call `update_item` on the subtask with `status` set to the `in_progress` status ID.

#### 4b. Dispatch implementer subagent

Use the Task tool with `subagent_type: "general-purpose"`:

- **description:** `"Implement [subtask identifier]: [subtask title]"`
- **prompt:** Use the template from `./implementer-prompt.md`
  - Paste the FULL subtask description (from `get_item`) — do NOT make the subagent read from Rainyday
  - Include scene-setting context from the epic description
  - Include the working directory path

#### 4c. Handle implementer questions

If the implementer subagent asks questions:
- Answer from the plan context (epic description, other subtask descriptions)
- If you can't answer, surface the question to the user
- Redispatch the implementer with answers

#### 4d. Dispatch spec reviewer

Use the Task tool with `subagent_type: "general-purpose"`:

- **description:** `"Review spec compliance for [subtask identifier]"`
- **prompt:** Use the template from `./spec-reviewer-prompt.md`
  - Include the FULL subtask description (requirements)
  - Include the implementer's report (what they claim to have built)

**If spec review fails:**
1. Call `add_comment` on subtask: `"Spec review failed: [issues]"`
2. Redispatch implementer with the issues to fix
3. Re-run spec review
4. Repeat until spec reviewer returns ✅

#### 4e. Dispatch code quality reviewer

Use the Task tool with `subagent_type: "general-purpose"`:

- **description:** `"Code quality review for [subtask identifier]"`
- **prompt:** Use the template from `./code-quality-reviewer-prompt.md`
  - Include the implementer's report
  - Include the subtask requirements

**If critical issues found:**
1. Call `add_comment` on subtask: `"Code quality issues: [issues]"`
2. Redispatch implementer to fix critical issues
3. Re-run code quality review
4. Repeat until no critical issues

#### 4f. Verify and complete

1. Invoke `rainyday:verify` — run tests, confirm they pass with evidence
2. Call `update_item` on subtask: set status to the `done` status ID
3. Call `add_comment` on subtask: `"Completed: [summary of what was implemented]. Files: [list]. Tests: [pass/fail count]."`

### Step 5: Handle blockers

If a subtask is blocked:
1. Call `add_comment` on subtask: `"BLOCKED: [reason]"`
2. Stop execution
3. Surface the blocker to the user
4. Wait for user guidance before continuing

### Step 6: Complete

When all subtasks are done:
1. Call `add_comment` on epic: `"All tasks completed. Ready for finishing."`
2. Invoke `rainyday:finish-plan` with the epic identifier

## Red Flags — NEVER

- Start implementation without setting up a worktree
- Skip spec review or code quality review
- Proceed with unfixed critical issues
- Dispatch multiple implementer subagents in parallel (conflicts)
- Make subagent read from Rainyday (provide full text instead)
- Skip review loops if reviewer found issues
- Start code quality review before spec compliance passes
- Mark a subtask as done without verification evidence
