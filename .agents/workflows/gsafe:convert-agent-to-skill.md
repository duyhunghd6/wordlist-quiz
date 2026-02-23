---
description: Converts a BMAD agent persona markdown file into an Antigravity Skill
---

# Convert Agent to Skill Workflow

This workflow is designed to convert a legacy BMAD agent definition (e.g., from `.agents/agents/`) into a native Antigravity Skill.

## 1. Understand the Target Agent

- Ask the user for the path to the target agent markdown file if they haven't provided it (e.g., `.agents/agents/analyst.md`).
- Read the file using the `view_file` tool to understand the agent's definition.
- Parse the YAML block to extract:
  - `agent.name`, `agent.id`, `agent.title`, `agent.whenToUse`
  - `persona.role`, `persona.style`, `persona.identity`, `persona.focus`, `persona.core_principles`
  - `commands` and `dependencies`

## 2. Map Commands to Workflows

- Analyze the extracted commands and their corresponding dependencies (tasks, templates, data).
- Map each legacy command to its Antigravity equivalent (usually a `/gsafe:` workflow slash command).
- For example, if a command triggers a task called `create-doc.md`, map it to instruct the agent to run the `/gsafe:create-doc` workflow.

## 3. Generate the SKILL.md

- Determine the destination path: `.agents/skills/<agent.id>/SKILL.md`. Use the `write_to_file` tool to create this file.
- Format the `SKILL.md` file using the standard Antigravity structure:

```markdown
---
name: [agent.title] Persona
description: [agent.whenToUse]
---

# [agent.title] Operating Guidelines

When instructed to use this skill, or when handling tasks related to [agent.focus], adopt the following persona and capabilities.

## 1. Identity & Persona

- **Role:** [persona.role]
- **Style:** [persona.style]
- **Identity:** [persona.identity]
- **Focus:** [persona.focus]

## 2. Core Principles

Follow these principles strictly during execution:
[List the persona.core_principles]

## 3. Workflows & Capabilities

When the user requests an action, utilize the following mapped workflows instead of legacy commands:
[List the mapped slash commands and what they do. E.g.:]

- Use `/gsafe:[workflow-name]` for [purpose], utilizing template `[template-name]`.
```

## 4. Final Review

- Once created, notify the user that the skill has been successfully generated at `.agents/skills/<agent.id>/SKILL.md`.
- Advise the user that they can now invoke this skill in future prompts (e.g., "Use the [agent.id] skill to...") and use the newly mapped workflows.
