---
name: testing-component-test-standard
description: "Use this skill to test React and UI components for rendering, user behavior, accessibility, and states."
---

# Component Test Standard Skill

## Purpose

Use this skill to test React and UI components for rendering, user behavior, accessibility, and states.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/testing/component-test-standard.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that test React and UI components for rendering, user behavior, accessibility, and states.

Also use it when the user manually invokes the skill by name:

```text
/testing-component-test-standard
```

## Inputs To Inspect

Before making changes, inspect the most relevant available inputs:

- The related rule file, if present
- Current repository structure
- Existing implementation patterns
- Relevant config files
- Relevant tests
- Recent diffs
- Project documentation
- Project connection metadata when deployment or external services are involved

## Required Workflow

1. Identify the risk introduced by the change.
2. Choose the smallest useful test type that proves the behavior.
3. Cover success, failure, edge, and regression paths where relevant.
4. Use deterministic fixtures and safe test data.
5. Run the targeted test and broader suite when practical.

## Safety Rules

- Do not use real secrets or real user data.
- Do not mark work done when targeted tests fail.
- Do not add brittle tests that depend on timing or external services without control.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `targeted test command`
- `broader suite when practical`
- `fixture safety review`


Also verify:

- The implementation matches the related rule.
- The diff is limited to the requested work.
- User-facing behavior is correct.
- Tests or checks were run, or skipped with a clear reason.
- No secrets, credentials, or sensitive data were introduced.

## Output Expectations

When finished, report:

- What changed
- What files or areas were affected
- What checks were run
- What checks were skipped and why
- Any risks, assumptions, or follow-up items

## Failure Handling

If the workflow cannot be completed:

1. Stop before making unsafe changes.
2. Explain the blocker clearly.
3. Preserve any useful partial work if it is safe.
4. Suggest the smallest next safe action.

Do not continue by guessing when the missing information affects safety, data integrity, deployment, security, or production behavior.
