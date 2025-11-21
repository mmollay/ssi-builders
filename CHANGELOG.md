# Changelog

All notable changes to SSI Builders will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.2.1] - 2025-11-21

### 🎨 Improved: SidebarBuilder UX

#### Toggle Button Redesign
- **Kompakteres Design**: 28x28px (statt 36x36px rund)
- **Bessere Position**: top: 20px, right: -14px (sichtbarer)
- **Subtilere Farben**: Weiß mit grauem Border, Hover → Blau
- **Verbesserte Accessibility**: Klarer Focus-State

#### Flat Navigation Structure
- **BREAKING**: Removed collapsible sections (type: 'section')
- **Alle Items immer sichtbar** - keine Klappmenüs mehr
- Verwendet jetzt `type: 'heading'` für visuelle Gruppierung
- Content-Bereich passt sich dynamisch an (280px ↔ 72px)
- Mobile-optimiert mit erhöhtem z-index und Shadow

#### Bugfixes
- Entfernt doppelten Mobile-Menu-Toggle Button
- Layout.js: updateContentMargin() für smooth Transitions
- Sidebar CSS: Vereinfachte Media Queries für Mobile (<1024px)

---

## [1.2.0] - 2025-11-20

### 🏗️ New: SiteBuilder + GlobalConfig System

#### SiteBuilder - Complete Layout System
- **New `SiteBuilder` class** - Komplettes Layout-Gerippe für Apps
  - Header mit Logo, Navigation, Actions
  - Optional: Sidebar mit Navigation (SidebarBuilder integration)
  - Main Content Area mit flexiblem maxWidth
  - Optional: Footer mit Copyright/Links
  - Fixed Header support
  - Responsive Mobile-Layout

- **4 Pre-configured Templates**
  - `admin` - Header + Sidebar, Full Width (Admin Panels, Back-Office)
  - `website` - Header + Footer, Max 1200px (Marketing Websites, Blogs)
  - `dashboard` - Header + Sidebar, Full Width (Analytics, Dashboards)
  - `landing` - Header + Footer, Max 1400px (Landing Pages, Product Sites)

- **API Methods**
  - `renderContent(html)` - Replace content area
  - `appendContent(html)` - Append to content
  - `clearContent()` - Clear content
  - `addBuilder(type, config)` - Add Builder directly (list, form, chart, tab)
  - `toggleSidebar()` - Toggle sidebar collapse
  - `updateHeader({ title, logo, subtitle })` - Update header dynamically
  - `setActiveNavigation(href)` - Mark navigation item as active
  - `changeLayout(template)` - Switch layout template
  - `destroy()` - Cleanup

- **CSS** (`SiteBuilder.css`)
  - Material Design 3 compliant
  - Responsive (Mobile-First)
  - CSS Custom Properties for theming
  - Smooth transitions
  - Fixed header support with proper padding
  - Z-index management

#### GlobalConfig - Central Configuration
- **New `GlobalConfig` class** - Zentrale Konfiguration für alle Builders
  - Ein Mal konfigurieren beim App-Start, überall nutzen
  - Deep merge support (partial updates möglich)
  - CSS Custom Properties auto-update

- **Configuration Options**
  - `iconPreset` - Central icon system ('emoji', 'lucide', 'heroicons', 'material', 'fontawesome')
  - `theme` - Colors (primary, secondary, success, danger, warning, etc.)
  - `buttons` - Default size/type
  - `modals` - Default size, backdrop behavior
  - `forms` - Auto-save, labels
  - `lists` - Items per page, action display types
  - `charts` - Colors, legend
  - `tabs` - Style, orientation
  - `sidebar` - Width, collapsible

- **API Methods**
  - `configure(config)` - Set/update configuration (deep merge)
  - `get(path)` - Get single value via dot-notation ('theme.primary')
  - `set(path, value)` - Set single value
  - `getAll()` - Get complete config
  - `reset()` - Reset to defaults

- **Integration**
  - Auto-syncs with IconManager
  - Updates CSS Custom Properties in real-time
  - All builders can inherit defaults

### 📚 Interactive Documentation

- **New Demo Pages**
  - `/docs/demos/index.html` - Main overview with builder cards
  - `/docs/demos/list-builder.html` - ListBuilder examples with all button types
  - `/docs/demos/form-builder.html` - FormBuilder with multi-step, all field types
  - `/docs/demos/modal-builder.html` - All 9 modal sizes/layouts
  - `/docs/demos/site-builder.html` - SiteBuilder + GlobalConfig documentation

- **Features**
  - Fomantic UI-inspired design
  - Live working examples
  - Code snippets with syntax highlighting
  - Configuration reference tables
  - Real-world integration examples

### Added

#### 🎨 IconManager - Centralized Icon Management
- **New `IconManager` class** - Zentrale Icon-Verwaltung für alle Builders
  - Support für 5 Icon-Systeme: Emoji, Lucide, Heroicons, Material Icons, FontAwesome
  - 15+ vordefinierte Icons (add, edit, delete, view, save, search, etc.)
  - `setPreset(preset)` - Projekt-weit ein Icon-System festlegen
  - `getIcon(name, preset)` - Icon abrufen (mit optionalem Override)
  - `registerIcon(name, variants)` - Custom Icons hinzufügen

- **Icon Presets**
  - `emoji` - Native Emojis (keine Dependencies)
  - `lucide` - Lucide Icons (empfohlen für M3)
  - `heroicons` - Heroicons (Tailwind CSS Icons)
  - `material` - Material Icons (Google)
  - `fontawesome` - FontAwesome Icons

