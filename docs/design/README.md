# Wordlist Quiz Design System Guide

This document serves as the single source of truth for all UI/UX implementations in the Wordlist Quiz application. As per the project guidelines (GEMINI.md), **ALL UI changes, including new game screens (Game Scenes) or components, MUST be implemented in the Design System FIRST.**

Only after a design is established in the Design System should it be ported into the actual React application (`src/`).

---

## 📂 Directory Structure

The Design System is located in `docs/design/`.

- `design-tokens.json` (or tokens in CSS): The foundational design tokens (colors, spacing, typography).
- `showcase/`: The interactive HTML/CSS/JS sandbox where all raw UI components and layouts are built and previewed independent of React.
  - `showcase/index.html`: The master preview page.
  - `showcase/css/`: Contains modular CSS files (`tokens.css`, `components.css`, `layouts.css`).
  - `showcase/sections/`: Individual HTML snippets for isolated components, game screens, and UI sections.
- `screens/`: Static mockups, wireframes, or reference imagery.

---

## 🎨 Applying the Design System to React

The design system's CSS architecture is mirrored entirely in the React application inside the `src/` directory. When migrating HTML/CSS from the `showcase/` folder, follow the mapping below:

### 1. Variables & Global Rules

- **Design System**: `docs/design/showcase/css/tokens.css`
- **React App**: `src/index.css`
- **Purpose**: Colors (`--color-primary`, `--color-success`), typography, spacing (`--space-md`), border radii, z-indexes, and global HTML resets.

### 2. Micro-Components

- **Design System**: `docs/design/showcase/css/components.css`
- **React App**: `src/components.css`
- **Purpose**: Reusable atomic UI elements like buttons (`.btn`), badges (`.badge`), cards (`.card`), inputs, and overlays. Use these classes universally instead of writing ad-hoc inline styles.

### 3. Layouts & Game Shells

- **Design System**: `docs/design/showcase/css/layouts.css`
- **React App**: `src/layouts.css`
- **Purpose**: Structural wrappers for full screens. Examples include the `.results-container`, `.scramble-board`, `.typing-board`, `.dash-section`, etc. These files define the grid, flex directions, and spacing boundaries of large screen layouts.

### 4. Component Implementation

- **Design System**: `docs/design/showcase/sections/*.html`
- **React App**: `src/components/*.js`
- **Purpose**: The actual layout markup. When implementing a new screen in React, simply copy the HTML from the relevant section in the showcase, convert `class` to `className`, and hook up your state/props.

---

## 🛠️ Typical Development Workflow

If a bug needs fixing or a feature needs building, follow this flow:

### Scenario A: Modifying an Existing Component (e.g., The "Game Summary" screen is too narrow)

1. **Locate the layout in CSS**: Open `src/layouts.css` (or occasionally `src/components.css`).
2. **Find the class**: Locate the `.results-container` class.
3. **Fix the rule**: Adjust widths, flex-box behaviors, flex-shrink limits, or max-widths.
4. _(Best Practice)_: Update the corresponding CSS inside `docs/design/showcase/css/layouts.css` to keep the showcase in sync.

### Scenario B: Building a New Feature (e.g., A "Daily Rewards" Modal)

1. **Build in HTML/CSS First**: Create a new `.html` snippet in `docs/design/showcase/sections/`.
2. **Style in Sandbox**: Write the structural layout CSS into `docs/design/showcase/css/layouts.css` and use existing components like `.btn` or `.card` from `components.css`.
3. **Port to React**: Create `src/components/DailyRewards.js`. Copy your HTML structure inside. Apply your logic and state.
4. **Copy CSS**: Copy your new layout CSS rules over to `src/layouts.css` exactly as you wrote them in the showcase.

## 🧭 Key Checkpoints for Developers

- **No Bootstrap/Tailwind**: This project uses vanilla CSS with highly curated variable tokens. Do not use framework utility classes; rely on standard CSS grids and flexbox.
- **Stop and Re-Plan**: If you find yourself writing lots of `style={{ ... }}` inline React definitions, STOP. You should either be using an existing `.card` or `.dash-section` class, or extracting those styles into `src/layouts.css`.
- **Icons**: We use the `lucide-react` library for consistent SVG icons instead of raw SVGs or images.

_Happy building! Maintain the design standard and keep the UI premium._
