---
name: "Project Bootstrap"
description: "Design a new project bootstrap plan with reusable directory structure, development conventions, and validation steps. Use when starting a new repo or aligning an existing repo before first implementation."
argument-hint: "Describe the stack and project shape, e.g. 'vite react admin app with auth and dashboard'"
agent: "agent"
model: "GPT-5 (copilot)"
---

Use [project bootstrap conventions](../skills/project-bootstrap-conventions/SKILL.md) as the governing workflow for this task.

Task:

- Decide whether this request is Greenfield Bootstrap or Existing Repo Alignment.
- Collect explicit inputs from the user request first, then apply documented defaults only where needed.
- Use the bundled templates in [scaffold tree](../skills/project-bootstrap-conventions/templates/scaffold-tree.md) and [init checklist](../skills/project-bootstrap-conventions/templates/init-checklist.md).
- Return results using the required response shape defined by the skill: Scope, Assumptions, Structure, Conventions, Validation, Next Actions.
- Default to a text proposal only. Create files or directories only if the user explicitly asks to initialize or write them.

Constraints:

- Do not copy business-specific roles, routes, API names, or component names from the source repository.
- Do not generate large amounts of feature code during bootstrap planning.
- Do not leave unresolved angle-bracket placeholders in the final response.
- Prefer the smallest reusable scaffold that can pass typecheck, lint, and test setup validation.