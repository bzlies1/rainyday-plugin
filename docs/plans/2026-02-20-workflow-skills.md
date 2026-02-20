# Rainyday Workflow Skills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use rainyday:execute-plan (once it exists) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 9 workflow skills to the rainyday plugin that replace the superpowers planning/execution chain with Rainyday-backed equivalents using epic + subtask storage.

**Architecture:** Skills are auto-discovered from the `skills/` directory — no manifest changes needed. Each skill is a `SKILL.md` file with YAML frontmatter. Subagent prompt templates are stored as sibling `.md` files in the skill directory. Skills reference MCP tools by name in narrative instructions.

**Tech Stack:** Markdown skill files, YAML frontmatter, Rainyday MCP tools (`list_projects`, `get_item`, `create_item`, `create_subtask`, `update_item`, `add_comment`, `search_items`, `assign_item`)

---

### Task 1: Create brainstorm skill

**Files:**
- Create: `skills/brainstorm/SKILL.md`

**Step 1: Create the skill file**

```markdown
---
name: brainstorm
description: >
  Brainstorm ideas into designs with collaborative dialogue, then transition
  to rainyday:write-plan to store the plan in Rainyday. Use when starting
  planning work that should be tracked in Rainyday.
user-invocable: true
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Checklist

You MUST create a task for each of these items and complete them in order:

1. **Explore project context** — check files, docs, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Write design doc** — save to `docs/plans/YYYY-MM-DD-<topic>-design.md` and commit
6. **Transition to implementation** — invoke `rainyday:write-plan` skill to create epic + subtasks in Rainyday

## Process

**Understanding the idea:**
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**
- Once you believe you understand what you're building, present the design
- Scale each section to its complexity: a few sentences if straightforward, up to 200-300 words if nuanced
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Commit the design document to git

**Implementation:**
- Invoke the `rainyday:write-plan` skill to create a Rainyday epic with subtasks
- Do NOT invoke any other implementation skill. `rainyday:write-plan` is the next step.

## Key Principles

- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended when possible
- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **Incremental validation** — Present design, get approval before moving on
```

**Step 2: Verify the skill file**

Run: `cat skills/brainstorm/SKILL.md | head -5`
Expected: Should show the YAML frontmatter with `name: brainstorm`

**Step 3: Commit**

```bash
git add skills/brainstorm/SKILL.md
git commit -m "feat: add brainstorm skill"
```

---

### Task 2: Create write-plan skill

**Files:**
- Create: `skills/write-plan/SKILL.md`

**Step 1: Create the skill file**

```markdown
---
name: write-plan
description: >
  Create an implementation plan stored as a Rainyday epic with subtasks.
  Parses a design into discrete tasks, creates an epic item, and creates
  subtask items with full TDD step-by-step details. Use after brainstorming
  or when you have an approved design to implement.
argument-hint: "[design topic]"
user-invocable: true
---

# Write Plan to Rainyday

## Overview

Write comprehensive implementation plans as Rainyday epics with subtasks. Each subtask contains everything an engineer needs: files to touch, full code, test commands, expected output, and commit messages.

**Announce at start:** "I'm using the write-plan skill to create the implementation plan in Rainyday."

## Bite-Sized Task Granularity

**Each step in a subtask is one action (2-5 minutes):**
- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement the minimal code to make the test pass" — step
- "Run the tests and make sure they pass" — step
- "Commit" — step

## Process

### Step 1: Identify the design

If invoked after `rainyday:brainstorm`, the approved design is already in context.
Otherwise, read from `docs/plans/` or ask the user for the design/requirements.

### Step 2: Select the Rainyday project

- If the project is obvious from context (e.g., working in a repo tied to one project), confirm it with the user.
- Otherwise, call `list_projects` and ask the user to pick.

### Step 3: Parse into tasks

Break the design into discrete implementation tasks. Each task should be:
- 2-5 minutes of work per step
- Independently testable
- Following TDD (Red-Green-Refactor) cycle
- Ordered by dependency (earlier tasks don't depend on later ones)

### Step 4: Create the epic

Call `create_item` with:
- `project`: selected project shortcode
- `title`: plan title (e.g., "Add user authentication")
- `type`: `"epic"`
- `priority`: based on design priority
- `description`: plan overview in this format:

```markdown
## Plan: [Title]

