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
    2. **If TDD preference: yes** → follow TDD steps as written (write failing test first, watch it fail, then implement)
       **If TDD preference: no** → implement directly, then run a code quality review before committing
    3. Commit your work
    4. Self-review (see below)
    5. Report back

    TDD preference: [TDD_YES_OR_NO]

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

    **Testing / Quality:**
    - If TDD was used: did I write the test first and watch it fail? Do tests verify behavior (not just mock behavior)?
    - If TDD was skipped: did I run a code quality review and address all issues?
    - Is the implementation solid and correct?

    If you find issues during self-review, fix them now before reporting.

    ## Report Format

    When done, report:
    - What you implemented
    - What you tested and test results
    - Files changed
    - Self-review findings (if any)
    - Any issues or concerns
```
