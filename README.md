# 🏗️ SSI Builders

**Professional UI Component Library** - Material Design 3 | Production-Ready

Zentrale UI-Komponenten-Bibliothek für alle SSI-Projekte. Entwickelt für Konsistenz, Wiederverwendbarkeit und schnelle Entwicklung.

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

```javascript
const list = new ListBuilder({
    containerId: 'myTable',
    data: users,
    columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'E-Mail', sortable: true }
    ],
    options: {
        searchable: true,
        pagination: true,
        itemsPerPage: 10
    }
});
list.render();
```

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

**Version:** 1.0.0 | **Last Updated:** 2025-11-20
