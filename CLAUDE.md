# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**SSI Builders** is the central UI component library for the entire SSI ecosystem. Like Google's Material Design across all products, SSI Builders provides a consistent UI framework for ALL SSI applications (HabDaWas App, Habbi Suchalgorithmus, Bazar Bold, and future projects).

**Current Version:** 2.4.1

---

## Architecture & Key Concepts

### Core Design System

**IconManager + GlobalConfig Architecture:**
- **IconManager** (`src/IconManager.js`): Centralized icon system supporting 5 presets (emoji, lucide, heroicons, material, fontawesome) with 3 weights (thin/regular/bold)
- **GlobalConfig** (`src/GlobalConfig.js`): Central configuration singleton that:
  - Manages theme colors, default settings for all builders
  - Auto-syncs with IconManager when `iconPreset` or `iconWeight` changes
  - Updates CSS Custom Properties in real-time
  - Uses deep merge for partial updates (`src/utils.js`)

**Critical Rule:** Set GlobalConfig ONCE at app start. All builders inherit these defaults automatically.

### Builder Base Class Pattern

All builders extend from `BaseBuilder.js` (if present) or follow consistent patterns:
- Constructor accepts `config` object with common patterns: `containerId`, `data`/`dataSource`, `options`
- All builders support `render()`, `destroy()` lifecycle methods
- Version badge automatically injected via `src/version.js`

### CSS Architecture

