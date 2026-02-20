# Rainyday Workflow Skills Design

**Date:** 2026-02-20
**Status:** Approved

## Goal

Add 9 workflow skills to the rainyday plugin that replace the superpowers planning/execution chain with Rainyday-backed equivalents. Plans are stored as epics with subtasks in Rainyday, execution progress is tracked via MCP, and the full development lifecycle is managed through the skill chain.

## Architecture

### Skill Chain

```
rainyday:brainstorm → rainyday:write-plan → rainyday:execute-plan → rainyday:finish-plan
```

**Utility skills (invoke anytime):** `plan-status`, `resume-plan`, `plan-review`, `plan-handoff`, `verify`

### Data Model: Epic + Subtasks

Plans map to Rainyday entities using the existing data model (no schema changes needed):

- **Epic item** — the plan container. Type `epic`. Description holds plan overview, architecture, tech stack, and a task index listing all subtask identifiers.
- **Subtask items** — one per implementation task. Type `task`. Description holds full TDD step-by-step details (failing test, run command, implementation, verify, commit message). Linked to epic via `parentItemId`.
- **Comments** — used for progress updates, blocker reports, completion summaries, review notes, and handoff context.
- **Status transitions** — subtasks move `todo → in_progress → done`. Epic stays `in_progress` until all subtasks are done.

### Relationship to Superpowers

Rainyday workflow skills **replace**:
- `superpowers:writing-plans` → `rainyday:write-plan`
- `superpowers:executing-plans` → `rainyday:execute-plan`
- `superpowers:subagent-driven-development` → `rainyday:execute-plan` (subagent mode built-in)

Rainyday workflow skills **still delegate to**:
- `superpowers:finishing-a-development-branch` — git merge/PR/cleanup (called by finish-plan)
- `superpowers:using-git-worktrees` — branch isolation (called by execute-plan at start)
- `superpowers:dispatching-parallel-agents` — orchestration pattern (used internally)
- `superpowers:verification-before-completion` — base discipline (extended by verify)

## Skills

### 1. rainyday:brainstorm (user-invocable)

Identical process to `superpowers:brainstorming` — explore context, ask questions one at a time, propose 2-3 approaches, present design incrementally with user approval.

**Only difference:** terminal step invokes `rainyday:write-plan` instead of `superpowers:writing-plans`.

Still saves design doc to `docs/plans/YYYY-MM-DD-<topic>-design.md` locally as a reference.

### 2. rainyday:write-plan (user-invocable)

**Input:** Approved design (from brainstorming or user-provided).

**Process:**
1. Parse the design into discrete implementation tasks (2-5 min each, TDD steps with full code)
2. Ask user which Rainyday project to use (or detect from context)
3. Call `create_item` to create the epic with full plan overview in description
4. Call `create_subtask` for each task, with full step-by-step details in description
5. Report: "Created epic RD-50 with 4 subtasks (RD-51 through RD-54)"
6. Terminal: offer to start `rainyday:execute-plan` with the epic identifier

**Epic description format:**
```markdown
## Plan: [Title]

**Goal:** [one-liner]
**Branch:** [branch name]
**Created:** [date]

## Architecture
[overview]

## Tech Stack
[dependencies/tools]

## Tasks
- RD-51: [task 1 title]
- RD-52: [task 2 title]
- ...
```

**Subtask description format:**
```markdown
## Task N: [Title]

**Files:**
- Create: path/to/file.ts
- Modify: path/to/existing.ts:123-145
- Test: tests/path/to/test.ts

**Step 1: Write failing test**
[full test code in code block]

**Step 2: Run test to verify it fails**
Run: [exact command]
Expected: [expected output]

**Step 3: Write implementation**
[full implementation code]

**Step 4: Run test to verify it passes**
Run: [exact command]

**Step 5: Commit**
Message: "[commit message]"
```

### 3. rainyday:execute-plan (user-invocable)

**Input:** Epic identifier (e.g., `RD-50`).

**Process:**
1. Call `get_item` on epic to read plan overview and branch name
2. Set up git worktree via `superpowers:using-git-worktrees`
3. Fetch all subtasks via MCP, sort by identifier number
4. For each subtask that isn't `done`:
   a. `update_item` → status: `in_progress`
   b. Read subtask description for full task spec
   c. Dispatch implementer subagent (pass full task text, not just identifier)
   d. If implementer has questions → answer from plan context, redispatch
   e. Dispatch spec reviewer subagent
   f. If spec fails → implementer fixes, re-review
   g. Dispatch code quality reviewer subagent
   h. If quality fails → implementer fixes, re-review
   i. Invoke `rainyday:verify` to confirm tests pass and code matches claims
   j. `update_item` → status: `done`
   k. `add_comment` with completion summary
5. On blocker: `add_comment` with blocker detail, stop, surface to user
6. When all subtasks done → invoke `rainyday:finish-plan`

