# 🏗️ SSI Builders

**Professional UI Component Library** - Material Design 3 | Production-Ready

> **Das Fundament des SSI-Ökosystems** - Wie Google ein einheitliches Design-System über alle Produkte hat, schafft SSI Builders ein konsistentes UI-Framework für ALLE SSI-Anwendungen.

---

## 🌐 SSI-Ökosystem Vision

SSI Builders ist **die zentrale UI-Bibliothek** für das gesamte SSI-Ökosystem:

### Warum ein zentrales System?

✅ **Konsistente UX** - User erkennen SSI-Apps sofort wieder
✅ **Entwicklungsgeschwindigkeit** - Ein Feature entwickeln, überall nutzen
✅ **Wartbarkeit** - Ein Fix profitiert alle Projekte
✅ **Professionelles Design** - Google Material Design 3 als Vorbild

### Ökosystem-Module

| Modul | Status | Nutzt SSI Builders |
|-------|--------|-------------------|
| **HabDaWas App** | ✅ Production | v2.0.0 |
| **Habbi Suchalgorithmus** | ✅ Production | v2.0.0 |
| **Bazar Bold** | 🚧 In Development | v2.0.0 |
| **[Neue Module]** | 📋 Planned | v2.0.0 |

### Zentrale Komponenten

Alle Module nutzen dieselben Builder:
- 📋 **ListBuilder** - Datentabellen
- 📝 **FormBuilder** - Formulare
- 🪟 **ModalBuilder** - Dialoge
- 📊 **ChartBuilder** - Visualisierungen
- 📑 **TabBuilder** - Tabs
- 📜 **MenuBuilder** - Menüs
- 🗂️ **SidebarBuilder** - Navigation

---

## 📦 Installation

### Als Git Submodule (Empfohlen)

```bash
# In dein Projekt-Root
cd /Users/martinmollay/Development/dein-projekt

# Submodule hinzufügen
git submodule add https://github.com/ssi-solutions/ssi-builders.git vendor/ssi-builders

# Initialisieren
git submodule update --init --recursive
```

### Als NPM Package (Optional)

```bash
npm install @ssi/builders
```

---

## 🚀 Quick Start

### In HTML/Vanilla JS:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- CSS -->
    <link rel="stylesheet" href="/vendor/ssi-builders/src/shared.css">
    <link rel="stylesheet" href="/vendor/ssi-builders/src/ModalBuilder.css">
</head>
<body>
    <script type="module">
        import { ModalBuilder } from '/vendor/ssi-builders/src/ModalBuilder.js';

        // Modal öffnen
        ModalBuilder.alert({
            title: 'Erfolg!',
            message: 'SSI Builders erfolgreich eingebunden!'
        });
    </script>
</body>
</html>
```

### Als ES Module:

```javascript
import {
    ListBuilder,
    FormBuilder,
    ModalBuilder,
    ChartBuilder,
    TabBuilder,
    MenuBuilder,
    SidebarBuilder
} from '/vendor/ssi-builders/src/index.js';

