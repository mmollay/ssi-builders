# CLAUDE.md - SSI Builders

**Zentrale UI-Komponenten-Bibliothek** für alle SSI-Projekte

---

## 🌐 SSI-Ökosystem Vision (v2.0+)

**SSI Builders ist das Fundament des gesamten SSI-Ökosystems.**

### Kerngedanke
Wie Google ein einheitliches Design-System über alle Produkte (Gmail, Drive, Calendar, etc.) hat,
schaffen wir mit SSI Builders ein **konsistentes UI-Framework für ALLE SSI-Anwendungen**.

### Ökosystem-Module
- **HabDaWas App** - Spenden-Plattform
- **Habbi Suchalgorithmus** - Intelligente Suche
- **Bazar Bold** - E-Commerce
- **Zukünftige Module** - Alle nutzen SSI Builders

### Zentrale Komponenten (überall benötigt)
1. **ListBuilder** - Datentabellen
2. **FormBuilder** - Formulare
3. **ModalBuilder** - Dialoge
4. **BreadcrumbBuilder** - Navigation
5. **ToastBuilder** - Notifications
6. **CardBuilder** - Content Cards

### Entwicklungs-Philosophie
- **Ein Feature → Überall verfügbar** - Entwicklung in SSI Builders, Nutzung in allen Modulen
- **Google als Vorbild** - Material Design 3, einheitliche UX
- **Lucide Icons only** - Keine Emojis, professionelle SVG Icons
- **Git Submodules** - Andere Projekte binden als Submodule ein

---

## 🎯 Projekt-Zweck

SSI Builders ist die **einzige Source of Truth** für UI-Komponenten in allen SSI-Projekten:
- HabDaWas App
- Habbi Suchalgorithmus
- Bazar Bold
- Alle neuen SSI-Webprojekte

**Entwicklungs-Philosophie:**
- Features werden hier entwickelt und getestet
- Andere Projekte binden als Git Submodule ein
- Ein Feature überall verfügbar machen

---

## 📋 Verfügbare Builder (v2.3.0)

| Builder | Purpose | Status |
|---------|---------|--------|
| 📋 **ListBuilder** | Datentabellen mit Search/Sort/Filter | ✅ Prod |
| 📝 **FormBuilder** | Formulare mit Validation | ✅ Prod |
| 🪟 **ModalBuilder** | Modals/Dialoge (9 Größen) | ✅ Prod |
| 📊 **ChartBuilder** | Charts (Bar/Line/Pie/Donut) | ✅ Prod |
| 📑 **TabBuilder** | Tabs mit Keyboard Nav | ✅ Prod |
| 📜 **MenuBuilder** | Dropdown/Context Menus | ✅ Prod |
| 🗂️ **SidebarBuilder** | Navigation Sidebar | ✅ Prod |
| 🏗️ **SiteBuilder** | Complete Page Layouts | ✅ Prod |
| 🔔 **ToastBuilder** | Notifications/Toasts | ✅ Prod |
| 💬 **TooltipBuilder** | Hover Tooltips | ✅ Prod |
| 💻 **CodeSnippetBuilder** | Code Display with Copy | ✅ Prod |

---

## 🛠️ Entwicklungs-Workflow

### Wenn neues Feature benötigt wird:

1. **Feature in SSI-Builders entwickeln**
   ```bash
   cd /Users/martinmollay/Development/ssi-builders
   # Feature implementieren
   # Tests schreiben
   npm test
   ```

2. **Version erhöhen**
   ```bash
   npm run version:patch  # Bug fixes (1.0.0 → 1.0.1)
   npm run version:minor  # New features (1.0.0 → 1.1.0)
   npm run version:major  # Breaking changes (1.0.0 → 2.0.0)
   ```

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: Add new feature XYZ"
   git push && git push --tags
   ```

4. **In consuming Projekten updaten**
   ```bash
   cd /Users/martinmollay/Development/habbi-suchalgorytmus
   git submodule update --remote vendor/ssi-builders
   git add vendor/ssi-builders
   git commit -m "Update ssi-builders to v1.1.0"
   ```

---

## ✅ Code-Standards

### 🎨 Design Tokens (v2.0+)

**IMMER verwenden! Keine hardcoded Werte!**

```css
/* Colors - Google M3 Palette */
--ssi-primary: #1a73e8;         /* Google Blue */
--ssi-success: #34a853;         /* Google Green */
--ssi-error: #ea4335;           /* Google Red */
--ssi-warning: #fbbc04;         /* Google Yellow */