**Design Token System (v2.0+):**
- All styles use CSS Custom Properties from `src/shared.css`
- Variables prefixed with `--ssi-*` (e.g., `--ssi-primary`, `--ssi-spacing-md`, `--ssi-shadow-lg`)
- Material Design 3 compliant (Google's color palette, M3 elevations, 4px grid spacing)
- Each builder has dedicated CSS file (e.g., `ListBuilder.css`, `FormBuilder.css`)

**NEVER hardcode colors/spacing** - always use design tokens!

### Analytics Components (v2.3.0+)

New specialized components for dashboards:
- **AnalyticsCard**: KPI cards with trend indicators, value formatting (currency/percent/compact), loading states
- **FilterBar**: Global filter component with select/search/date/checkbox types, debounced search, active filter badges
- **TimeRangePicker**: Time range selector with presets (day/week/month/quarter/year), comparison mode, SQL helper methods

These use unified `AnalyticsBuilder.css` with shared design system.

---

## Commands

### Development
```bash
npm run dev          # Start Vite dev server (http://localhost:5177)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run Playwright tests (headless)
npm run test:headed  # Run Playwright tests with browser UI
```

**All tests must pass before version bumps!**

### Versioning
```bash
npm run version:patch  # Bug fixes (2.3.0 → 2.3.1)
npm run version:minor  # New features (2.3.0 → 2.4.0)
npm run version:major  # Breaking changes (2.3.0 → 3.0.0)
# These commands auto-push to git with tags
```

---

## Critical Development Rules

### Icon System - MANDATORY

**NEVER use emojis in production code!** Always use IconManager:

```javascript
// ✅ CORRECT
import { IconManager } from './IconManager.js';
const icon = IconManager.getIcon('edit');

// ❌ WRONG
const icon = '✏️';
```

Available icons: add, edit, delete, view, search, save, close, settings, refresh, download, upload, filter, check, copy, warning, info, home, list, menu, folder, sidebar, layout, modal, chart, tab, star, grid, github, book, bell, history, eye, eye-off

### Design Tokens - MANDATORY

```css
/* ✅ CORRECT */
color: var(--ssi-primary);
margin: var(--ssi-spacing-md);
box-shadow: var(--ssi-shadow-md);

/* ❌ WRONG */
color: #1a73e8;
margin: 12px;
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
```

### GlobalConfig Usage

Configure ONCE at app initialization:

```javascript
import { GlobalConfig } from '/vendor/ssi-builders/src/index.js';

GlobalConfig.configure({
    iconPreset: 'lucide',
    iconWeight: 'regular',
    theme: { primary: '#1a73e8' },
    buttons: { defaultSize: 'medium' }
    // ... other defaults
});
```

API: `GlobalConfig.get('path.to.value')`, `GlobalConfig.set('path.to.value', val)`, `GlobalConfig.reset()`

---

## Builder Patterns

### Common Configuration Structure

All builders follow similar patterns:

```javascript
new BuilderName({
    containerId: 'element-id',          // Required: DOM container

    // Data/Content (varies by builder)
    data: [...],                         // Static data
    dataSource: async () => {...},       // Dynamic data fetcher

    // Options object (builder-specific)
    options: {
        // Common across builders:
        size: 'medium',                  // Size variants
        responsive: true,                // Responsive behavior
        // Builder-specific options...
    },

    // Callbacks (common pattern)
    onSubmit: (data) => {...},          // Forms
    onChange: (value) => {...},          // Forms, Tabs, Filters
    onClick: (item) => {...}             // Lists, Cards
});
```

### ListBuilder Specifics

Row actions support 4 display types:
- `'icon'` (default): Icon-only compact (32×32px)
- `'emoji'`: Emoji-only compact
- `'button'`: Full button with label
- `'button-icon'`: Full button with icon + label

Supports SVG icons, emojis, and icon fonts.

### FormBuilder Specifics

v2.2+ includes:
- Password toggle with eye icons (`IconManager.getIcon('eye')` / `IconManager.getIcon('eye-off')`)
- Number stepper buttons (increment/decrement with min/max validation)
- Multi-step forms with progress indicator
- Auto-save with localStorage
- Field types: text, email, password, textarea, number, select, radio, checkbox, date, toggle

### ModalBuilder Specifics

9 size/layout options: xs, small, medium, large, xl, fullscreen, side-left, side-right, bottom

Static methods:
- `ModalBuilder.alert({ title, message })`
- `await ModalBuilder.confirm({ title, message, danger })`
- `await ModalBuilder.prompt({ title, message, defaultValue })`

---

## Documentation Requirements

When adding/modifying builders:

1. **JSDoc comments** in source files
2. **Demo page** in `/docs/demos/[builder-name].html` with live examples
3. **CHANGELOG.md** entry following Keep a Changelog format
4. **README.md** update if public API changes
5. **Playwright tests** in `/tests/`

---

## Responsive Breakpoints

Mobile-first approach:

```css
/* Default: Mobile (< 480px) */
@media (min-width: 480px)  { /* Large Mobile */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

---

## Accessibility Requirements

All builders must include:
- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, ESC, Arrow keys)
- Visible focus states
- Screen reader support

---

## Git Submodule Usage

This library is consumed by other projects as a git submodule:

```bash
# In consuming projects:
git submodule add https://github.com/ssi-solutions/ssi-builders.git vendor/ssi-builders
git submodule update --remote vendor/ssi-builders
```

---

## Version Strategy

- **Patch (x.x.1)**: Bug fixes, documentation updates, no API changes
- **Minor (x.1.0)**: New features, backwards-compatible additions
- **Major (1.0.0)**: Breaking changes, API modifications, CSS class renames

**Avoid breaking changes** - add new options as optional, provide deprecation warnings before removal.

---

## Testing Strategy

Playwright tests cover:
- Visual regression (page snapshots)
- Interactive functionality (clicks, forms, modals)
- Responsive behavior (viewport sizes)
- Accessibility (ARIA, keyboard nav)

Test files in `/tests/` follow pattern: `test-[feature].spec.js`

---

## Entry Points

- **Main export:** `src/index.js` - exports all builders, utilities (IconManager, GlobalConfig, version utils)
- **Package.json exports:** Supports direct imports like `@ssi/builders/ListBuilder`
- **CSS:** Import `src/shared.css` + individual builder CSS files

---

## Reference Implementation

**Habbi Suchalgorithmus** (`/Users/martinmollay/Development/habbi-suchalgorytmus`) serves as the reference implementation showing best practices for integration.

---

> **Last Updated:** 2025-11-25 | **Current Version:** 2.4.1
