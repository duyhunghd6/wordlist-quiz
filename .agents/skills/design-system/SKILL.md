---
name: design-system
description: "Design System ID registry and conventions for the Wordlist Quiz showcase. Use when creating or modifying UI components, screens, or layouts."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
risk: unknown
source: community
---

# Design System — ID Registry & Conventions

> **Agent Skill** for working with the design system showcase at `docs/design/showcase/`.

---

## When to Use This Skill

You are modifying or creating UI components, screens, or layouts that appear in the Design System showcase, or referencing design system elements from React application code.

---

## ID Convention

All showcase IDs follow `ds-{category}-{name}`:

| Prefix    | Category     | Placed On                          |
| --------- | ------------ | ---------------------------------- |
| `ds-scr-` | Full Screens | `.component-showcase` wrapper      |
| `ds-cmp-` | Components   | `.component-block` div             |
| `ds-lay-` | Layouts      | `.layout-card` div                 |
| `ds-fnd-` | Foundation   | `.token-section` / gallery wrapper |
| `ds-sys-` | Systems      | `.state-container` wrapper         |

---

## Rules

1. **Every** new component/screen/layout MUST be assigned a unique ID
2. IDs go on the **outermost wrapper** of the showcase block
3. IDs are **kebab-case**, lowercase, descriptive
4. IDs must be **globally unique** across all HTML files
5. Update this skill when adding new IDs

---

## Full ID Registry

### Screens (5)

| ID                         | File                             |
| -------------------------- | -------------------------------- |
| `ds-scr-game-selection`    | `screens/game-selection.html`    |
| `ds-scr-game-journey`      | `screens/game-journey.html`      |
| `ds-scr-onboarding`        | `screens/onboarding.html`        |
| `ds-scr-parental-progress` | `screens/parental-progress.html` |
| `ds-scr-angry-tenses`      | `screens/game-angry-tenses.html` |

### Foundation (7)

| ID                    | File                |
| --------------------- | ------------------- |
| `ds-fnd-colors`       | `tokens.html`       |
| `ds-fnd-typography`   | `tokens.html`       |
| `ds-fnd-spacing`      | `tokens.html`       |
| `ds-fnd-icons-filled` | `icons.html`        |
| `ds-fnd-icons-bold`   | `icons.html`        |
| `ds-fnd-animations`   | `animations.html`   |
| `ds-sys-state-matrix` | `state-matrix.html` |

### Components — Forms (18)

| ID                         | Name                       |
| -------------------------- | -------------------------- |
| `ds-cmp-buttons`           | Buttons                    |
| `ds-cmp-inputs-toggles`    | Inputs & Toggles           |
| `ds-cmp-typing-cells`      | Typing Quiz Input Cells    |
| `ds-cmp-quiz-options`      | Quiz Option Buttons        |
| `ds-cmp-toggle-switch`     | Toggle Switch (4-State)    |
| `ds-cmp-slider`            | Playful Slider             |
| `ds-cmp-checkbox-radio`    | Oversized Checkbox/Radio   |
| `ds-cmp-segmented-control` | Segmented Control          |
| `ds-cmp-stepper`           | Number Input Stepper       |
| `ds-cmp-range-slider`      | Double-Handle Range Slider |
| `ds-cmp-radio-group`       | Custom Radio Group         |
| `ds-cmp-dropdown`          | Dropdown Select Menu       |
| `ds-cmp-search-bar`        | Search Input Bar           |
| `ds-cmp-autocomplete`      | Autocomplete Suggestion    |
| `ds-cmp-file-dropzone`     | File Dropzone              |
| `ds-cmp-date-time`         | Date Picker & Time Pill    |
| `ds-cmp-keypad`            | Virtual Keypad             |
| `ds-cmp-signal-option`     | Signal Word Option Button  |

### Components — Cards (17)

| ID                             | Name                     |
| ------------------------------ | ------------------------ |
| `ds-cmp-cards`                 | Cards (Elevation Tiers)  |
| `ds-cmp-swipe-card`            | Swipe Card               |
| `ds-cmp-game-selector-legacy`  | Game Selector (Legacy)   |
| `ds-cmp-game-selector-compact` | Compact Game Selector    |
| `ds-cmp-score-summary`         | Score Summary Card       |
| `ds-cmp-accordion`             | Accordion Item           |
| `ds-cmp-character-card`        | Character Select Card    |
| `ds-cmp-quest-card`            | Quest / Mission Card     |
| `ds-cmp-login-reward`          | Daily Login Reward       |
| `ds-cmp-stats-tile`            | Stats Overview Tile      |
| `ds-cmp-upgrade-card`          | Tech Tree / Upgrade Card |
| `ds-cmp-friend-card`           | Social / Friend Card     |
| `ds-cmp-notif-card`            | Notification Event Card  |
| `ds-cmp-bundle-card`           | Store Bundle Card        |
| `ds-cmp-event-banner`          | Event Banner Card        |
| `ds-cmp-flashcard`             | Flippable Flashcard      |
| `ds-cmp-sentence-card`         | Sentence Display Card    |
| `ds-cmp-tense-badge`           | Tense Badge / Label      |

### Components — Feedback (22)