// Alle CSS importieren
import '/vendor/ssi-builders/src/shared.css';
import '/vendor/ssi-builders/src/ModalBuilder.css';
```

---

## 📚 Verfügbare Builder

### 📋 ListBuilder
Datentabellen mit Search, Sort, Filter, Pagination

**Basic Example:**
```javascript
const list = new ListBuilder({
    containerId: 'myTable',
    columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'E-Mail', sortable: true }
    ],
    dataSource: async () => await fetchUsers(),
    options: {
        searchable: true,
        paginated: true,
        pageSize: 10
    }
});
list.render();
```

**Row Actions - Button Display Types:**
```javascript
const list = new ListBuilder({
    containerId: 'myTable',
    columns: [/* ... */],
    dataSource: async () => users,
    actions: {
        row: [
            // SVG Icon only (Default - compact)
            {
                key: 'view',
                label: 'Ansehen',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
                displayType: 'icon',  // Default, can be omitted
                handler: (row) => viewItem(row)
            },

            // Emoji only (compact)
            {
                key: 'edit',
                label: 'Bearbeiten',
                emoji: '✏️',
                displayType: 'emoji',
                handler: (row) => editItem(row)
            },

            // Full button with label only
            {
                key: 'approve',
                label: 'Genehmigen',
                displayType: 'button',
                buttonType: 'primary',  // 'primary', 'secondary', 'danger', 'success'
                handler: (row) => approveItem(row)
            },

            // Full button with SVG icon + label
            {
                key: 'delete',
                label: 'Löschen',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>',
                displayType: 'button-icon',
                buttonType: 'danger',
                handler: (row) => deleteItem(row)
            }
        ]
    }
});
```

**Display Types:**
- `icon` (Default): Icon only, compact (32x32px) - **Supports SVG icons, Emojis, or text**
- `emoji`: Emoji only, compact (32x32px)
- `button`: Full button with label only
- `button-icon`: Full button with icon + label - **Icon can be SVG or Emoji**

**Icon Support:**
- ✅ SVG Icons (Lucide, FontAwesome, etc.) - Full support with auto-sizing
- ✅ Emojis - Native emoji characters
- ✅ Icon Fonts - `<i class="fa fa-trash"></i>` style icons

**Button Types** (for `button` and `button-icon`):
- `primary`: Blue background, white text
- `secondary`: White background, gray text (Default)
- `danger`: Red background, white text
- `success`: Green background, white text

### 📝 FormBuilder
Formulare mit Validation, Multi-Step, Auto-Save

```javascript
const form = new FormBuilder({
    containerId: 'myForm',
    fields: [
        { key: 'name', type: 'text', label: 'Name', required: true },
        { key: 'email', type: 'email', label: 'E-Mail', required: true }
    ],
    onSubmit: async (data) => {
        await saveData(data);
    }
});
form.render();
```

### 🪟 ModalBuilder
Modals, Dialoge, Confirm-Boxes (9 Größen)

```javascript
// Alert
ModalBuilder.alert({ title: 'Erfolg', message: 'Gespeichert!' });

// Confirm
const confirmed = await ModalBuilder.confirm({
    title: 'Löschen?',
    message: 'Wirklich löschen?',
    danger: true
});

// Custom Modal
const modal = new ModalBuilder({
    title: 'Custom Modal',
    body: '<p>Inhalt hier</p>',
    options: { size: 'large' }
});
modal.open();
```

### 📊 ChartBuilder
Charts: Bar, Line, Pie, Donut

```javascript
const chart = new ChartBuilder({
    containerId: 'myChart',
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Umsatz',
            data: [100, 200, 150]
        }]
    }
});
chart.render();
```

### 📑 TabBuilder
Tabs mit Keyboard Navigation

```javascript
const tabs = new TabBuilder({
    containerId: 'myTabs',
    tabs: [
        { key: 'tab1', label: 'Tab 1', content: '<p>Content 1</p>' },
        { key: 'tab2', label: 'Tab 2', content: '<p>Content 2</p>' }
    ]
});
tabs.render();
```

### 📜 MenuBuilder
Dropdown & Context Menus

```javascript
const menu = new MenuBuilder({
    triggerElement: document.getElementById('menuBtn'),
    items: [
        { label: 'Option 1', action: () => alert('1') },
        { label: 'Option 2', action: () => alert('2') }
    ]
});
```

### 🗂️ SidebarBuilder
Navigation Sidebar mit Search

```javascript
const sidebar = new SidebarBuilder({
    containerId: 'sidebar',
    items: [
        { key: 'home', label: 'Home', icon: '🏠', href: '/' },
        { key: 'users', label: 'Users', icon: '👥', href: '/users' }
    ]
});
sidebar.render();
```

---

## 🔄 Submodule Update

Neue Features/Fixes aus dem SSI-Builders Repo holen:

```bash
cd /Users/martinmollay/Development/dein-projekt
git submodule update --remote vendor/ssi-builders
git add vendor/ssi-builders
git commit -m "Update ssi-builders to latest version"
```

---

## 🏷️ Version Badge

Alle SSI Builders zeigen automatisch ein dezentes Version-Badge in der unten rechten Ecke an.

### Features:
- ✅ Automatisch in allen 7 Builders integriert
- ✅ Zeigt aktuelle Version aus `package.json`
- ✅ Dezentes Design (grau, halbtransparent)
- ✅ Hover-Effekt für bessere Sichtbarkeit
- ✅ Fixed Position (bottom-right)
- ✅ Z-Index 9999 (immer sichtbar)

### CSS Klasse:
```css
.ssi-version-badge {
    position: fixed;
    bottom: 8px;
    right: 8px;
    font-size: 9px;
    color: #999;
    opacity: 0.6;
}
```

### Customization:
Badge-Styles können in `src/shared.css` angepasst werden.

### Programmierung:
```javascript
import { getVersion, createVersionBadge } from './version.js';

