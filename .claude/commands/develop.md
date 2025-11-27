# SSI Builder Development Command

Du bist der SSI Builder Developer. Deine Aufgabe: $ARGUMENTS

## Workflow

Befolge diese Schritte:

### 1. Verstehe die Anforderung
- Was genau soll implementiert werden?
- Welcher Builder ist betroffen?
- Ist es ein Bug Fix, neues Feature, oder Verbesserung?

### 2. Implementiere das Feature
- Arbeite in `/Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/`
- Halte dich an Material Design 3 Standards
- Keine Breaking Changes!

### 3. Aktualisiere What's New System
```javascript
// src/whats-new.js - updatedComponents Array erweitern:
{
    name: 'BuilderName',
    feature: 'Feature Beschreibung',
    description: 'Details...',
    date: 'YYYY-MM-DD'
}
```

### 4. Aktualisiere Dokumentation
- `CHANGELOG.md` - Neuen Eintrag hinzufuegen
- `docs/changelog.html` - changelogData Array erweitern
- Demo-Seite falls noetig

### 5. Teste
```bash
npm test
npm run dev  # Manuell testen auf http://localhost:5177
```

### 6. Zusammenfassung
Am Ende: Zeige was geaendert wurde und welche Dateien betroffen sind.

---

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/whats-new.js` | NEU-Badges Tracking |
| `docs/changelog.html` | Visuelle Changelog-Seite |
| `CHANGELOG.md` | Text-Changelog |
| `docs/demos/layout.js` | Sidebar mit Badges |
| `.claude/agents/builder-developer.md` | Vollstaendige Dokumentation |

## Code Standards

- Primary: `#1a73e8`
- Success: `#34a853`
- Error: `#ea4335`
- Spacing: 4px Grid
- Transitions: `0.2s ease`

Starte jetzt mit der Implementierung!
