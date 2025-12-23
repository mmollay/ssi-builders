# Git Hooks (Husky)

Automatische Checks bei Git-Operationen.

## 🎣 Installierte Hooks

### 1. **pre-commit** (Vor jedem Commit)
**Was wird geprüft:**
- ✅ ESLint (auto-fix auf staged files)
- ✅ TypeScript Compilation

**Dauer:** ~5-10 Sekunden

**Bypass (nur wenn nötig!):**
```bash
git commit --no-verify -m "message"
```

---

### 2. **commit-msg** (Commit Message Format)
**Was wird geprüft:**
- ✅ Conventional Commits Format
- ✅ Type muss sein: feat, fix, docs, style, refactor, perf, test, chore

**Erlaubte Formate:**
```bash
feat(timer): add custom duration
fix: resolve auth issue
refactor(settings): improve code structure
```

**Nicht erlaubt:**
```bash
Added new feature        # ❌ Kein type
feature: new timer       # ❌ "feature" statt "feat"
fix timer                # ❌ Kein ":"
```

**Bypass (nur in Notfällen!):**
```bash
git commit --no-verify -m "any message"
```

---

### 3. **pre-push** (Vor jedem Push)
**Was wird geprüft:**
- ✅ ESLint (full project)
- ✅ Build (production build)
- ⚠️ Tests (aktuell auskommentiert)

**Dauer:** ~30-60 Sekunden

**Tests aktivieren:**
Editiere `.husky/pre-push` und entferne `#` vor:
```bash
# npm test || {
#   echo "❌ Tests failed!"
#   exit 1
# }
```

**Bypass (nur wenn sicher!):**
```bash
git push --no-verify
```

---

## 🛠 Anpassungen

### Schnelleren pre-commit (nur ESLint, kein TypeScript)
Editiere `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
# npx tsc --noEmit  # Auskommentiert = schneller
```

### Pre-push ohne Build (nur Lint)
Editiere `.husky/pre-push`:
```bash
npm run lint || exit 1
# npm run build || exit 1  # Auskommentiert
```

### Hooks komplett deaktivieren
```bash
# Temporär (nur für nächsten commit)
git commit --no-verify

# Permanent (nicht empfohlen!)
rm -rf .husky
npm uninstall husky
```

---

## 📊 Performance

| Hook | Durchschnitt | Was läuft |
|------|--------------|-----------|
| pre-commit | ~8s | lint-staged + tsc |
| commit-msg | < 1s | Regex check |
| pre-push | ~45s | lint + build |

**Tipp:** Wenn pre-push zu langsam → Build auskommentieren

---

## 🚨 Troubleshooting

### "husky: command not found"
```bash
npm install
```

### Hooks werden nicht ausgeführt
```bash
# Permissions setzen
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push

# Husky neu installieren
npm run prepare
```

### "lint-staged: command not found"
```bash
npm install --save-dev lint-staged
```

---

## 🎯 Best Practices

**DO:**
- ✅ Hooks normal laufen lassen (fängt Fehler früh ab)
- ✅ Bei Fehlern verstehen und fixen
- ✅ Hooks anpassen wenn zu langsam

**DON'T:**
- ❌ Permanent `--no-verify` nutzen (defeats purpose)
- ❌ Hooks löschen statt anpassen
- ❌ Broken code committen mit `--no-verify`

---

Check!!
