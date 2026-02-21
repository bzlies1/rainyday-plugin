# Simplify Rainyday Plugin Design

**Date:** 2026-02-21

## Problem

The plugin has accumulated a heavy planning lifecycle (brainstorm → write-plan → execute-plan → resume-plan → finish-plan + handoff/review/status skills) that's too complex for day-to-day use. The real value is lightweight project management: track what you're working on, log progress, and update statuses.

## Goal

Strip the plugin down to a focused PM helper. Two new skills replace the entire planning lifecycle.

## What Gets Removed

Delete these 9 skills entirely:

- `brainstorm` — superpowers:brainstorm covers this
- `write-plan`
- `execute-plan` (+ sub-prompts)
- `resume-plan`
- `finish-plan`
- `plan-handoff`
- `plan-review`
- `plan-status`
- `verify` — superpowers:verification-before-completion covers this

## What Stays

Unchanged:

- `rainyday` — background knowledge, auto-loaded
- `log-progress`
- `link-commit`
- `sprint-review`
- `triage`
- `create-item`

## New Skills

### `/rainyday:track <identifier>`

1. Load item via `get_item`
2. Display title, type, status, description, assignees
3. Look up valid status IDs via `list_projects`, move item to In Progress
4. Write `.claude/current-task` in the current working directory: `<identifier>\n<title>`
5. Post a comment: "Starting work on this item"

### `/rainyday:done`

1. Read `.claude/current-task` — surface an error if not found
2. Show item identifier + title, ask user to confirm "Move to Review?"
3. On confirm: look up valid status IDs, move to Review status, post comment "Work complete, moved to review", delete `.claude/current-task`
4. On cancel: do nothing, leave file in place

## Persistence

`.claude/current-task` lives in the project working directory (not the plugin directory). This survives context compression. It should be `.gitignore`'d by the user's repo — the skill does not manage that.

## Chosen Approach

Explicit two-skill flow (track + done). Rejected:
- Hook into `finishing-a-development-branch` — ties Rainyday into a superpowers skill we don't own
- Background auto-loading — creates hidden dependencies across skills, hard to debug
