---
name: frontend-accessibility-standard
description: "Use this skill to verify semantic markup, keyboard behavior, focus states, labels, names, contrast, and screen reader support."
---

# Accessibility Standard Skill

## Purpose

Use this skill to verify semantic markup, keyboard behavior, focus states, labels, names, contrast, and screen reader support.

This skill is the operational workflow that supports the related Cursor rule:

```text
.cursor/rules/frontend/accessibility-standard.mdc
```

Rules decide when behavior should apply. Skills define how the agent should execute the workflow when the task calls for it.

## When To Use

Use this skill when the user request, changed files, or related rule indicates that verify semantic markup, keyboard behavior, focus states, labels, names, contrast, and screen reader support.

Also use it when the user manually invokes the skill by name:

```text
/frontend-accessibility-standard
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

1. Check semantic elements, ARIA only when needed, keyboard navigation, focus visibility, labels, and contrast.
2. Verify modals, menus, forms, tabs, and custom controls without a mouse.
3. Inspect existing components, routes, styles, tokens, and UI primitives.
4. Find the closest existing pattern before adding a new one.
5. Implement with typed props, semantic markup, accessible interactions, and responsive behavior.
6. Check loading, empty, error, success, hover, focus, and disabled states.
7. Run build, lint, typecheck, and component tests when available.

## Safety Rules

- Do not create inaccessible interactive elements.
- Do not hardcode design values when tokens exist.
- Do not add decorative motion that reduces usability.
- Do not hide uncertainty. Report unclear assumptions and unresolved risk.
- Do not make broad unrelated edits while executing this skill.
- Do not mark the task complete if the core workflow was skipped.

## Verification Checklist

Run or consider these checks based on the project tooling:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `component tests when available`
- `manual responsive review notes`


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