- **Icon Weights (Stroke-Width)** - NEW!
  - `thin` (1.5) - Ultra-minimalistisch, sehr feiner Strich
  - `regular` (2.0) - **DEFAULT** - Ausgewogen & modern, M3 Standard
  - `bold` (2.5) - Kräftig & prominent, für Akzente
  - `setIconWeight(weight)` - Stroke-Width global einstellen
  - `getIconWeight()` - Aktuellen Weight abrufen
  - `getStrokeWidth()` - Numerischen stroke-width Wert abrufen
  - Dynamic stroke-width replacement in SVG icons (Lucide, Heroicons)

- **Usage**
  ```javascript
  import { IconManager, GlobalConfig } from '/vendor/ssi-builders/src/index.js';

  // Global konfigurieren
  IconManager.setPreset('lucide');
  IconManager.setIconWeight('regular'); // thin | regular | bold

  // Oder über GlobalConfig
  GlobalConfig.configure({
      iconPreset: 'lucide',
      iconWeight: 'regular'
  });

  // In Buildern nutzen - Icons nutzen automatisch aktuellen Weight
  actions: {
      row: [{
          key: 'edit',
          icon: IconManager.getIcon('edit'), // Nutzt aktuellen Weight
          label: 'Bearbeiten'
      }]
  }
  ```

- **Documentation**
  - New `/docs/ICON-SYSTEM.md` with complete guide
  - New `/docs/demos/icon-weight-demo.html` - Interactive demo with live weight switching
  - Examples for all 5 preset systems
  - Best practices and migration guide

#### 🎨 Unified SSI Button System (Material Design 3)
- **New `.ssi-btn` base button system** - Professional M3-compliant buttons for ALL builders
  - `.ssi-btn-primary` / `.ssi-btn-filled` - Filled button (primary action)
  - `.ssi-btn-outlined` / `.ssi-btn-secondary` - Outlined button (secondary action)
  - `.ssi-btn-text` - Text button (tertiary action)
  - `.ssi-btn-danger` - Destructive actions
  - `.ssi-btn-success` - Success/confirmation actions

- **Button Sizes**
  - `.ssi-btn-sm` - Small (32px height)
  - Default (40px height)
  - `.ssi-btn-lg` - Large (48px height)

- **Icon Button Support**
  - `.ssi-btn-icon` - Circular icon-only buttons
  - Automatic SVG sizing (16px-24px based on button size)
  - Perfect icon + text alignment with 8px gap

- **Material Design 3 Specifications**
  - Correct elevation (shadows) for filled buttons
  - M3 motion curves (cubic-bezier timing functions)
  - M3 typography (Label Large: 14px/500/0.1px letter-spacing)
  - 20px border-radius (fully rounded)
  - State layers for hover/active states
  - 38% opacity for disabled state

### Fixed

#### 🪟 ModalBuilder - Layout Positioning
- **Fixed Side Drawer positioning** (`side-left`, `side-right`)
  - Now correctly aligned to left/right edges
  - Proper slide-in animations (translateX)
  - Full height drawers (100vh)

- **Fixed Bottom Sheet positioning** (`bottom`)
  - Now correctly aligned to bottom edge
  - Proper slide-up animation (translateY)
  - Rounded top corners (16px)

- **Fixed overlay flexbox alignment**
  - New `.modal-overlay-side-left/right/bottom` classes
  - Centered modals unaffected
  - Proper justify-content/align-items for each layout type

### Changed

- **All builders migrated to unified button system**
  - ListBuilder: All toolbar, action, and pagination buttons
  - FormBuilder: All action buttons (submit, cancel, reset, next/prev)
  - ModalBuilder: All modal action buttons
  - Legacy classes (`.list-btn`, `.form-btn`, `.modal-btn`) still work via CSS mapping

- **Icon + Text spacing harmonized**
  - Consistent 8px gap between icons and text
  - SVG auto-sizing (18px default, 16px small, 20px large)
  - Perfect vertical alignment with flexbox

#### 📋 ListBuilder - Configurable Button Display Types
- **New `displayType` option for row actions** - Choose between 4 button styles:
  - `icon` (Default): Icon-only compact buttons (32x32px)
  - `emoji`: Emoji-only compact buttons (32x32px)
  - `button`: Full button with label only
  - `button-icon`: Full button with icon + label

- **SVG Icon Support**
  - Full support for inline SVG icons (Lucide, FontAwesome, etc.)
  - Auto-sizing for different button types (20px icon-only, 16px full button)
  - `currentColor` support for proper theming
  - Backwards compatible with emoji icons

- **New `buttonType` option** for full buttons:
  - `primary`: Blue background, white text
  - `secondary`: White background, gray text (Default)
  - `danger`: Red background, white text
  - `success`: Green background, white text

- **CSS Enhancements**
  - New `.list-action-btn-icon` class for icon-only buttons
  - New `.list-action-btn-emoji` class for emoji buttons
  - New `.list-action-btn-full` class for full buttons
  - New `.list-action-btn-with-icon` class for buttons with icon + label
  - SVG sizing rules for proper icon display
  - Improved hover effects (scale transforms)

### Changed
- `renderRowActions()` method now supports flexible button rendering
- Icon rendering helper function for SVG/emoji detection
- Updated demo.html with examples for all button types
- Enhanced README with comprehensive button configuration examples

### Documentation
- Added "Row Actions - Button Display Types" section to README
- SVG icon examples in demo.html
- Backwards compatibility notes

---

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
