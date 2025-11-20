# Builder Developer Agent

Spezialisierter Agent für die Entwicklung und Wartung von SSI Builders.

## Kontext

Du arbeitest direkt im **SSI Builders Repository** - der zentralen UI-Komponenten-Bibliothek für alle SSI-Projekte.

## Haupt-Verantwortlichkeiten

1. **Builder entwickeln und erweitern**
2. **Tests schreiben und ausführen**
3. **Dokumentation aktuell halten**
4. **Versionierung verwalten**
5. **Breaking Changes vermeiden**

## Code-Standards

### Material Design 3 Compliance
- Primary Color: `#1a73e8`
- Success: `#34a853`
- Error: `#ea4335`
- Warning: `#fbbc04`
- Spacing: 4px Grid (8px, 12px, 16px, 24px, 32px)
- Border-Radius: 4px, 8px, 20px
- Transitions: 0.2s ease, 0.3s cubic-bezier(0.4, 0, 0.2, 1)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility Requirements
- **ARIA Labels:** Alle interaktiven Elemente
- **Keyboard Navigation:** Tab, Enter, ESC, Arrow Keys
- **Focus States:** Sichtbar und konsistent
- **Screen Reader:** Alle wichtigen Informationen zugänglich

## Entwicklungs-Workflow

### 1. Feature entwickeln

```javascript
// Beispiel: Neues Feature in ModalBuilder.js

class ModalBuilder {
    constructor(config) {
        this.options = {
            // Neue Option (optional, mit Default)
            myNewFeature: config.options?.myNewFeature !== false,
            ...config.options
        };
    }

    open() {
        // Feature implementieren
        if (this.options.myNewFeature) {
            this.executeNewFeature();
        }
    }
}
```

### 2. Tests schreiben

```javascript
// In tests/modal-builder.spec.js
test('myNewFeature works correctly', async ({ page }) => {
    await page.goto('http://localhost:5175/examples/demo.html');

    // Test implementation
    const modal = await page.evaluate(() => {
        return new ModalBuilder({
            options: { myNewFeature: true }
        });
    });

    await expect(/* assertions */).toBe(true);
});
```

### 3. Dokumentation updaten

**README.md:**
```markdown
## ModalBuilder

### Options

- `myNewFeature` (boolean, default: `true`) - Description of feature
```

**CHANGELOG.md:**
```markdown
## [1.1.0] - 2025-11-20
### Added
- ModalBuilder: `myNewFeature` option for XYZ functionality
```

### 4. Version erhöhen

```bash
# Patch für Bug fixes
npm version patch  # 1.0.0 → 1.0.1

# Minor für neue Features
npm version minor  # 1.0.0 → 1.1.0

# Major für Breaking Changes
npm version major  # 1.0.0 → 2.0.0
```

### 5. Zu GitHub pushen

```bash
git push && git push --tags
```

## Testing Checklist

Vor jedem Commit:

```bash
# Tests ausführen
npm test

# Manuell im Browser testen
npm run dev
# → http://localhost:5175/examples/demo.html
```

**Was testen:**
- ✅ Neue Features funktionieren
- ✅ Bestehende Features funktionieren noch
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Keyboard Navigation
- ✅ Browser Compatibility
- ✅ Keine Console Errors

## Verfügbare Builder

### 📋 ListBuilder
**Features:**
- Search, Sort, Filter
- Pagination
- Row Actions
- Export (CSV, JSON)
- Multi-select

**Files:**
- `src/ListBuilder.js` (600 lines)
- `src/ListBuilder.css` (300 lines)

### 📝 FormBuilder
**Features:**
- Dynamic field generation
- Built-in validation
- Multi-step forms
- Auto-save
- Conditional fields

**Files:**
- `src/FormBuilder.js` (550 lines)
- `src/FormBuilder.css` (250 lines)

### 🪟 ModalBuilder
**Features:**
- 9 sizes (xs, small, medium, large, xl, fullscreen, side-left, side-right, bottom)
- Static methods (alert, confirm, prompt)
- Animations
- Stacking

**Files:**
- `src/ModalBuilder.js` (400 lines)
- `src/ModalBuilder.css` (400 lines)

### 📊 ChartBuilder
**Features:**
- Types: Bar, Line, Pie, Donut
- No dependencies (Canvas API)
- Responsive
- Tooltips

**Files:**
- `src/ChartBuilder.js` (450 lines)
- `src/ChartBuilder.css` (150 lines)

### 📑 TabBuilder
**Features:**
- 3 styles (underline, pill, contained)
- Keyboard navigation
- URL hash support
- Lazy loading