**Subagent prompts:** Stored as separate `.md` files in the skill directory:
- `implementer-prompt.md` — same pattern as superpowers (full task text, scene-setting, encourage questions, self-review checklist)
- `spec-reviewer-prompt.md` — verify nothing more/less than spec, read actual code not reports
- `code-quality-reviewer-prompt.md` — strengths, issues (critical/important/minor), assessment

### 4. rainyday:verify (internal, not user-invocable)

Extends `superpowers:verification-before-completion` with Rainyday awareness.

Same iron law: **evidence before claims.**

Additional checks:
- Before marking a subtask `done` via MCP, verify tests actually pass (run command, check exit code)
- Before claiming "all tasks complete," call `get_item` on epic and confirm all subtask statuses match
- Prevents subagent reporting success when tests are actually failing

### 5. rainyday:finish-plan (user-invocable)

**Input:** Epic identifier (e.g., `RD-50`).

**Process:**
1. Call `get_item` on epic, fetch all subtasks
2. Verify all subtasks are in `done` status
   - If incomplete: report which are pending, ask user to continue anyway or go back to execute-plan
3. Add summary comment on epic: "Plan completed. X tasks implemented. Files changed: ..."
4. Update epic status → `done`
5. Delegate to `superpowers:finishing-a-development-branch` for git merge/PR/cleanup

### 6. rainyday:plan-status (user-invocable)

**Input:** Epic identifier (e.g., `RD-50`).

Invoke anytime during or after execution.

**Output format:**
```
Plan: Add user authentication (RD-50)
Branch: feature/user-auth
Progress: 2/4 tasks done

  [done]        RD-51  Set up JWT middleware
  [done]        RD-52  Create login endpoint
  [in_progress] RD-53  Add auth tests
  [todo]        RD-54  Wire up frontend

Blockers: none
Last activity: "Completed login endpoint" (2h ago)
```

Reads everything via MCP — no local state needed.

### 7. rainyday:resume-plan (user-invocable)

**Input:** Epic identifier (e.g., `RD-50`).

Handles session interruptions (crashed session, closed terminal, next day).

**Process:**
1. Call `get_item` on epic to read plan overview and branch name
2. Fetch all subtasks, sort by identifier number
3. Detect state:
   - If a subtask is `in_progress` → interrupted mid-task. Read comments for last known progress. Ask user: retry from scratch or continue?
   - Find first subtask not `done` → that's where we resume
4. Check if git worktree/branch still exists locally. If not, recreate it
5. Hand off to `rainyday:execute-plan` starting from the right subtask

Key value: all state lives in Rainyday, so resuming across sessions just works.

### 8. rainyday:plan-review (user-invocable)

**Input:** Epic identifier (e.g., `RD-50`).

Invoke after completion or mid-plan for a checkpoint.

**Process:**
1. Fetch epic + all subtasks + all comments via MCP
2. Analyze history: task order, blocker comments, time between status changes
3. Generate retrospective:
   - **Shipped:** what got done, summary per task
   - **Blockers encountered:** what went wrong, how resolved
   - **Observations:** patterns (e.g., "3 of 4 tasks needed spec review fixes")
4. Post retrospective as comment on epic
5. Present to user in terminal

### 9. rainyday:plan-handoff (user-invocable)

**Input:** Epic identifier + new assignee email.

**Process:**
1. Fetch epic + subtasks + comments
2. Generate handoff summary: what's done, what's left, current branch, gotchas from comments
3. Re-assign remaining `todo`/`in_progress` subtasks to new assignee via `assign_item`
4. Add handoff comment on epic: "Handed off to [name]. Completed: X/Y. Remaining: [list]"
5. Present handoff summary for user to share

## File Structure

```
rainyday-plugin/skills/
├── create-item/SKILL.md          (existing)
├── link-commit/SKILL.md          (existing)
├── log-progress/SKILL.md         (existing)
├── rainyday/SKILL.md             (existing)
├── sprint-review/SKILL.md        (existing)
├── triage/SKILL.md               (existing)
├── brainstorm/SKILL.md           ← NEW
├── write-plan/SKILL.md           ← NEW
├── execute-plan/                  ← NEW
│   ├── SKILL.md
│   ├── implementer-prompt.md
│   ├── spec-reviewer-prompt.md
│   └── code-quality-reviewer-prompt.md
├── verify/SKILL.md               ← NEW
├── finish-plan/SKILL.md          ← NEW
├── plan-status/SKILL.md          ← NEW
├── resume-plan/SKILL.md          ← NEW
├── plan-review/SKILL.md          ← NEW
└── plan-handoff/SKILL.md         ← NEW
```

## Summary

- **9 new skills**, 0 DB changes, 0 MCP tool changes
- Complete replacement for superpowers planning/execution chain
- All plan state stored in Rainyday (epics + subtasks + comments)
- Subagent-per-task execution with two-stage review (spec + code quality)
- Resilient to session interruptions via resume-plan
- Team features: handoff and retrospective via plan-review/plan-handoff
