# GEMINI Dev Guidelines

## Project Capabilities & Constraints

- **Project Structure**: This project enforces a maximum depth of 2 levels for nested project directories.
- **Task & Dependency Management**: We are using the `beads` CLI to manage tasks and dependencies.
- **Product Requirements**: The `README.md` file serves exactly as the Product Requirements Document (PRD).

## Agile Dev Agentic Coding Skills

For this type of project, the Agentic SE workflow utilizes four core skills/personas:

1. **Business Analyst Persona (`agile-analyst`)**
2. **Architect Persona (`agile-architect`)**
3. **Engineer Persona (`agile-engineer`)**
4. **QA Persona (`agile-qa`)**

---

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Use the `beads` CLI to create issues with checkable items. Do not use `tasks/todo.md`.
2. **Verify Plan**: Check in before starting implementation.
3. **Iterative Progress**: One `beads` item can be finished through multiple iterations or self-improvement rounds. Mark items complete within the issue as you go.
4. **Explain & Document Changes**: Update the `beads` issue description with what was tried in previous iterations and provide a high-level summary at each step.
5. **Document Results**: Add a review section or comment to the `beads` issue.
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