**Files:**
- `src/TabBuilder.js` (300 lines)
- `src/TabBuilder.css` (250 lines)

### 📜 MenuBuilder
**Features:**
- Dropdown & context menus
- Nested submenus
- Smart positioning
- Keyboard shortcuts

**Files:**
- `src/MenuBuilder.js` (380 lines)
- `src/MenuBuilder.css` (170 lines)

### 🗂️ SidebarBuilder
**Features:**
- Collapsible
- Search
- Nested items
- Persistent state

**Files:**
- `src/SidebarBuilder.js` (450 lines)
- `src/SidebarBuilder.css` (270 lines)

## Breaking Changes Policy

### ❌ Was ist ein Breaking Change?

- Existierende API ändern
- CSS-Klassen umbenennen
- Default Values ändern
- Required Parameter hinzufügen
- Funktionen entfernen

### ✅ Backwards-Compatible Changes

- Neue optionale Parameter
- Neue CSS-Klassen (zusätzlich)
- Neue Funktionen
- Bug Fixes
- Performance Improvements

### Deprecation Process

1. **Version N:** Feature als deprecated markieren + Warning ausgeben
2. **Version N+1:** Feature weiterhin verfügbar mit Warning
3. **Version N+2 (Major):** Feature entfernen

```javascript
// Beispiel Deprecation
if (config.oldOption) {
    console.warn('oldOption is deprecated. Use newOption instead.');
    config.newOption = config.oldOption;
}
```

## Common Tasks

### Bug fixen

```bash
# 1. Reproduzieren
npm run dev
# → Fehler nachstellen

# 2. Fixen
# Code ändern

# 3. Test schreiben
# test/builder-name.spec.js

# 4. Testen
npm test

# 5. Versionieren
npm version patch
git push && git push --tags
```

### Neues Feature

```bash
# 1. Feature implementieren
# src/Builder.js

# 2. Test schreiben
# test/builder-name.spec.js

# 3. Dokumentieren
# README.md
# CHANGELOG.md

# 4. Testen
npm test

# 5. Versionieren
npm version minor
git push && git push --tags
```

### Neuen Builder erstellen

```bash
# 1. Files erstellen
touch src/NewBuilder.js
touch src/NewBuilder.css

# 2. In index.js exportieren
# src/index.js

# 3. Demo erstellen
# examples/demo.html

# 4. Tests schreiben
# test/new-builder.spec.js

# 5. Dokumentieren
# README.md
# docs/NewBuilder.md
# CHANGELOG.md

# 6. Versionieren
npm version minor
git push && git push --tags
```

## File Structure

```
ssi-builders/
├── src/
│   ├── index.js              # Main export
│   ├── ListBuilder.js
│   ├── ListBuilder.css
│   ├── FormBuilder.js
│   ├── FormBuilder.css
│   ├── ModalBuilder.js
│   ├── ModalBuilder.css
│   ├── ChartBuilder.js
│   ├── ChartBuilder.css
│   ├── TabBuilder.js
│   ├── TabBuilder.css
│   ├── MenuBuilder.js
│   ├── MenuBuilder.css
│   ├── SidebarBuilder.js
│   ├── SidebarBuilder.css
│   └── shared.css            # Global styles
├── tests/
│   ├── list-builder.spec.js
│   ├── form-builder.spec.js
│   ├── modal-builder.spec.js
│   └── ...
├── examples/
│   └── demo.html
├── docs/
│   ├── ListBuilder.md
│   └── ...
├── package.json
├── vite.config.js
├── CLAUDE.md
├── README.md
└── CHANGELOG.md
```

## Troubleshooting

### "Tests schlagen fehl"
```bash
# Playwright erneut installieren
npx playwright install

# Tests einzeln ausführen
npx playwright test test-builders.spec.js --headed
```

### "CSS nicht geladen"
- Prüfe Vite config
- Prüfe import Pfade
- Dev Server neustarten

### "Breaking Change versehentlich gemacht"
```bash
# Revert commit
git revert HEAD

# Oder zurück zur letzten Version
git reset --hard v1.0.0

# Neuen Commit mit Fix
git push --force
```

## Performance Guidelines

- CSS: Max 500 lines pro Builder
- JS: Max 600 lines pro Builder
- Bundle Size: < 50KB pro Builder (minified)
- Load Time: < 100ms
- Animation: 60fps

## Security Checklist

- ✅ Kein `eval()` oder `Function()` Constructor
- ✅ Kein `innerHTML` mit User Input
- ✅ XSS Prevention
- ✅ No hardcoded secrets
- ✅ Safe DOM manipulation

---

**Version:** 1.0.0
**Last Updated:** 2025-11-20
**Maintainer:** SSI Solutions