**Goal:** [one-sentence description]
**Branch:** [planned branch name]
**Created:** [date]

## Architecture
[2-3 sentences about approach]

## Tech Stack
[key technologies/libraries]

## Tasks
- [SUBTASK_ID]: [task 1 title]
- [SUBTASK_ID]: [task 2 title]
- ...

(Task identifiers will be filled after subtask creation)
```

### Step 5: Create subtasks

For each task, call `create_subtask` with:
- `parentIdentifier`: the epic's identifier (e.g., `RD-50`)
- `project`: same project shortcode
- `title`: task title
- `type`: `"task"`
- `priority`: same as epic
- `description`: full TDD step-by-step in this format:

```markdown
## Task N: [Title]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:123-145`
- Test: `tests/exact/path/to/test.ts`

**Step 1: Write the failing test**

\`\`\`typescript
// full test code
\`\`\`

**Step 2: Run test to verify it fails**

Run: `pnpm test:once path/to/test.ts`
Expected: FAIL with "[specific error]"

**Step 3: Write minimal implementation**

\`\`\`typescript
// full implementation code
\`\`\`

**Step 4: Run test to verify it passes**

Run: `pnpm test:once path/to/test.ts`
Expected: PASS

**Step 5: Commit**

Message: "feat: [description]"
```

### Step 6: Update epic description with task index

After all subtasks are created, call `update_item` on the epic to fill in the `## Tasks` section with actual subtask identifiers (e.g., `RD-51`, `RD-52`, etc.).

### Step 7: Report and transition

Report to user:
```
Plan created in Rainyday:

Epic: RD-50 — "Add user authentication"
  ├── RD-51: Set up JWT middleware
  ├── RD-52: Create login endpoint
  ├── RD-53: Add auth tests
  └── RD-54: Wire up frontend

Ready to execute. Invoke rainyday:execute-plan with RD-50 to start.
```

Offer to start execution: invoke `rainyday:execute-plan` with the epic identifier.

## Key Principles

- **Complete code in descriptions** — not "add validation" but the actual code
- **Exact file paths** — always
- **Exact commands with expected output** — always
- **DRY, YAGNI, TDD, frequent commits**
- **Task ordering** — earlier tasks should not depend on later ones
```

**Step 2: Verify the skill file**

Run: `cat skills/write-plan/SKILL.md | head -5`
Expected: Should show YAML frontmatter with `name: write-plan`

**Step 3: Commit**

```bash
git add skills/write-plan/SKILL.md
git commit -m "feat: add write-plan skill"
```

---

### Task 3: Create execute-plan skill with subagent prompts

**Files:**
- Create: `skills/execute-plan/SKILL.md`
- Create: `skills/execute-plan/implementer-prompt.md`
- Create: `skills/execute-plan/spec-reviewer-prompt.md`
- Create: `skills/execute-plan/code-quality-reviewer-prompt.md`

**Step 1: Create the main skill file**

```markdown
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
3. Use `list_items` filtered to the project to find all items, then identify subtasks by checking which are children of the epic (or parse the `## Tasks` section in the epic description for subtask identifiers and call `get_item` on each)
4. Sort subtasks by identifier number (execution order)

### Step 2: Set up workspace

Invoke `superpowers:using-git-worktrees` to create an isolated workspace for implementation.

Use the branch name from the epic description if specified.

### Step 3: Execute subtasks

For each subtask that is not in `done` status, in order:

#### 3a. Mark in-progress

Call `update_item` on the subtask:
- `status`: the project's `in_progress` status ID

(Discover status IDs by calling `list_projects` and finding the status with `category: "in_progress"`)

#### 3b. Dispatch implementer subagent

Use the Task tool with `subagent_type: "general-purpose"`:

- **description:** `"Implement [subtask identifier]: [subtask title]"`
- **prompt:** Use the template from `./implementer-prompt.md`
  - Paste the FULL subtask description (from `get_item`) — do NOT make the subagent read from Rainyday
  - Include scene-setting context from the epic description
  - Include the working directory path

#### 3c. Handle implementer questions

