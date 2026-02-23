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

## Task Management (Beads CLI Workflows)

All four personas (Analyst, Architect, Engineer, QA) must strictly follow this `beads` CLI task management workflow. Do NOT use `tasks/todo.md`.

### 1. Check & Claim (All Personas)

- NEVER start work blindly. Run `bd ready --json` to find unblocked work.
- Review task context: `bd show <id> --json`.
- Claim atomically: `bd update <id> --claim --json`.

### 2. Persona-Specific Execution

- **`agile-analyst`**: Create epics/tasks (`bd create ... -t feature -p 2`), execute research templates (`/gsafe:create-doc`, `/gsafe:facilitate-brainstorming-session`, etc).
- **`agile-architect`**: Break down epics into technical stories (`bd create ... -t story --deps parent:<epic_id>`), execute design workflows (`/gsafe:risk-profile`, etc).
- **`agile-engineer`**: Execute implementation sequentially (`/gsafe:execute-checklist`). Track discovered bugs immediately (`bd create "Found X" -t bug --deps discovered-from:<id>`).
- **`agile-qa`**: Review implementations (`/gsafe:qa-gate`), address feedback (`/gsafe:apply-qa-fixes`), or reject/fail items with clear reasons (`bd update <id> --fail "Reason"`).

### 3. Iterative Progress & Documentation

- **Explain Changes**: One `beads` item can be finished through multiple iterations. Update the issue description with what was tried in previous iterations and provide a high-level summary at each step.
- **Document Results**: Add a review section or comment to the `beads` issue upon completion.
- **Capture Lessons**: Update `tasks/lessons.md` after any self-correction or user correction.

### 4. Close & Sync (All Personas)

- Once validations pass or the document/session is complete, close the issue: `bd close <id> --reason "..." --json`.
- Always sync state: `bd sync && git pull --rebase && git push`.
- Run `bd ready --json` again to hand off state.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
