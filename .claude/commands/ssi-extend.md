# SSI Builder Extension Command (Global)

Führe eine vollständige Erweiterung der SSI-Builders Library durch und synchronisiere zum aktuellen Projekt.

**Auftrag:** $ARGUMENTS

---

## Workflow

### Phase 1: SSI-Builders erweitern

Wechsle zu `/Users/martinmollay/Development/ssi-builders/` und führe durch:

#### 1. IST-Analyse
- Lies die aktuelle Komponente in `src/{ComponentName}.js`
- Prüfe aktuelle Version in `package.json`
- Lies CHANGELOG.md für den Stil
- Prüfe bestehende Demo-Seite in `docs/demos/`

#### 2. Implementierung
- Implementiere das Feature mit JSDoc-Dokumentation
- Verwende `@version` und `@since` Tags
- Nutze `sanitizeHTML()` und `sanitizeAttr()` für Security
- Verwende Design Tokens (`--ssi-*`) statt hardcoded Werte

#### 3. Version Bump (Semantic Versioning)
| Änderung | Bump |
|----------|------|
| Bug Fix | PATCH (2.9.0 → 2.9.1) |
| Neues Feature | MINOR (2.9.0 → 2.10.0) |
| Breaking Change | MAJOR (2.9.0 → 3.0.0) |

Aktualisiere:
- `package.json` → `"version": "{NEW}"`
- `src/{Component}.js` → `@version {NEW}`

#### 4. CHANGELOG.md
```markdown
## [{VERSION}] - {YYYY-MM-DD}

### Added
- **{ComponentName}**: Feature-Beschreibung
  - `methodName(params)` - Was macht die Methode
```

#### 5. Demo-Seite erweitern
- Neue Sektion mit "NEW v{VERSION}" Badge
- Interaktive Demo erstellen
- Code-Beispiele mit CodeSnippetBuilder
- Methods-Tabelle aktualisieren

#### 6. Playwright Tests
- Test in `tests/test-{component}.spec.js`
- Server starten: `cd /Users/martinmollay/Development/ssi-builders && npm run dev`
- Tests ausführen: `npx playwright test tests/test-{component}.spec.js`

---

### Phase 2: Zum aktuellen Projekt synchronisieren

Ermittle das aktuelle Arbeitsverzeichnis und synchronisiere:

```bash
# Sync zu habdawas-analytics (falls dort gearbeitet wird)
rsync -av /Users/martinmollay/Development/ssi-builders/src/{Component}.js \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/src/
rsync -av /Users/martinmollay/Development/ssi-builders/package.json \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/
rsync -av /Users/martinmollay/Development/ssi-builders/CHANGELOG.md \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/
rsync -av /Users/martinmollay/Development/ssi-builders/docs/demos/{component}.html \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/docs/demos/

# Sync zu habdawas-app (falls dort gearbeitet wird)
rsync -av /Users/martinmollay/Development/ssi-builders/src/{Component}.js \
    /Users/martinmollay/Development/habdawas-app/vendor/ssi-builders/src/
rsync -av /Users/martinmollay/Development/ssi-builders/package.json \
    /Users/martinmollay/Development/habdawas-app/vendor/ssi-builders/
rsync -av /Users/martinmollay/Development/ssi-builders/CHANGELOG.md \
    /Users/martinmollay/Development/habdawas-app/vendor/ssi-builders/
```

---

### Phase 3: Feature im aktuellen Projekt nutzen

Zeige dem User ein Beispiel, wie er das neue Feature im aktuellen Projekt verwenden kann:

```javascript
import { {ComponentName} } from '/vendor/ssi-builders/src/index.js';

// Beispiel für das neue Feature
const builder = new {ComponentName}({
    containerId: 'example',
    // ... neue Option/Methode demonstrieren
});
```

---

## Checkliste

- [ ] Feature in ssi-builders implementiert
- [ ] Version erhöht (package.json + src/{Component}.js)
- [ ] CHANGELOG.md aktualisiert
- [ ] Demo-Seite erweitert
- [ ] Playwright Tests geschrieben und bestanden
- [ ] Zu habdawas-analytics synchronisiert
- [ ] Zu habdawas-app synchronisiert (falls vorhanden)
- [ ] Anwendungsbeispiel für aktuelles Projekt gezeigt

---

## Wichtige Pfade

| Zweck | Pfad |
|-------|------|
| SSI-Builders | `/Users/martinmollay/Development/ssi-builders/` |
| Analytics | `/Users/martinmollay/Development/habdawas-analytics/` |
| App | `/Users/martinmollay/Development/habdawas-app/` |
