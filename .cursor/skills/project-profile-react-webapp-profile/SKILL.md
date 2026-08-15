---
name: project-profile-react-webapp-profile
description: "Use this skill to apply baseline structure and quality standards for React and Vite web applications."
---

# React Webapp Profile Skill

## Purpose

Use this skill to apply baseline structure and quality standards for React and Vite web applications.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/project-profile/react-webapp-profile.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that apply baseline structure and quality standards for React and Vite web applications.

Also use it when the user manually invokes the skill by name:

```text
/project-profile-react-webapp-profile
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

1. Apply the profile before designing architecture or file placement.
2. Inspect project framework, routing, build system, state strategy, and deployment model.
3. Use the profile to choose conventions for components, APIs, tests, docs, and config.
4. Avoid adding profile-specific technology that is not already present or explicitly requested.
5. Record any project-specific deviation in docs or handoff notes.

## Safety Rules

- Do not force a profile onto an incompatible codebase.
- Do not add major stack changes without explicit request.
- Do not ignore the project connection and deployment model.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `framework detection`
- `routing check`
- `build config review`
- `profile compatibility review`


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