/* Shadows - M3 Elevations */
--ssi-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--ssi-shadow-md: 0 4px 12px rgba(0,0,0,0.1);
--ssi-shadow-lg: 0 8px 24px rgba(0,0,0,0.15);

/* Spacing - 4px Grid */
--ssi-spacing-xs: 4px;
--ssi-spacing-sm: 8px;
--ssi-spacing-md: 12px;
--ssi-spacing-lg: 16px;
--ssi-spacing-xl: 24px;

/* Border Radius */
--ssi-radius-sm: 4px;
--ssi-radius-md: 8px;
--ssi-radius-lg: 12px;
--ssi-radius-full: 9999px;      /* Fully rounded */
```

### 🎯 Icon System (v2.0+)

**KRITISCH: Niemals Emojis verwenden!**

✅ **RICHTIG:**
```javascript
import { IconManager } from './IconManager.js';

// Global setzen (in index.html, main.js)
IconManager.setPreset('lucide');        // Lucide Icons (default)
IconManager.setIconWeight('regular');   // thin | regular | bold

// Icon verwenden
const editIcon = IconManager.getIcon('edit');
const deleteIcon = IconManager.getIcon('delete');
```

❌ **FALSCH:**
```javascript
const editIcon = '✏️';  // NIEMALS Emojis!
const deleteIcon = '🗑️'; // Unprofessionell!
```

**Verfügbare Icons:**
- `add`, `edit`, `delete`, `view`, `search`, `save`, `close`
- `settings`, `refresh`, `download`, `upload`, `filter`
- `check`, `copy`, `warning`, `info`, `home`, `list`, `menu`
- `folder`, `sidebar`, `layout`, `modal`, `chart`, `tab`
- `star`, `grid`, `github`, `book`, `bell`, `history`
- `eye`, `eye-off` (für Password Toggle)

**Icon Weight:**
- `thin` (1.5px) - Ultra-minimalistisch
- `regular` (2px) - Default, ausgewogen
- `bold` (2.5px) - Kräftig, auffällig

### 🎛️ GlobalConfig (v2.2+)

**Zentrale Konfiguration für alle Builder - einmal setzen, überall nutzen!**

```javascript
import { GlobalConfig } from '/vendor/ssi-builders/src/index.js';

