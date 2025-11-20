# SSI Builders - Quick Reference Guide
**Kompakte Guideline für Entwicklung & Integration** | Version 1.0.0 | 2025-11-20

---

## 🎯 Das System

```
┌──────────────────────┐         ┌─────────────────────────┐
│  ssi-builders        │         │  habbi-suchalgorytmus   │
│  (GitHub Central)    │◄────────┤  vendor/ssi-builders/   │
│  git@github.com:     │ Submodule│  (Local Copy)           │
│  mmollay/ssi-builders│         └─────────────────────────┘
└──────────────────────┘
```

**Wichtig:** Code ist LOKAL im Submodule, nicht live von GitHub!

---

## ⚡ Quick Commands

### In ssi-builders (Feature entwickeln)
```bash
cd /Users/martinmollay/Development/ssi-builders

# 1. Feature entwickeln + testen
npm test

# 2. Version erhöhen
npm version patch   # Bug fix (1.0.0 → 1.0.1)
npm version minor   # Feature  (1.0.0 → 1.1.0)
npm version major   # Breaking (1.0.0 → 2.0.0)

# 3. Zu GitHub pushen
git push && git push --tags
```

### In habbi-suchalgorytmus (Feature nutzen)
```bash
cd /Users/martinmollay/Development/habbi-suchalgorytmus

# 1. Neue Version holen
git submodule update --remote vendor/ssi-builders

# 2. Testen
npm test

# 3. Committen
git add vendor/ssi-builders
git commit -m "Update ssi-builders to v1.x.x"
git push
```

---

## 📋 Workflow (Real-World Beispiel)

**Szenario:** "Ich brauche neues Feature im ModalBuilder"

| Schritt | Wo? | Befehl |
|---------|-----|--------|
| 1. Feature entwickeln | `ssi-builders` | Code + Tests schreiben |
| 2. Testen | `ssi-builders` | `npm test` |
| 3. Versionieren | `ssi-builders` | `npm version minor` |
| 4. Pushen | `ssi-builders` | `git push && git push --tags` |
| 5. Update holen | `habbi-suchalgorytmus` | `git submodule update --remote` |
| 6. Nutzen | `habbi-suchalgorytmus` | Feature verwenden |
| 7. Testen | `habbi-suchalgorytmus` | `npm test` |
| 8. Committen | `habbi-suchalgorytmus` | `git add vendor/... && git commit` |

---

## 🛠️ Verfügbare Builder

| Builder | Purpose | Import |
|---------|---------|--------|
| 📋 **ListBuilder** | Datentabellen | `import { ListBuilder } from '/vendor/ssi-builders/src/ListBuilder.js';` |
| 📝 **FormBuilder** | Formulare | `import { FormBuilder } from '/vendor/ssi-builders/src/FormBuilder.js';` |
| 🪟 **ModalBuilder** | Dialoge (9 Größen) | `import { ModalBuilder } from '/vendor/ssi-builders/src/ModalBuilder.js';` |
| 📊 **ChartBuilder** | Charts | `import { ChartBuilder } from '/vendor/ssi-builders/src/ChartBuilder.js';` |
| 📑 **TabBuilder** | Tabs | `import { TabBuilder } from '/vendor/ssi-builders/src/TabBuilder.js';` |
| 📜 **MenuBuilder** | Menus | `import { MenuBuilder } from '/vendor/ssi-builders/src/MenuBuilder.js';` |
| 🗂️ **SidebarBuilder** | Sidebar | `import { SidebarBuilder } from '/vendor/ssi-builders/src/SidebarBuilder.js';` |

---

## 📝 Code-Beispiele

### Modal öffnen
```javascript
import { ModalBuilder } from '/vendor/ssi-builders/src/ModalBuilder.js';

ModalBuilder.alert({
    title: 'Erfolg',
    message: 'Gespeichert!'
});
```

### Formular erstellen
```javascript
import { FormBuilder } from '/vendor/ssi-builders/src/FormBuilder.js';

const form = new FormBuilder({
    containerId: 'myForm',
    fields: [
        { key: 'name', type: 'text', label: 'Name', required: true }
    ],
    onSubmit: async (data) => { await save(data); }
});
form.render();
```

### Tabelle anzeigen
```javascript
import { ListBuilder } from '/vendor/ssi-builders/src/ListBuilder.js';

const list = new ListBuilder({
    containerId: 'myList',
    data: items,
    columns: [
        { key: 'name', label: 'Name', sortable: true }
    ]
});
list.render();
```

