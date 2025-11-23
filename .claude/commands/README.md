# SSI Builders - Custom Slash Commands

**Persönliche Claude Code Commands für effizienten Workflow**

---

## 📍 Command Locations

**GLOBAL Commands** (`~/.claude/commands/`) - Verfügbar in ALLEN Projekten:
- `/test` - Comprehensive Testing
- `/commit` - Intelligent Git Commit
- `/clear` - Context-Optimierung
- `/resume` - Session fortsetzen
- `/github` - Production-Ready Release
- `/status` - Quick Project Status

**PROJECT Commands** (`.claude/commands/`) - Nur SSI Builders:
- `/builder-update` - Version Sync (SSI-spezifisch)

---

## 📚 Verfügbare Commands

### 🔄 `/builder-update` **(PROJECT)**
**Version Sync across all files**

- Version aus package.json lesen (Source of Truth)
- Alle Files mit hardcoded Version finden
- Inkonsistenzen anzeigen
- Alle Versionen synchronisieren
- Git diff zeigen
- Optional: Commit

**Nutze nach:** `npm version patch/minor/major`, manuelle Version-Änderung

---

### 🧹 `/clear` **(GLOBAL)**
**Context-Optimierung vor Session Reset**

- Git Status + Auto-Commit (Token-Optimierung!)
- Todo-Liste sichern
- Tests ausführen
- Context Summary erstellen (`.claude/session-context.md`)
- Browser cleanup
- Temp Files löschen

**Nutze vor:** Context wird zu groß, Session-Ende

---

### 🔄 `/resume` **(GLOBAL)**
**Session nach Clear fortsetzen**

- `.claude/session-context.md` laden
- Git Status anzeigen
- Todo-Liste wiederherstellen
- Playwright prüfen/starten
- "Wo weitermachen?" Summary

**Nutze nach:** `/clear` wurde ausgeführt

---

### 🧪 `/test` **(GLOBAL)**
**Comprehensive Testing**

- Playwright Tests ausführen
- Browser öffnen (falls nicht läuft)
- Console Errors prüfen (SOFORT fixen!)
- Visual Screenshot
- Test Summary mit Status

**Nutze:** Vor Commits, während Development, vor `/github`

---

### 📊 `/status` **(GLOBAL)**
**Quick Project Status**

- Git Status (Branch, Commit, Changes)
- Todo-Liste (completed/total)
- Browser/Server Status
- Recent Changes Summary
- Kompakte Ausgabe

**Nutze:** Schneller Überblick, nach längerer Pause

---

### 💾 `/commit` **(GLOBAL)**
**Intelligent Git Commit**

- Änderungen analysieren
- Conventional Commits Format
- Commit Message draften
- Git Safety Checks
- Post-Commit Verification

**Nutze:** Features completed, Bug fixes done

---

### 🚀 `/github` **(GLOBAL)**
**Production-Ready Release**

**FULL CHECKLIST:**
1. ✅ brutal-code-review-manager (MANDATORY!)
2. ✅ Playwright Tests (MÜSSEN passen!)
3. ✅ Version Bump (patch/minor/major)
4. ✅ CHANGELOG.md Update
5. ✅ Final Checks (Todos, Git, Browser)
6. ✅ Git Tag & Push

**Nutze:** Release bereit, Production-Deploy

---

## 🔗 Command Workflow

### Standard Development:
```
1. Work on feature
2. /test (während Development)
3. /commit (Feature completed)
4. /status (Quick check)
5. /github (Ready for release)
   → npm version minor
   → /builder-update (Version sync)
   → git push
```

### Bei großem Context:
```
1. /clear (Context optimieren)
2. [Claude Code restart]
3. /resume (Weiterarbeiten)
```

### Quick Check:
```
1. /status (Wo stehe ich?)
2. /test (Läuft alles?)
```

---

## 📝 Best Practices

### Wann welchen Command?

| Situation | Command |
|-----------|---------|
| Feature fertig | `/commit` |
| Ready for production | `/github` |
| Nach Version Bump | `/builder-update` |
| Context > 150k tokens | `/clear` |
| Nach Pause/Break | `/status` → `/resume` |
| Während Development | `/test` |
| "Wo bin ich?" | `/status` |

---

## 🎯 Command Cheat Sheet

```bash
/builder-update  # Version synchronisieren
/clear           # Context optimieren & speichern
/resume          # Session fortsetzen
/test            # Tests + Browser + Console
/status          # Quick Überblick
/commit          # Git Commit mit Best Practices
/github          # 🚀 PRODUCTION RELEASE
```

---

**Version:** 1.0.0 | **Created:** 2025-11-23
