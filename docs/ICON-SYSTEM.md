# Icon Management System

**Zentrale Icon-Verwaltung für alle SSI Builders**

---

## 🎯 Problem gelöst

Bisher musste man Icons manuell als Emojis oder SVG-Strings übergeben:

```javascript
// ❌ Umständlich und inkonsistent
actions: {
    row: [
        { key: 'edit', icon: '✏️', label: 'Bearbeiten' },
        { key: 'delete', icon: '<svg>...</svg>', label: 'Löschen' }
    ]
}
```

Mit dem **IconManager** kannst du:
- **Zentral ein Icon-System wählen** (Emojis, Lucide, Heroicons, Material, FontAwesome)
- **Einmal konfigurieren, überall nutzen**
- **Individuell überschreiben** wenn nötig

---

## 🚀 Quick Start

### 1. Global Icon-System festlegen

```javascript
import { IconManager } from '/vendor/ssi-builders/src/index.js';

// Einmal beim App-Start konfigurieren
IconManager.setPreset('lucide'); // oder 'emoji', 'heroicons', 'material', 'fontawesome'
```

### 2. Icons in Buildern nutzen

```javascript
import { ListBuilder, IconManager } from '/vendor/ssi-builders/src/index.js';

const list = new ListBuilder({
    containerId: 'myList',
    columns: [...],
    dataSource: async () => users,
    actions: {
        row: [
            {
                key: 'view',
                icon: IconManager.getIcon('view'), // Nutzt globales Preset
                label: 'Ansehen',
                handler: (row) => viewUser(row)
            },
            {
                key: 'edit',
                icon: IconManager.getIcon('edit'),
                label: 'Bearbeiten',
                handler: (row) => editUser(row)
            },
            {
                key: 'delete',
                icon: IconManager.getIcon('delete'),
                label: 'Löschen',
                displayType: 'button-icon',
                buttonType: 'danger',
                handler: (row) => deleteUser(row)
            }
        ]
    }
});
```

---

## 📚 Verfügbare Icons

Der IconManager bietet 15+ häufig genutzte Icons:

| Icon Name | Emoji | Lucide | Heroicons | Material | FontAwesome |
|-----------|-------|--------|-----------|----------|-------------|
| `add` | ➕ | ✓ | ✓ | ✓ | ✓ |
| `edit` | ✏️ | ✓ | ✓ | ✓ | ✓ |
| `delete` | 🗑️ | ✓ | ✓ | ✓ | ✓ |
| `view` | 👁️ | ✓ | ✓ | ✓ | ✓ |
| `search` | 🔍 | ✓ | ✓ | ✓ | ✓ |
| `save` | 💾 | ✓ | ✓ | ✓ | ✓ |
| `close` | ✖️ | ✓ | ✓ | ✓ | ✓ |
| `settings` | ⚙️ | ✓ | ✓ | ✓ | ✓ |
| `refresh` | 🔄 | ✓ | ✓ | ✓ | ✓ |
| `download` | ⬇️ | ✓ | ✓ | ✓ | ✓ |
| `upload` | ⬆️ | ✓ | ✓ | ✓ | ✓ |
| `filter` | 🔽 | ✓ | ✓ | ✓ | ✓ |
| `check` | ✅ | ✓ | ✓ | ✓ | ✓ |
| `warning` | ⚠️ | ✓ | ✓ | ✓ | ✓ |
| `info` | ℹ️ | ✓ | ✓ | ✓ | ✓ |

Alle Icons anzeigen:
```javascript
console.log(IconManager.getAvailableIcons());
// ['add', 'edit', 'delete', 'view', ...]
```

---

## 🎨 Icon-Presets

### Emoji (Standard in vielen Beispielen)
```javascript
IconManager.setPreset('emoji');
IconManager.getIcon('edit'); // ✏️
```

**Vorteile:**
- Keine externen Abhängigkeiten
- Funktioniert überall
- Farbig und expressiv

**Nachteile:**
- Inkonsistente Darstellung je nach OS/Browser
- Begrenzte Auswahl

---

### Lucide Icons (Empfohlen!)
```javascript
IconManager.setPreset('lucide');
IconManager.getIcon('edit');
// <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"...>
```

**Vorteile:**
- Modern und schön
- Konsistentes Design
- Inline SVG (keine externe Library)
- Perfekt für M3 Design

**Nachteile:**
- Etwas mehr HTML im Code

---

### Heroicons
```javascript
IconManager.setPreset('heroicons');
```

**Tailwind CSS Icon-Set** - Perfekt wenn du bereits Tailwind nutzt.

---

### Material Icons
```javascript
IconManager.setPreset('material');
IconManager.getIcon('edit');
// <i class="material-icons">edit</i>
```

**Voraussetzung:**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

---

### FontAwesome
```javascript
IconManager.setPreset('fontawesome');
IconManager.getIcon('edit');
// <i class="fa fa-edit"></i>
```

**Voraussetzung:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

---

## 🔧 Erweiterte Nutzung

### Icon für einzelne Action überschreiben

```javascript
actions: {
    row: [
        // Nutzt globales Preset (z.B. Lucide)
        {
            key: 'edit',
            icon: IconManager.getIcon('edit'),
            label: 'Bearbeiten'
        },

        // Override: Nutzt Emoji für diese eine Action
        {
            key: 'delete',
            icon: IconManager.getIcon('delete', 'emoji'), // ⚠️ 2. Parameter!
            label: 'Löschen',
            buttonType: 'danger'
        }
    ]
}
```

