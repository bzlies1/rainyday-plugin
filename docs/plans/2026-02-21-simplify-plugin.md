# Simplify Rainyday Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strip 9 planning lifecycle skills, add `track` and `done` skills for lightweight item tracking.

**Architecture:** Delete skill directories, create two new skill directories with SKILL.md files. No MCP server changes needed — skills are pure markdown.

**Tech Stack:** Markdown skill files, Rainyday MCP tools (get_item, list_projects, update_item, add_comment), Bash for file deletion.

---

### Task 1: Delete planning lifecycle skill directories

**Files:**
- Delete: `skills/brainstorm/`
- Delete: `skills/write-plan/`
- Delete: `skills/execute-plan/` (includes sub-prompt .md files)
- Delete: `skills/resume-plan/`
- Delete: `skills/finish-plan/`
- Delete: `skills/plan-handoff/`
- Delete: `skills/plan-review/`
- Delete: `skills/plan-status/`
- Delete: `skills/verify/`

**Step 1: Delete the directories**

```bash
rm -rf skills/brainstorm skills/write-plan skills/execute-plan skills/resume-plan skills/finish-plan skills/plan-handoff skills/plan-review skills/plan-status skills/verify
```

**Step 2: Verify only expected skill directories remain**

```bash
ls skills/
```

Expected output (order may vary):
```
create-item  link-commit  log-progress  rainyday  sprint-review  triage
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: remove planning lifecycle skills"
```

---

### Task 2: Create `track` skill

**Files:**
- Create: `skills/track/SKILL.md`

**Step 1: Create the directory and skill file**

Create `skills/track/SKILL.md` with this exact content:

```markdown
---
name: track
description: >
  Track a Rainyday item for this session. Loads item details, moves it to
  In Progress, persists the identifier to .claude/current-task, and posts
  a starting comment.
argument-hint: <identifier>
user-invocable: true
allowed-tools: Bash(mkdir*), Bash(cat*), Write
---

Track a Rainyday item for this coding session. Follow these steps:

1. **Read the identifier**: Use `$ARGUMENTS` as the item identifier (e.g., `PER-22`). If not provided, tell the user to run `/rainyday:track <identifier>` with a valid identifier and stop.

2. **Load the item**: Call `get_item` with the identifier. Display the following to orient the session:
   - Title
   - Type (bug, task, feature, etc.)
   - Current status
   - Description (first 300 chars if long)
   - Assignees (if any)

3. **Move to In Progress**:
   - Call `list_projects` to get valid status IDs for the item's project
   - Find the status with category `in_progress`
   - Call `update_item` to set that status

4. **Persist to `.claude/current-task`**: In the current working directory (not the plugin directory), write a file at `.claude/current-task` with two lines:
   ```
   <identifier>
   <title>
   ```
   Create the `.claude/` directory first if it doesn't exist.

5. **Post a comment**: Call `add_comment` with the message: `Starting work on this item`

6. **Confirm to user**: Tell the user the item is now tracked, that it's been moved to In Progress, and that they can run `/rainyday:done` when finished.
```

**Step 2: Verify file exists**

```bash
ls skills/track/SKILL.md
```

Expected: file path printed with no error.

**Step 3: Commit**

```bash
git add skills/track/SKILL.md
git commit -m "feat: add rainyday:track skill"
```

---

### Task 3: Create `done` skill

**Files:**
- Create: `skills/done/SKILL.md`

**Step 1: Create the directory and skill file**

Create `skills/done/SKILL.md` with this exact content:

```markdown
---
name: done
description: >
  Mark the currently tracked Rainyday item as complete. Reads .claude/current-task,
  prompts for confirmation, moves item to Review status, posts a completion comment,
  and clears the tracking file.
user-invocable: true
allowed-tools: Read, Bash(rm*), Bash(cat*)
---

Complete the currently tracked Rainyday item. Follow these steps:

1. **Read the tracked item**: Read `.claude/current-task` in the current working directory. If the file doesn't exist, tell the user there is no tracked item — they should run `/rainyday:track <identifier>` first, then stop.

   The file has two lines: identifier on line 1, title on line 2.

2. **Confirm with user**: Use AskUserQuestion to ask:
   > "Move **<identifier>: <title>** to Review?"
   Options: "Yes, move to Review" / "No, keep as-is"

3. **On cancel**: Tell the user the item was left unchanged. Stop.

4. **On confirm**:
   - Call `list_projects` to get valid status IDs for the item's project
   - Find the status with category `in_review` (this is the Review column — not `done`)
   - Call `update_item` to set that status
   - Call `add_comment` with the message: `Work complete, moved to review`
   - Delete `.claude/current-task`:
     ```bash
     rm .claude/current-task
     ```
   - Tell the user the item has been moved to Review and the session tracking is cleared.
```

**Step 2: Verify file exists**

```bash
ls skills/done/SKILL.md
```

Expected: file path printed with no error.

**Step 3: Commit**

```bash
git add skills/done/SKILL.md
git commit -m "feat: add rainyday:done skill"
```

---

## Verification

After all tasks are done, verify the full skills directory:

```bash
ls skills/
```

Expected:
```
create-item  done  link-commit  log-progress  rainyday  sprint-review  track  triage
```

8 directories — 6 original + 2 new. If you see any planning lifecycle directories, something went wrong in Task 1.

Load the plugin locally to smoke test:
```bash
claude --plugin-dir /path/to/rainyday-plugin
```

Then try `/rainyday:track` without an argument — it should tell you to provide an identifier. That's enough to confirm the skill loads correctly.
