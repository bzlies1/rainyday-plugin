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