If the implementer subagent asks questions:
- Answer from the plan context (epic description, other subtask descriptions)
- If you can't answer, surface the question to the user
- Redispatch the implementer with answers

#### 3d. Dispatch spec reviewer

Use the Task tool with `subagent_type: "general-purpose"`:

- **description:** `"Review spec compliance for [subtask identifier]"`
- **prompt:** Use the template from `./spec-reviewer-prompt.md`
  - Include the FULL subtask description (requirements)
  - Include the implementer's report (what they claim to have built)

**If spec review fails (❌):**
1. Call `add_comment` on subtask: `"Spec review failed: [issues]"`
2. Redispatch implementer with the issues to fix
3. Re-run spec review
4. Repeat until ✅

#### 3e. Dispatch code quality reviewer

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

#### 3f. Verify and complete

1. Invoke `rainyday:verify` — run tests, confirm they pass with evidence
2. Call `update_item` on subtask: set status to the project's `done` status ID
3. Call `add_comment` on subtask: `"Completed: [summary of what was implemented]. Files: [list]. Tests: [pass/fail count]."`

### Step 4: Handle blockers

If a subtask is blocked:
1. Call `add_comment` on subtask: `"BLOCKED: [reason]"`
2. Stop execution
3. Surface the blocker to the user
4. Wait for user guidance before continuing

### Step 5: Complete

When all subtasks are done:
1. Call `add_comment` on epic: `"All tasks completed. Ready for finishing."`
2. Invoke `rainyday:finish-plan` with the epic identifier

## Red Flags — NEVER

- Start implementation without setting up a worktree
- Skip spec review or code quality review
- Proceed with unfixed critical issues
- Dispatch multiple implementer subagents in parallel (conflicts)
- Make subagent read from Rainyday (provide full text)
- Skip review loops if reviewer found issues
- Start code quality review before spec compliance passes
- Mark a subtask as done without verification evidence
```

**Step 2: Create implementer-prompt.md**

```markdown
# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent via the Task tool.

```
Task tool (subagent_type: "general-purpose"):
  description: "Implement [IDENTIFIER]: [TITLE]"
  prompt: |
    You are implementing a task from a Rainyday plan.

    ## Task Description

    [PASTE FULL subtask description from get_item — includes Files, Steps 1-5]

    ## Context

    [Paste relevant sections from epic description — architecture, tech stack,
     how this task fits into the overall plan, any dependencies on prior tasks]

    ## Working Directory

    [Path to worktree]

    ## Before You Begin

    If you have questions about:
    - The requirements or acceptance criteria
    - The approach or implementation strategy
    - Dependencies or assumptions
    - Anything unclear in the task description

    **Ask them now.** Raise any concerns before starting work.

    ## Your Job

    Once you're clear on requirements:
    1. Follow the steps exactly as written in the task description
    2. Write tests first (TDD — Step 1, Step 2)
    3. Implement (Step 3, Step 4)
    4. Commit (Step 5)
    5. Self-review (see below)
    6. Report back

    **While you work:** If you encounter something unexpected or unclear,
    **ask questions**. Don't guess or make assumptions.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes:

    **Completeness:**
    - Did I fully implement everything in the spec?
    - Did I miss any requirements?
    - Are there edge cases I didn't handle?

    **Quality:**
    - Is this my best work?
    - Are names clear and accurate?
    - Is the code clean and maintainable?

    **Discipline:**
    - Did I avoid overbuilding (YAGNI)?
    - Did I only build what was requested?
    - Did I follow existing patterns in the codebase?

    **Testing:**
    - Do tests actually verify behavior?
    - Did I follow TDD (red then green)?
    - Are tests comprehensive?

    If you find issues during self-review, fix them now before reporting.

    ## Report Format

    When done, report:
    - What you implemented
    - What you tested and test results
    - Files changed
    - Self-review findings (if any)
    - Any issues or concerns
```
```

**Step 3: Create spec-reviewer-prompt.md**

```markdown
# Spec Compliance Reviewer Prompt Template

Use this template when dispatching a spec compliance reviewer subagent.

**Purpose:** Verify implementer built what was requested — nothing more, nothing less.