// Version abrufen
const version = getVersion(); // "1.0.0"

// Badge HTML generieren
const badgeHtml = createVersionBadge(); // "<div class='ssi-version-badge'>v1.0.0</div>"
```

---

## 🛠️ Development

### Im SSI-Builders Repo:

```bash
cd /Users/martinmollay/Development/ssi-builders

# Dependencies installieren
npm install

# Dev Server starten
npm run dev

# Tests laufen lassen
npm test

# Build für Distribution
npm run build
```

### Version erhöhen:

```bash
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0
```

---

## 📖 Dokumentation

Vollständige Docs: `/docs/`

- [ListBuilder.md](docs/ListBuilder.md)
- [FormBuilder.md](docs/FormBuilder.md)
- [ModalBuilder.md](docs/ModalBuilder.md)
- [ChartBuilder.md](docs/ChartBuilder.md)
- [TabBuilder.md](docs/TabBuilder.md)
- [MenuBuilder.md](docs/MenuBuilder.md)
- [SidebarBuilder.md](docs/SidebarBuilder.md)

---

## 🎨 Icon Management & Weights

SSI Builders bietet ein zentrales Icon-Management-System mit **5 Icon-Presets** und **3 Icon-Weights**.

### Icon Weights (Stroke-Width)

**Thin (1.5)** - Ultra-minimalistisch
- Sehr feiner Strich
- Dezent und elegant
- Perfekt für große UI-Elemente

**Regular (2.0)** - DEFAULT
- Ausgewogen & modern
- Perfekte Lesbarkeit
- Material Design 3 Standard

**Bold (2.5)** - Kräftig
- Starke Betonung
- Gut sichtbar
- Für wichtige Aktionen

### Quick Start

```javascript
import { GlobalConfig, IconManager } from '/vendor/ssi-builders/src/index.js';

// Global konfigurieren (einmalig beim App-Start)
GlobalConfig.configure({
    iconPreset: 'lucide',    // emoji | lucide | heroicons | material | fontawesome
    iconWeight: 'regular'    // thin (1.5) | regular (2.0, DEFAULT) | bold (2.5)
});

// Oder direkt über IconManager
IconManager.setPreset('lucide');
IconManager.setIconWeight('regular');

// Icons in Buildern nutzen
const list = new ListBuilder({
    actions: {
        row: [
            {
                key: 'view',
                icon: IconManager.getIcon('view'),  // Nutzt aktuellen Weight
                label: 'Ansehen'
            }
        ]
    }
});
```

### Verfügbare Icons

15+ Standard-Icons: `add`, `edit`, `delete`, `view`, `search`, `save`, `close`, `settings`, `refresh`, `download`, `upload`, `filter`, `check`, `warning`, `info`

### Demo

Interaktive Icon Weight Demo: [/docs/demos/icon-weight-demo.html](docs/demos/icon-weight-demo.html)

Vollständige Icon System Dokumentation: [/docs/ICON-SYSTEM.md](docs/ICON-SYSTEM.md)

---

## 🎯 Design System

- **Material Design 3** Guidelines
- **Responsive**: Mobile-First
- **Accessibility**: ARIA + Keyboard Navigation
- **Browser Support**: Modern Browsers (ES6+)

---

## 📝 License

MIT © SSI Solutions

---

## 🚀 Used In

- HabDaWas App
- Habbi Suchalgorithmus
- Bazar Bold
- [Weitere SSI-Projekte]

---

**Version:** 2.0.0 | **Last Updated:** 2025-01-21

---

## 🎯 v2.0.0 Highlights

### ✨ Was ist neu?

**🔄 Design Token System** - Google M3 inspired
- Einheitliche Colors, Shadows, Spacing, Typography
- CSS Custom Properties für einfaches Theming

**🎨 Lucide Icons** - Professionelle SVG Icons
- Alle Emojis durch Lucide Icons ersetzt
- 3 Icon Weights: thin, regular, bold
- Konsistent über alle Builder

**📐 Verbesserte UX**
- Bessere Hover-States & Transitions
- Optimierte Mobile-Experience
- Accessibility-Verbesserungen

**📦 8 Builder** (neu: +1)
- Alle bestehenden Builder auf v2.0 aktualisiert
- Vorbereitet für BreadcrumbBuilder, ToastBuilder, CardBuilder
