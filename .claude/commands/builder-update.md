# BUILDER-UPDATE - Sync Version Across All Files

**Synchronisiert die SSI Builders Version überall im System**

---

## 1. Version aus package.json lesen

```bash
node -p "require('./package.json').version"
```

**Source of Truth:** `package.json` → Version

---

## 2. Alle Files mit Version finden

```bash
grep -r "VERSION.*=.*['\"].*[0-9]" src/ docs/ index.html --include="*.js" --include="*.html"
grep -r "version:.*['\"].*[0-9]" src/ docs/ --include="*.js"
```

**Typische Locations:**
- `src/version.js` - VERSION Konstante
- `docs/demos/layout.js` - Sidebar version property
- `index.html` - Möglicherweise hardcoded
- Alle Builder-Files (z.B. `FormBuilder.js`, `ListBuilder.js`, etc.)

---

## 3. Zeige aktuelle Version-Inkonsistenzen

**Vergleiche:**
```
package.json:     2.3.0
src/version.js:   2.3.0 ✅
layout.js:        2.3.0 ✅
FormBuilder.js:   2.3.0 ✅
...
```

Falls Inkonsistenzen: **WARNUNG anzeigen!**

---

## 4. Update Version in allen Files

**Read package.json Version:**
```javascript
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const newVersion = pkg.version;
```

**Update Files:**

### a) src/version.js
```javascript
// Find: const VERSION = 'X.X.X';
// Replace with: const VERSION = '{newVersion}';
```

### b) docs/demos/layout.js
```javascript
// Find: version: 'X.X.X',
// Replace with: version: '{newVersion}',
```

### c) Alle anderen Builder Files
```javascript
// Such nach allen Vorkommen und update
```

---

## 5. Verification

**Nach Update prüfen:**

```bash
# Zeige alle Vorkommen der neuen Version
grep -r "2\.3\.0" src/ docs/ --include="*.js" | wc -l

# Git diff - Was wurde geändert?
git diff --stat
git diff src/version.js docs/demos/layout.js
```

**Zeige User:**
```
✅ VERSION UPDATE COMPLETE

Neue Version: 2.3.0

Updated Files:
  ✅ src/version.js
  ✅ docs/demos/layout.js
  ✅ index.html
  ✅ [Weitere Files...]

Git Diff:
  M src/version.js
  M docs/demos/layout.js
```

---

## 6. Optional: Commit

**Frage User:**
"Version aktualisiert! Möchtest du committen?"

Falls JA:
```bash
git add -A
git commit -m "chore: Update version to v{newVersion}

- Synced version across all files
- Updated version.js, layout.js, and builder files

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
"
```

---

## 🎯 Use Cases

### Nach `npm version patch/minor/major`:
```
1. npm version minor → package.json: 2.3.0
2. /builder-update → Sync alle Files
3. /commit oder /github
```

### Bei manueller Version-Änderung:
```
1. package.json manuell editiert: 3.0.0
2. /builder-update → Sync alle Files
```

### Check ob alles sync:
```
/builder-update → Zeigt Inkonsistenzen
```

---

## 🚨 Important

- **Source of Truth:** Immer `package.json`
- **NIEMALS** package.json Version automatisch ändern
- **NUR** andere Files an package.json anpassen
- **IMMER** Git diff zeigen vor Commit

---

## 📝 Alternative: Auto-Sync Script

Für zukünftige Automatisierung könnte ein Node.js Script erstellt werden:

```javascript
// scripts/sync-version.js
const fs = require('fs');
const pkg = require('./package.json');
const version = pkg.version;

// Update all files
// ...
```

**Integration:**
```json
"scripts": {
  "version:sync": "node scripts/sync-version.js"
}
```

---

**Check!!** ✅