| ID                      | Name                      |
| ----------------------- | ------------------------- |
| `ds-cmp-badges`         | Badges                    |
| `ds-cmp-avatars`        | Avatars & Profiles        |
| `ds-cmp-streak`         | Streak Counters           |
| `ds-cmp-game-entities`  | Playful Game Entities     |
| `ds-cmp-skeleton`       | Loading Skeleton          |
| `ds-cmp-spinner`        | Activity Spinner          |
| `ds-cmp-toast-success`  | Snackbar / Toast          |
| `ds-cmp-tooltip`        | Tooltip / Popover         |
| `ds-cmp-star-rating`    | Star Rating               |
| `ds-cmp-color-picker`   | Color Picker Swatch       |
| `ds-cmp-progress-ring`  | Progress Ring             |
| `ds-cmp-step-wizard`    | Step Wizard               |
| `ds-cmp-dot-badge`      | Notification Dot Badge    |
| `ds-cmp-live-pulse`     | Live Pulse Indicator      |
| `ds-cmp-breadcrumb`     | Breadcrumb Trail          |
| `ds-cmp-loading-bar`    | Indeterminate Loading Bar |
| `ds-cmp-sheet-handle`   | Bottom Sheet Handle       |
| `ds-cmp-inline-error`   | Inline Error Text         |
| `ds-cmp-toast-error`    | Error Toast               |
| `ds-cmp-offline-banner` | Offline Banner            |
| `ds-cmp-empty-state`    | Empty State View          |
| `ds-cmp-error-boundary` | Error Boundary Card       |

### Components — Game UI (13)

| ID                      | Name                 |
| ----------------------- | -------------------- |
| `ds-cmp-progress-score` | Progress & Score     |
| `ds-cmp-timer-bars`     | Timer Bars           |
| `ds-cmp-game-hud`       | Game HUD Header      |
| `ds-cmp-health-hearts`  | Health Hearts        |
| `ds-cmp-stamina-bar`    | Curved Stamina Bar   |
| `ds-cmp-combo-pill`     | Combo Multiplier     |
| `ds-cmp-boss-health`    | Boss Health Bar      |
| `ds-cmp-xp-bar`         | XP / Experience Bar  |
| `ds-cmp-radar`          | Mini-map / Radar     |
| `ds-cmp-inventory-slot` | Inventory Slot       |
| `ds-cmp-cooldown`       | Action Cooldown      |
| `ds-cmp-dpad`           | Directional D-Pad    |
| `ds-cmp-combat-text`    | Floating Combat Text |

### Layouts — Core (9)

| ID                                  | Name                        |
| ----------------------------------- | --------------------------- |
| `ds-lay-web-lmr`                    | Web: LMR                    |
| `ds-lay-web-bento`                  | Web: Dashboard Bento        |
| `ds-lay-mobile-tab`                 | Mobile: Bottom Tab Nav      |
| `ds-lay-mobile-sheet`               | Mobile: Bottom Sheet        |
| `ds-lay-mobile-portrait`            | Mobile: Portrait Container  |
| `ds-lay-screen-quick-start`         | Screen: Quick Start         |
| `ds-lay-screen-onboarding-carousel` | Screen: Onboarding Carousel |
| `ds-lay-screen-settings`            | Screen: Settings            |
| `ds-lay-screen-profile`             | Screen: Profile/Avatar      |

### Layouts — Game Shells (17)

| ID                             | Name                     |
| ------------------------------ | ------------------------ |
| `ds-lay-game-overlay`          | Fullscreen Overlay       |
| `ds-lay-game-swipe`            | Swipe Cards              |
| `ds-lay-game-bubble`           | Bubble Pop               |
| `ds-lay-game-typing`           | Typing Quiz              |
| `ds-lay-game-quiz`             | Standard Quiz            |
| `ds-lay-screen-session-end`    | Session End Summary      |
| `ds-lay-screen-dashboard`      | Progress Dashboard       |
| `ds-lay-screen-settings-modal` | Settings Modal           |
| `ds-lay-screen-pause`          | Pause Menu               |
| `ds-lay-screen-daily-rewards`  | Daily Rewards            |
| `ds-lay-screen-level-complete` | Level Complete           |
| `ds-lay-screen-empty-state`    | Empty State Hub          |
| `ds-lay-screen-review-plays`   | Review Plays             |
| `ds-lay-game-signal-spotter`   | Tense Signal Spotter     |
| `ds-lay-game-signal-correct`   | Signal Spotter (Correct) |
| `ds-lay-screen-answer-wrong`   | Answer Incorrect         |
| `ds-lay-game-endless-runner`   | Endless Runner           |

### Layouts — Game Boards (16)

| ID                            | Name                 |
| ----------------------------- | -------------------- |
| `ds-lay-board-level-map`      | Level Select Map     |
| `ds-lay-board-word-search`    | Word Search Grid     |
| `ds-lay-board-memory-match`   | Memory Match Grid    |
| `ds-lay-screen-leaderboard`   | Leaderboard          |
| `ds-lay-screen-achievements`  | Achievement Cabinet  |
| `ds-lay-screen-shop`          | Coin Store / Shop    |
| `ds-lay-arcade-quiz`          | Quiz Board           |
| `ds-lay-arcade-typing`        | Typing Quiz (Arcade) |
| `ds-lay-arcade-scramble`      | Scramble Board       |
| `ds-lay-arcade-swipe`         | Swipe Cards (Arcade) |
| `ds-lay-arcade-bubble`        | Bubble Pop (Arcade)  |
| `ds-lay-arcade-photobomb`     | Photobomb            |
| `ds-lay-arcade-shape-builder` | Shape Builder        |
| `ds-lay-arcade-timeline`      | Timeline Detective   |
| `ds-lay-arcade-mario`         | Mario Runner         |
| `ds-lay-arcade-signal`        | Tense Signal Spotter |

---

## Adding New Components

When adding a new component, screen, or layout to the showcase:

1. Choose the appropriate prefix (`ds-scr-`, `ds-cmp-`, `ds-lay-`, `ds-fnd-`)
2. Name it descriptively in kebab-case
3. Add `id="ds-xxx-your-name"` to the outermost wrapper element
4. Update this SKILL.md registry table
5. Follow the Design System rules in `docs/design/README.md`
