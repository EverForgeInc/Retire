---
name: global-content-style-cleanup
description: "Use this skill to clean user-facing copy, preserve product tone, update translations, and remove banned punctuation such as the U+2014 em dash."
---

# Content Style Cleanup Skill

## Purpose

Use this skill to clean user-facing copy, preserve product tone, update translations, and remove banned punctuation such as the U+2014 em dash.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/global/content-style-cleanup.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that clean user-facing copy, preserve product tone, update translations, and remove banned punctuation such as the U+2014 em dash.

Also use it when the user manually invokes the skill by name:

```text
/global-content-style-cleanup
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

1. Search changed user-facing files for U+2014 and remove every hit.
2. Replace banned punctuation with commas, periods, colons, parentheses, or rewritten sentences.
3. Check translations when source copy changes.
4. Verify labels, errors, headings, and empty states still fit the UI.
5. Inspect the repository before changing behavior.
6. Identify the smallest safe change that satisfies the request.
7. Prefer existing patterns over new architecture.
8. Verify the change with the available project checks.
9. Report what changed, what was checked, and what remains.

## Safety Rules

- Do not create broad architecture changes when a narrow change works.
- Do not introduce new dependencies without justification.
- Do not leave verification ambiguous.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `git status`
- `git diff`
- `project build or lint command`
- `task-specific validation`


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