```
Task tool (subagent_type: "general-purpose"):
  description: "Review spec compliance for [IDENTIFIER]"
  prompt: |
    You are reviewing whether an implementation matches its specification.

    ## What Was Requested

    [PASTE FULL subtask description — the spec]

    ## What Implementer Claims They Built

    [PASTE implementer's report]

    ## CRITICAL: Do Not Trust the Report

    The implementer's report may be incomplete, inaccurate, or optimistic.
    You MUST verify everything independently.

    **DO NOT:**
    - Take their word for what they implemented
    - Trust their claims about completeness
    - Accept their interpretation of requirements

    **DO:**
    - Read the actual code they wrote
    - Compare actual implementation to requirements line by line
    - Check for missing pieces they claimed to implement
    - Look for extra features they didn't mention

    ## Your Job

    Read the implementation code and verify:

    **Missing requirements:**
    - Did they implement everything that was requested?
    - Are there requirements they skipped or missed?
    - Did they claim something works but didn't actually implement it?

    **Extra/unneeded work:**
    - Did they build things that weren't requested?
    - Did they over-engineer or add unnecessary features?

    **Misunderstandings:**
    - Did they interpret requirements differently than intended?
    - Did they solve the wrong problem?

    **Verify by reading code, not by trusting report.**

    ## Report

    - ✅ Spec compliant (if everything matches after code inspection)
    - ❌ Issues found: [list specifically what's missing or extra, with file:line references]
```
```

**Step 4: Create code-quality-reviewer-prompt.md**

```markdown
# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built — clean, tested, maintainable.

**Only dispatch after spec compliance review passes.**

```
Task tool (subagent_type: "general-purpose"):
  description: "Code quality review for [IDENTIFIER]"
  prompt: |
    You are reviewing code quality for a recently implemented task.

    ## What Was Implemented

    [PASTE implementer's report]

    ## Requirements

    [PASTE subtask description]

    ## Your Job

    Review the code changes for quality. Focus on:

    **Code Quality:**
    - Is the code clean and readable?
    - Are names clear and descriptive?
    - Is the logic straightforward?
    - Are there any code smells?

    **Testing:**
    - Do tests verify actual behavior (not just mock behavior)?
    - Are edge cases covered?
    - Would tests catch regressions?

    **Patterns:**
    - Does the code follow existing codebase patterns?
    - Are there inconsistencies with the rest of the project?

    **Security:**
    - Any obvious security issues (injection, XSS, etc.)?
    - Is input validation adequate?

    **Performance:**
    - Any obvious performance issues?
    - Unnecessary work or redundant operations?

    ## Report Format

    **Strengths:** What was done well

    **Issues:**
    - 🔴 Critical: Must fix before merging [file:line — description]
    - 🟡 Important: Should fix [file:line — description]
    - 🔵 Minor: Nice to fix [file:line — description]

    **Assessment:** APPROVE / REQUEST CHANGES (only for critical issues)
```
```

**Step 5: Verify all files exist**

Run: `ls -la skills/execute-plan/`
Expected: Should show SKILL.md, implementer-prompt.md, spec-reviewer-prompt.md, code-quality-reviewer-prompt.md

**Step 6: Commit**

```bash
git add skills/execute-plan/
git commit -m "feat: add execute-plan skill with subagent prompts"
```

---

### Task 4: Create verify skill

**Files:**
- Create: `skills/verify/SKILL.md`

**Step 1: Create the skill file**

```markdown
---
name: verify
description: >
  Verify completion claims with evidence before updating Rainyday status.
  Extends superpowers verification discipline with Rainyday-aware checks.
  Ensures tests pass and item states match reality before marking done.
user-invocable: false
---

# Rainyday Verification

## Overview

Evidence before claims, always. This skill extends `superpowers:verification-before-completion` with Rainyday-specific checks.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
NO RAINYDAY STATUS UPDATES WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot:
- Claim tests pass
- Mark a subtask as `done` via `update_item`
- Claim a plan is complete
- Post a completion comment via `add_comment`

## The Gate Function

