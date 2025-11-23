# SSI Builders - Scripts

**Automation Scripts für SSI Builders Projekt**

---

## 📄 sync-version.js

**Synchronisiert die Version über alle Files**

### Purpose
Stellt sicher dass die Version aus `package.json` (Source of Truth) in allen Files konsistent ist:
- `src/version.js` - VERSION Konstante
- `docs/demos/layout.js` - Sidebar version property

### Usage

```bash
# Via npm script (recommended)
npm run version:sync

# Direct execution
node scripts/sync-version.js
```

### Output

```
🔄 Syncing version to: 2.2.0

✅ src/version.js - Already up to date (Version constant)
✅ docs/demos/layout.js - Already up to date (Sidebar version)

==================================================
📊 SUMMARY
==================================================
Version: 2.2.0
Files checked: 2
Files updated: 0
Errors: 0

✅ Version sync complete!
```

### When to use

**Nach Version Bump:**
```bash
npm version minor     # 2.2.0 → 2.3.0
npm run version:sync  # Sync all files
git add -A
git commit -m "chore: Sync version to v2.3.0"
```

**Check Consistency:**
```bash
npm run version:sync  # Shows if files are out of sync
```

### Integration with /github Command

Der `/github` Slash Command ruft automatisch `npm run version:sync` auf um Konsistenz sicherzustellen.

---

## 🔧 How it works

1. **Read** `package.json` → Version (Source of Truth)
2. **Find** all files with hardcoded version
3. **Replace** version strings with current version
4. **Verify** all files updated successfully
5. **Report** summary

---

## 📝 Adding new files

Um weitere Files zur Version-Sync hinzuzufügen, editiere `sync-version.js`:

```javascript
const filesToUpdate = [
  {
    path: 'src/version.js',
    pattern: /const VERSION = '[^']+';/,
    replacement: `const VERSION = '${VERSION}';`,
    description: 'Version constant'
  },
  // Add your file here:
  {
    path: 'path/to/your/file.js',
    pattern: /your-pattern-here/,
    replacement: `your replacement with ${VERSION}`,
    description: 'Description'
  }
];
```

---

**Version:** 1.0.0 | **Created:** 2025-11-23
