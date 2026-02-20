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

### Step 3: Ask about TDD preference

Before writing subtask descriptions, ask the user:
> "Do you want subtasks written with TDD steps (write failing test first, then implement), or skip straight to implementation with a code quality review at the end?"

- **TDD: yes** → use the TDD subtask template below
- **TDD: no** → use the non-TDD subtask template below

### Step 4: Parse into tasks

Break the design into discrete implementation tasks. Each task should be:
- 2-5 minutes of work per step
- Independently testable
- Ordered by dependency (earlier tasks don't depend on later ones)

### Step 5: Create the epic

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

### Step 6: Create subtasks

For each task, call `create_subtask` with:
- `parentIdentifier`: the epic's identifier (e.g., `RD-50`)
- `project`: same project shortcode
- `title`: task title
- `type`: `"task"`
- `priority`: same as epic
- `description`: use the template matching the user's TDD preference:

**If TDD: yes** — use this format:

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

**If TDD: no** — use this format:

```markdown
## Task N: [Title]

**Files:**
- Create/Modify: `exact/path/to/file.ts`

**Step 1: Implement**

\`\`\`typescript
// full implementation code
\`\`\`

**Step 2: Verify**

Run: `pnpm build` or `pnpm test:once path/to/test.ts`
Expected: no errors / PASS

**Step 3: Commit**

Message: "feat: [description]"
```

### Step 7: Update epic description with task index

After all subtasks are created, call `update_item` on the epic to fill in the `## Tasks` section with actual subtask identifiers (e.g., `RD-51`, `RD-52`, etc.).

### Step 8: Report and transition

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
- **DRY, YAGNI, frequent commits** — TDD when user opts in
- **Task ordering** — earlier tasks should not depend on later ones