---

## ✅ Regeln (Das MUSS beachtet werden!)

### DO:
- ✅ Immer in `ssi-builders` entwickeln (NICHT in Submodule!)
- ✅ Vor Commit: `npm test` in beiden Repos
- ✅ Semantic Versioning: patch/minor/major korrekt
- ✅ CHANGELOG.md + README.md aktualisieren
- ✅ Beide Repos pushen (ssi-builders + habbi-suchalgorytmus)

### DON'T:
- ❌ NIEMALS in `vendor/ssi-builders/` editieren!
- ❌ Keine Breaking Changes ohne Major Version
- ❌ Keine Commits ohne Tests
- ❌ Push nicht vergessen (beide Repos!)

---

## 🚨 Troubleshooting

### "Submodule zeigt alte Version"
```bash
cd /Users/martinmollay/Development/habbi-suchalgorytmus
git submodule update --remote --force vendor/ssi-builders
```

### "Änderungen versehentlich in Submodule gemacht"
```bash
cd vendor/ssi-builders
git stash                    # Änderungen sichern
git checkout main            # Zurück zu main
cd /Users/martinmollay/Development/ssi-builders
# Dort richtig entwickeln
```

### "Tests schlagen fehl"
```bash
# In ssi-builders
npx playwright install       # Browser neu installieren
npm test                     # Tests ausführen

# In habbi-suchalgorytmus
git submodule update --init  # Submodule neu laden
npm test
```

### "Version falsch erhöht"
```bash
# Zurücksetzen (VOR push)
git tag -d v1.2.0           # Tag löschen
git reset --hard HEAD~1     # Commit rückgängig

# Richtig machen
npm version minor           # Oder was auch immer
git push && git push --tags
```

---

## 🔧 Agent Commands

### In habbi-suchalgorytmus:
```
@ssi-builder-manager
"Ich brauche Feature XYZ im ModalBuilder"
```

### In ssi-builders:
```
@builder-developer
"Füge Feature XYZ zum ModalBuilder hinzu"
```

---

## 📊 File Structure

### ssi-builders (Central)
```
ssi-builders/
├── src/
│   ├── index.js              # Main export
│   ├── ListBuilder.js/.css
│   ├── FormBuilder.js/.css
│   ├── ModalBuilder.js/.css
│   ├── ChartBuilder.js/.css
│   ├── TabBuilder.js/.css
│   ├── MenuBuilder.js/.css
│   ├── SidebarBuilder.js/.css
│   └── shared.css
├── tests/
├── package.json
├── CLAUDE.md
├── README.md
└── CHANGELOG.md
```

### habbi-suchalgorytmus (Consuming)
```
habbi-suchalgorytmus/
├── vendor/
│   └── ssi-builders/         # Submodule (Read-Only!)
├── index.html
├── main.js
└── CLAUDE.md                 # SSI Builders Integration
```

---

## 🎯 Checkliste: Neues Feature

- [ ] Feature in `ssi-builders` entwickeln
- [ ] Tests schreiben (`npm test`)
- [ ] README.md aktualisieren
- [ ] CHANGELOG.md aktualisieren
- [ ] Version erhöhen (`npm version minor`)
- [ ] Zu GitHub pushen (`git push && git push --tags`)
- [ ] In `habbi-suchalgorytmus` updaten (`git submodule update --remote`)
- [ ] Feature nutzen & testen
- [ ] Beide Repos committen & pushen

---

## 🔗 Links

- **GitHub SSI Builders:** https://github.com/mmollay/ssi-builders
- **GitHub Habbi:** https://github.com/mmollay/habbi-suchalgorytmus
- **Local SSI Builders:** `/Users/martinmollay/Development/ssi-builders`
- **Local Habbi:** `/Users/martinmollay/Development/habbi-suchalgorytmus`

---

## 📞 Schnellreferenz

| Frage | Antwort |
|-------|---------|
| Wo entwickeln? | `ssi-builders` (NIEMALS in Submodule!) |
| Wo nutzen? | `habbi-suchalgorytmus` |
| Wie updaten? | `git submodule update --remote` |
| Wie versionieren? | `npm version patch/minor/major` |
| Tests laufen? | `npm test` (in BEIDEN Repos) |
| Code live geladen? | ❌ NEIN! Lokal im Submodule |

---

**© SSI Solutions 2025** | v1.0.0