// Beim App-Start konfigurieren
GlobalConfig.configure({
    // Icon System
    iconPreset: 'lucide',           // 'emoji' | 'lucide' | 'heroicons' | 'material' | 'fontawesome'
    iconWeight: 'regular',          // 'thin' | 'regular' | 'bold'

    // Theme/Colors (Material Design 3)
    theme: {
        primary: '#1a73e8',         // Google Blue
        secondary: '#5f6368',       // Gray
        success: '#34a853',         // Green
        danger: '#ea4335',          // Red
        warning: '#fbbc04',         // Yellow
        info: '#4285f4'            // Light Blue
    },

    // Button Defaults
    buttons: {
        defaultSize: 'medium',      // 'sm' | 'medium' | 'lg'
        defaultType: 'outlined'     // 'primary' | 'outlined' | 'text' | 'danger' | 'success'
    },

    // Modal Defaults
    modals: {
        defaultSize: 'medium',      // 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'fullscreen'
        closeOnBackdrop: true,
        closeOnEsc: true
    },

    // Form Defaults
    forms: {
        autoSave: false,
        submitLabel: 'Speichern',
        cancelLabel: 'Abbrechen'
    },

    // List Defaults
    lists: {
        itemsPerPage: 20,
        showSearch: true,
        actionDisplayType: 'icon'   // 'icon' | 'emoji' | 'button' | 'button-icon'
    },

    // Chart Defaults
    charts: {
        responsive: true,
        showLegend: true
    },

    // Tab Defaults
    tabs: {
        style: 'underline',         // 'underline' | 'pill' | 'contained'
        orientation: 'horizontal'   // 'horizontal' | 'vertical'
    },

    // Sidebar Defaults
    sidebar: {
        width: 280,
        collapsible: true,
        persistent: true            // Save state to localStorage
    },

    // Toast Defaults
    toasts: {
        duration: 3000,
        position: 'top-right'       // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    },

    // Tooltip Defaults (v2.2+)
    tooltips: {
        position: 'top',            // 'top' | 'bottom' | 'left' | 'right' | 'auto'
        trigger: 'hover',           // 'hover' | 'click' | 'manual'
        delay: 200,                 // Show delay in ms
        arrow: true,                // Show arrow/pointer
        maxWidth: 300               // Maximum width in pixels
    },

    // CodeSnippet Defaults (v2.2+)
    codeSnippets: {
        theme: 'dark',              // 'dark' | 'light'
        showLineNumbers: false,     // Show line numbers
        copyButton: true,           // Show copy button
        syntaxHighlighting: true,   // Enable syntax highlighting
        size: 'medium',             // 'small' | 'medium' | 'large'
        maxHeight: null             // Max height (null = no limit)
    }
});
```

**API Methods:**
```javascript
// Get single value
const primary = GlobalConfig.get('theme.primary');

// Get entire section
const theme = GlobalConfig.get('theme');

// Check if value exists
if (GlobalConfig.has('forms.autoSave')) { ... }

// Reset to defaults
GlobalConfig.reset();
```

**Best Practices:**
- ✅ Konfiguriere GlobalConfig **einmal** beim App-Start (z.B. in `main.js`)
- ✅ Alle Builder nutzen automatisch diese Defaults
- ✅ Builder-spezifische Config überschreibt GlobalConfig
- ✅ Ändere Theme-Colors zentral → alle Builder passen sich an
- ❌ Setze GlobalConfig nicht mehrfach im Code

### Material Design 3
- Alle Komponenten folgen MD3 Guidelines
- Farben: `#1a73e8` (Primary), `#34a853` (Success), `#ea4335` (Error)
- Spacing: 4px Grid (8px, 12px, 16px, 24px)

### Responsive Design
```css
/* Mobile First */
@media (min-width: 480px)  { /* Large Mobile */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Accessibility
- ARIA Labels auf allen interaktiven Elementen
- Keyboard Navigation (Tab, Enter, ESC, Arrow Keys)
- Focus States sichtbar
- Screen Reader Support

### Browser Support
- Modern Browsers (ES6+)
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 🧪 Testing

### Playwright Tests
```bash
npm test              # Headless
npm run test:headed   # Mit Browser
```

**Test-Struktur:**
```
tests/
├── list-builder.spec.js
├── form-builder.spec.js
├── modal-builder.spec.js
├── chart-builder.spec.js
├── tab-builder.spec.js
├── menu-builder.spec.js
└── sidebar-builder.spec.js
```

**Wichtig:** Alle Tests müssen passen vor Version Bump!

---

## 📝 Commit Messages

Conventional Commits verwenden:

```bash
feat: Add new chart type "scatter"
fix: Modal backdrop click not working
docs: Update FormBuilder examples
style: Improve button hover states
refactor: Simplify ListBuilder sorting logic
test: Add tests for ModalBuilder sizes
chore: Update dependencies
```

---

## 🚨 Breaking Changes vermeiden!

### DO:
- Neue Optionen als **optional** hinzufügen
- Backwards-kompatible Erweiterungen
- Deprecation Warnings vor Removal

### DON'T:
- Existierende API ändern ohne Major Version Bump
- CSS-Klassen umbenennen
- Defaults ändern ohne Migration Path

---

## 📚 Dokumentation

### Jeder Builder braucht:

1. **Inline JSDoc Comments**
   ```javascript
   /**
    * @param {Object} config - Configuration object
    * @param {string} config.title - Modal title
    */
   ```

2. **README Beispiele**
   - Quick Start Code
   - Common Use Cases
   - Configuration Options

3. **CHANGELOG Entry**
   ```markdown
   ## [1.1.0] - 2025-11-20
   ### Added
   - ModalBuilder: New "side-drawer" size option
   ```

---

## 🎨 CSS-Architektur

### File Structure:
```
src/
├── shared.css           # Global styles, colors, utils
├── ListBuilder.css      # Component-specific
├── FormBuilder.css
└── ...
```

### CSS Best Practices:
- BEM-ähnliche Namenskonvention: `.modal-header`, `.modal-body`
- CSS Custom Properties für Theming
- Mobile-First Media Queries
- Kein `!important` (außer absolut nötig)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-20 | Initial Release - 7 Builders |

---

## 💡 Claude-Anweisungen

### 🚨 WICHTIG: Icon & Design-Regeln IMMER beachten!

**BEVOR du irgendwas implementierst:**
1. ✅ IconManager verwenden (NIEMALS Emojis!)
2. ✅ Design Tokens verwenden (KEINE hardcoded Werte!)
3. ✅ Google M3 Guidelines folgen
4. ✅ Mobile-First denken

### Wenn User fragt: "Ich brauche Feature X in Builder Y"

1. **Check:** Existiert Feature bereits?
   - Lies Builder-Code
   - Check README/Docs
   - **Check:** Nutzt es schon IconManager? Wenn nein, ZUERST migrieren!

2. **Entwicklung:**
   - Feature in SSI-Builders implementieren
   - **IconManager für alle Icons verwenden**
   - **Design Tokens für alle Styles verwenden**
   - Tests schreiben
   - Dokumentation updaten

3. **Integration:**
   - Version erhöhen
   - In consuming Projekt einbinden

### Wenn du neuen Builder erstellst

**Checklist (MANDATORY!):**
- [ ] IconManager importiert und genutzt
- [ ] Design Tokens aus shared.css verwendet
- [ ] Mobile-responsive (Breakpoints: 480px, 768px, 1024px)
- [ ] ARIA Labels auf allen interaktiven Elementen
- [ ] Keyboard Navigation (Tab, Enter, ESC, Arrows)
- [ ] Loading/Empty/Error States
- [ ] Playwright Tests geschrieben
- [ ] Demo-Page erstellt
- [ ] README Beispiele hinzugefügt
- [ ] CHANGELOG Entry

### Wenn du Icons hinzufügst

1. **IconManager.js erweitern:**
   ```javascript
   myNewIcon: {
       emoji: '🔥',  // Nur für Fallback
       lucide: '<svg>...</svg>',  // Hauptsächlich!
       heroicons: '<svg>...</svg>',
       material: '<i class="material-icons">...</i>',
       fontawesome: '<i class="fa fa-..."></i>'
   }
   ```

2. **In CLAUDE.md dokumentieren:**
   - Icon Name zur Liste hinzufügen
   - Use Case beschreiben

### Wenn User sagt: "Builder nutzen in anderem Projekt"

1. **Git Submodule Setup:**
   ```bash
   cd /path/to/project
   git submodule add https://github.com/ssi-solutions/ssi-builders.git vendor/ssi-builders
   ```

2. **CLAUDE.md in Projekt ergänzen:**
   ```markdown
   ## UI Components

   **WICHTIG:** Nutzt SSI Builders (`/vendor/ssi-builders/`)
   - Docs: README.md im Submodule
   - Niemals eigene Modal/Form Komponenten schreiben!
   ```

3. **HTML/JS Setup zeigen**

---

## 🎯 Referenz-Projekt

**Habbi Suchalgorithmus** dient als Referenz-Implementierung:
- Location: `/Users/martinmollay/Development/habbi-suchalgorytmus`
- Zeigt Best Practices für Integration
- Wird zum Testen neuer Features genutzt

---

> **Version:** 1.0.0 | **Last Updated:** 2025-11-20
