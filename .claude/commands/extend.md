# SSI Builder Extension Command

Führe eine vollständige Erweiterung der SSI-Builders Library durch.

**Auftrag:** $ARGUMENTS

---

## Deine Aufgabe

Führe ALLE folgenden Schritte vollständig und in Reihenfolge durch:

### 1. IST-Analyse
- Lies die aktuelle Komponente in `/src/{ComponentName}.js`
- Prüfe aktuelle Version in `package.json`
- Lies CHANGELOG.md für den Stil
- Prüfe bestehende Demo-Seite in `/docs/demos/`

### 2. Implementierung
- Implementiere das Feature mit JSDoc-Dokumentation
- Verwende `@version` und `@since` Tags
- Nutze `sanitizeHTML()` und `sanitizeAttr()` für Security
- Verwende Design Tokens (`--ssi-*`) statt hardcoded Werte

### 3. Version Bump (Semantic Versioning)
- Bug Fix → PATCH (2.9.0 → 2.9.1)
- Neues Feature → MINOR (2.9.0 → 2.10.0)
- Breaking Change → MAJOR (2.9.0 → 3.0.0)

Aktualisiere:
- `package.json` → `"version": "{NEW}"`
- `src/{Component}.js` → `@version {NEW}`

### 4. CHANGELOG.md
Format:
```markdown
## [{VERSION}] - {YYYY-MM-DD}

### Added
- **{ComponentName}**: Feature-Beschreibung
  - `methodName(params)` - Was macht die Methode
```

### 5. Demo-Seite erweitern
- Neue Sektion mit "NEW v{VERSION}" Badge hinzufügen
- Interaktive Demo erstellen
- Code-Beispiele mit CodeSnippetBuilder
- Methods-Tabelle aktualisieren

### 6. Playwright Tests
- Test-Datei in `/tests/test-{component}.spec.js` erstellen/erweitern
- Tests ausführen: `npm run dev` dann `npx playwright test tests/test-{component}.spec.js`

### 7. Consumer-Projekte synchronisieren
```bash
rsync -av /Users/martinmollay/Development/ssi-builders/src/{Component}.js \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/src/
rsync -av /Users/martinmollay/Development/ssi-builders/package.json \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/
rsync -av /Users/martinmollay/Development/ssi-builders/CHANGELOG.md \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/
```

---

## Checkliste (alle Punkte müssen erledigt sein!)

- [ ] Feature implementiert
- [ ] Version in package.json erhöht
- [ ] Version in src/{Component}.js erhöht
- [ ] CHANGELOG.md aktualisiert
- [ ] Demo-Seite erweitert
- [ ] Playwright Tests geschrieben
- [ ] Tests bestanden
- [ ] Consumer-Projekte synchronisiert

---

## Wichtige Pfade

| Zweck | Pfad |
|-------|------|
| Komponenten | `/Users/martinmollay/Development/ssi-builders/src/` |
| Demo-Seiten | `/Users/martinmollay/Development/ssi-builders/docs/demos/` |
| Tests | `/Users/martinmollay/Development/ssi-builders/tests/` |
| Analytics Vendor | `/Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/` |
