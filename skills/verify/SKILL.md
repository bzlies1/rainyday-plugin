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

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Subtask done | Fresh test run + evidence | Subagent says "done" |
| Plan complete | `get_item` on ALL subtasks showing done | Cached status from earlier |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence is not evidence |
| "The subagent said it passed" | Verify independently |
| "I checked earlier" | Earlier is not now |
| "Partial check is enough" | Partial proves nothing |
