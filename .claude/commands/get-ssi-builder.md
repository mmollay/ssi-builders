# Get SSI-Builder Update

**Automatisches Update des SSI-Builders Git Submodule auf die neueste Version.**

## Aufgabe

Du sollst das SSI-Builders Submodule (`vendor/ssi-builders`) auf die neueste verfügbare Version updaten.

## Schritt-für-Schritt Anleitung

### 1. Aktuellen Stand prüfen

```bash
# Check current version
cd vendor/ssi-builders && git describe --tags && cd ../..
```

### 2. Submodule Update durchführen

```bash
# Fetch latest from remote
cd vendor/ssi-builders && git fetch origin --tags

# Get latest tag
LATEST_TAG=$(git describe --tags $(git rev-list --tags --max-count=1))

# Checkout latest tag
git checkout $LATEST_TAG

# Zurück zum Hauptprojekt
cd ../..
```

### 3. CHANGELOG Review

```bash
# Zeige CHANGELOG der neuen Version
cat vendor/ssi-builders/CHANGELOG.md | head -100
```

**Wichtig:** Analysiere die CHANGELOG-Einträge und identifiziere:
- **Breaking Changes** (BREAKING:)
- **Neue Features** (Added:, New:)
- **Bug Fixes** (Fixed:)
- **Deprecated Features**

### 4. Breaking Changes Check

Prüfe ob Breaking Changes Code-Anpassungen erfordern:

**v2.0+ Breaking Changes:**
- CSS Custom Properties: `--primary-color` → `--ssi-primary`
- Icons: Emojis → Lucide SVG Icons (IconManager)
- Design Tokens: Neue Variable-Namen

Suche im Projekt nach:
```bash
# Deprecated CSS vars
grep -r "\-\-primary-color\|\-\-text-primary\|\-\-spacing-md" . --include="*.css" --include="*.html" | grep -v vendor/

# Icon usage
grep -r "emoji.*icon\|👁\|🗑\|✏️" . --include="*.html" --include="*.js" | grep -v vendor/
```

### 5. Commit erstellen

```bash
# Stage submodule update
git add vendor/ssi-builders

# Commit with detailed message
git commit -m "Update ssi-builders to $LATEST_TAG

[Brief description of major changes from CHANGELOG]

See: vendor/ssi-builders/CHANGELOG.md"
```

### 6. Output für User

Erstelle eine Zusammenfassung:

```markdown
## SSI-Builders Update: v[OLD] → v[NEW]

### 🎯 Neue Features:
- [Feature 1]
- [Feature 2]

### ⚠️ Breaking Changes:
- [Change 1]
- [Change 2]

### 📝 Erforderliche Anpassungen:
- [ ] CSS Variables migrieren
- [ ] IconManager integrieren
- [ ] Tests ausführen

### ✅ Next Steps:
1. Tests ausführen: `npm test`
2. Code-Anpassungen vornehmen (falls nötig)
3. Commit pushen
```

## Wichtige Regeln

1. **IMMER** CHANGELOG lesen und analysieren
2. **IMMER** Breaking Changes identifizieren
3. **IMMER** Projekt-Code auf Kompatibilität prüfen
4. **IMMER** ausführliche Commit-Message schreiben
5. **NIEMALS** automatisch pushen (User entscheidet)
6. **NIEMALS** Breaking Changes ignorieren

## Fehlerbehandlung

Falls `vendor/ssi-builders` nicht existiert:
```bash
git submodule update --init --recursive
```

Falls Submodule detached HEAD hat:
```bash
cd vendor/ssi-builders
git fetch origin
git checkout main
git pull origin main
cd ../..
```

## Erfolgs-Kriterien

✅ Submodule auf neuesten Tag gecheckout
✅ CHANGELOG analysiert
✅ Breaking Changes identifiziert
✅ Commit erstellt mit sinnvoller Message
✅ User informiert über erforderliche Anpassungen

---

**WICHTIG:** Führe nach dem Update IMMER `npm test` aus, um Kompatibilität zu prüfen!