```
BEFORE updating any Rainyday item status to done:

1. IDENTIFY: What command proves this task is complete?
2. RUN: Execute the FULL test command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: Do NOT update Rainyday. State actual status with evidence.
   - If YES: Update Rainyday WITH evidence in the comment.
5. ONLY THEN: Call update_item to mark done.

Skip any step = lying, not verifying
```

## Rainyday-Specific Checks

**Before marking a subtask done:**
- Run the test command specified in the subtask description
- Verify exit code is 0 and all tests pass
- Include test output evidence in the `add_comment` call

**Before claiming a plan is complete:**
- Call `get_item` on every subtask identifier
- Verify each subtask status is actually in the `done` category
- Do NOT trust cached state — fetch fresh from Rainyday

**Before posting a completion comment:**
- The comment must include verifiable evidence (test counts, exit codes)
- Not just "completed" but "completed — 12/12 tests pass, exit 0"

## Red Flags — STOP

- Using "should", "probably", "seems to"
- About to call `update_item` with done status without test evidence
- About to call `add_comment` with "completed" without verification
- Trusting a subagent's success report without independent verification
- Relying on a previous test run (must be fresh, this message)
```

**Step 2: Commit**

```bash
git add skills/verify/SKILL.md
git commit -m "feat: add verify skill"
```

---

### Task 5: Create finish-plan skill

**Files:**
- Create: `skills/finish-plan/SKILL.md`

**Step 1: Create the skill file**

```markdown
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
  [in_progress] RD-53  Add auth tests    ← NOT DONE
  [todo]        RD-54  Wire up frontend  ← NOT DONE

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

1. Call `add_comment` on the epic with a summary:
   ```
   Plan completed.
   Tasks: X/Y done
   Files changed: [list from git diff --stat against base branch]
   All tests passing (N/N pass)
   ```
2. Call `update_item` on the epic: set status to the project's `done` status ID

### Step 4: Git workflow

Invoke `superpowers:finishing-a-development-branch` which will:
- Present 4 options: merge locally, push & PR, keep as-is, discard
- Execute the chosen option
- Clean up worktree if applicable

## Integration

**Called by:** `rainyday:execute-plan` (when all subtasks are done)
**Delegates to:** `superpowers:finishing-a-development-branch` (for git operations)
```

**Step 2: Commit**

```bash
git add skills/finish-plan/SKILL.md
git commit -m "feat: add finish-plan skill"
```

---

### Task 6: Create plan-status skill

**Files:**
- Create: `skills/plan-status/SKILL.md`

**Step 1: Create the skill file**

```markdown
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
```

**Step 2: Commit**

```bash
git add skills/plan-status/SKILL.md
git commit -m "feat: add plan-status skill"
```

---

### Task 7: Create resume-plan skill

**Files:**
- Create: `skills/resume-plan/SKILL.md`

**Step 1: Create the skill file**

```markdown
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
```

**Step 2: Commit**

```bash
git add skills/resume-plan/SKILL.md
git commit -m "feat: add resume-plan skill"
```

---

### Task 8: Create plan-review skill

**Files:**
- Create: `skills/plan-review/SKILL.md`

**Step 1: Create the skill file**

```markdown
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
3. Call `get_item` on each subtask (includes comments and status history)
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
```

**Step 2: Commit**

```bash
git add skills/plan-review/SKILL.md
git commit -m "feat: add plan-review skill"
```

---

### Task 9: Create plan-handoff skill

**Files:**
- Create: `skills/plan-handoff/SKILL.md`

**Step 1: Create the skill file**

```markdown
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
```

**Step 2: Commit**

```bash
git add skills/plan-handoff/SKILL.md
git commit -m "feat: add plan-handoff skill"
```

---

## Summary

| Task | Skill | Files | Depends On |
|------|-------|-------|-----------|
| 1 | brainstorm | 1 | — |
| 2 | write-plan | 1 | — |
| 3 | execute-plan + prompts | 4 | — |
| 4 | verify | 1 | — |
| 5 | finish-plan | 1 | — |
| 6 | plan-status | 1 | — |
| 7 | resume-plan | 1 | — |
| 8 | plan-review | 1 | — |
| 9 | plan-handoff | 1 | — |

**Total: 12 files, 9 commits, 0 code changes (all markdown)**

All tasks are independent — they can be executed in any order since each creates a standalone skill file.
