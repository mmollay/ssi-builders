# Changelog

All notable changes to SSI Builders will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-20

### 🏷️ Version Badge Feature

New feature: Automatic version badge display in all Builder components.

### Added

- **Version Badge System**
  - New `src/version.js` utility module
  - `getVersion()` function to retrieve current version
  - `createVersionBadge()` function to generate version badge HTML
  - Automatic badge integration in all 7 Builders (ListBuilder, FormBuilder, ModalBuilder, ChartBuilder, TabBuilder, MenuBuilder, SidebarBuilder)

- **CSS Styling**
  - New `.ssi-version-badge` class in `shared.css`
  - Fixed positioning (bottom-right corner)
  - Discrete design (9px font, gray color, 60% opacity)
  - Hover effect for better visibility (opacity: 100%)
  - Z-index 9999 for always-on-top display
  - Monospace font (Courier New)

- **Documentation**
  - New "Version Badge" section in README.md
  - API documentation for version utilities
  - Customization instructions

### Changed

- Updated `src/index.js` to export version utilities
- All 7 Builder components now include version badge in their render methods

---

## [1.0.0] - 2025-11-20

### 🎉 Initial Release

Production-ready release of SSI Builders - Professional UI Component Library.

### Added

#### 📋 ListBuilder
- Data tables with search, sort, and filter functionality
- Pagination support with customizable items per page
- Row actions (edit, delete, custom)
- Responsive design with mobile support
- Export functionality (CSV, JSON)
- Custom column rendering
- Multi-select with bulk actions

#### 📝 FormBuilder
- Dynamic form generation from JSON config
- Built-in validation (required, email, min/max length, pattern, custom)
- Field types: text, email, password, textarea, number, select, radio, checkbox, date
- Radio button layouts: vertical, horizontal, grid-2, grid-3
- Multi-step forms with progress indicator
- Auto-save functionality with localStorage
- Conditional field visibility
- Custom field rendering

#### 🪟 ModalBuilder
- 9 modal sizes and layouts:
  - xs (320px), small (400px), medium (600px), large (900px), xl (1200px)
  - fullscreen (100vw × 100vh)
  - side-left, side-right (400px drawers)
  - bottom (mobile-friendly slide-up sheet)
- Static methods: `alert()`, `confirm()`, `prompt()`
- Custom animations (fade, slide, zoom)
- Backdrop control
- ESC key and backdrop click handling
- Modal stacking support
- Async actions with loading states

#### 📊 ChartBuilder
- Chart types: Bar, Line, Pie, Donut
- No external dependencies (native Canvas API)
- Responsive sizing
- Custom colors and gradients
- Interactive tooltips
- Legend support
- Smooth animations

#### 📑 TabBuilder
- Multiple styles: underline, pill, contained
- Keyboard navigation (Arrow keys, Home, End)
- URL hash support for deep linking
- Lazy loading of tab content
- Icons and badges support
- Vertical and horizontal orientations
- onChange callbacks

#### 📜 MenuBuilder
- Dropdown menus
- Context menus (right-click)
- Nested submenus (unlimited depth)
- Smart positioning (auto-adjust to viewport)
- Keyboard shortcuts display
- Icons and dividers
- Checkable menu items
- Disabled state support

#### 🗂️ SidebarBuilder
- Collapsible navigation sidebar
- Search functionality
- Nested navigation items
- Persistent state (localStorage)
- Badge support
- Icons
- Mobile drawer mode
- Active state management

### Design System

- Material Design 3 compliance
- Responsive (Mobile-First approach)
- Accessibility (ARIA labels, keyboard navigation)
- Modern browser support (ES6+)
- CSS Custom Properties for theming

### Testing

- Full Playwright test coverage
- 100% test pass rate
- Visual regression testing
- Cross-browser compatibility

### Documentation

- Comprehensive README.md
- CLAUDE.md for AI-assisted development
- Code examples for all builders
- JSDoc comments throughout codebase

---

## Development Notes

### Version Strategy

- **Patch (1.0.x)**: Bug fixes, documentation updates
- **Minor (1.x.0)**: New features, backwards-compatible
- **Major (x.0.0)**: Breaking changes, API changes

### Used In

- Habbi Suchalgorithmus (Reference implementation)
- HabDaWas App (Planned)
- Bazar Bold (Planned)

---

[1.1.0]: https://github.com/ssi-solutions/ssi-builders/releases/tag/v1.1.0
[1.0.0]: https://github.com/ssi-solutions/ssi-builders/releases/tag/v1.0.0