### Custom Icons registrieren

```javascript
IconManager.registerIcon('star', {
    emoji: '⭐',
    lucide: '<svg>...dein Custom SVG...</svg>',
    heroicons: '<svg>...</svg>',
    material: '<i class="material-icons">star</i>',
    fontawesome: '<i class="fa fa-star"></i>'
});

// Jetzt nutzbar wie jedes andere Icon
IconManager.getIcon('star');
```

---

## 💡 Best Practices

### 1. Einmal konfigurieren (App-Start)

```javascript
// main.js oder app.js
import { IconManager } from '/vendor/ssi-builders/src/index.js';

// Projekt-weite Einstellung
IconManager.setPreset('lucide'); // Oder dein bevorzugtes System
```

### 2. Konsistenz wahren

```javascript
// ✅ GUT - Überall IconManager nutzen
{
    icon: IconManager.getIcon('edit'),
    label: 'Bearbeiten'
}

// ❌ SCHLECHT - Manuell hardcoded
{
    icon: '✏️', // Inkonsistent wenn Preset=lucide
    label: 'Bearbeiten'
}
```

### 3. Icons mit Button-Typen kombinieren

```javascript
actions: {
    row: [
        {
            key: 'view',
            icon: IconManager.getIcon('view'),
            label: 'Ansehen',
            displayType: 'icon', // Kompakt
            handler: viewItem
        },
        {
            key: 'delete',
            icon: IconManager.getIcon('delete'),
            label: 'Löschen',
            displayType: 'button-icon', // Vollständiger Button
            buttonType: 'danger',
            handler: deleteItem
        }
    ]
}
```

---

## 🎯 Real-World Beispiel

```javascript
import { ListBuilder, FormBuilder, IconManager } from '/vendor/ssi-builders/src/index.js';

// === App Initialization ===
IconManager.setPreset('lucide'); // Ein Mal konfigurieren

// === ListBuilder ===
const userList = new ListBuilder({
    containerId: 'users',
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'E-Mail' }
    ],
    dataSource: async () => fetchUsers(),
    actions: {
        toolbar: [
            {
                key: 'add',
                icon: IconManager.getIcon('add'),
                label: 'Benutzer hinzufügen',
                type: 'primary',
                handler: () => showAddUserForm()
            },
            {
                key: 'refresh',
                icon: IconManager.getIcon('refresh'),
                label: 'Aktualisieren',
                handler: () => userList.refresh()
            }
        ],
        row: [
            {
                key: 'view',
                icon: IconManager.getIcon('view'),
                label: 'Ansehen',
                displayType: 'icon',
                handler: (user) => viewUser(user)
            },
            {
                key: 'edit',
                icon: IconManager.getIcon('edit'),
                label: 'Bearbeiten',
                displayType: 'icon',
                handler: (user) => editUser(user)
            },
            {
                key: 'delete',
                icon: IconManager.getIcon('delete'),
                label: 'Löschen',
                displayType: 'button-icon',
                buttonType: 'danger',
                handler: async (user) => {
                    if (confirm(`${user.name} wirklich löschen?`)) {
                        await deleteUser(user.id);
                        userList.refresh();
                    }
                }
            }
        ]
    }
});

// === FormBuilder ===
const editForm = new FormBuilder({
    containerId: 'editForm',
    fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'E-Mail', type: 'email', required: true }
    ],
    submitLabel: 'Speichern',
    onSubmit: async (data) => {
        await saveUser(data);
    }
});
```

---

## 🔄 Migration von altem Code

### Vorher (ohne IconManager)

```javascript
actions: {
    row: [
        {
            key: 'edit',
            icon: '✏️', // Hardcoded Emoji
            label: 'Bearbeiten'
        },
        {
            key: 'delete',
            icon: '<svg xmlns="http://www.w3.org/2000/svg">...</svg>', // Langer SVG String
            label: 'Löschen'
        }
    ]
}
```

### Nachher (mit IconManager)

```javascript
// Einmal: Preset wählen
IconManager.setPreset('lucide');

actions: {
    row: [
        {
            key: 'edit',
            icon: IconManager.getIcon('edit'), // Sauber!
            label: 'Bearbeiten'
        },
        {
            key: 'delete',
            icon: IconManager.getIcon('delete'), // Lesbar!
            label: 'Löschen'
        }
    ]
}
```

---

## 📦 Zusammenfassung

**IconManager bietet:**
- ✅ **Zentrale Konfiguration** - Ein Preset für die ganze App
- ✅ **5 Icon-Systeme** - Emoji, Lucide, Heroicons, Material, FontAwesome
- ✅ **15+ Standard-Icons** - Die häufigsten Actions abgedeckt
- ✅ **Erweiterbar** - Custom Icons registrieren
- ✅ **Individuell überschreibbar** - Preset pro Icon möglich
- ✅ **Zero Dependencies** (außer bei Material/FontAwesome)
- ✅ **Type-Safe** (bei TypeScript-Nutzung)

**Empfehlung:** Nutze **Lucide Icons** für moderne, konsistente M3-konforme UIs!

---

**Version:** 1.2.0 | **Last Updated:** 2025-11-20
