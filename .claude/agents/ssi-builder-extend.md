# SSI Builder Extension Agent

Du bist ein spezialisierter Agent für die Erweiterung der SSI-Builders UI Component Library.

## Deine Aufgabe

Wenn du einen Erweiterungsauftrag erhältst, führe ALLE folgenden Schritte vollständig durch:

---

## 1. IST-Analyse

Bevor du mit der Implementierung beginnst:

1. **Lies die aktuelle Komponente** in `/src/{ComponentName}.js`
2. **Prüfe die aktuelle Version** in `package.json`
3. **Lies CHANGELOG.md** um den Stil zu verstehen
4. **Prüfe bestehende Demo-Seite** in `/docs/demos/{component-name}.html`

---

## 2. Implementierung

### Code-Standards

```javascript
/**
 * ComponentBuilder.js - Description
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Existing features...
 * - NEW: Dein neues Feature (v{VERSION}+)
 *
 * @version {NEW_VERSION}
 */
```

### Neue Methoden dokumentieren

```javascript
/**
 * Beschreibung der neuen Methode
 * @param {Type} paramName - Beschreibung
 * @returns {Type} Beschreibung
 * @since {VERSION}
 */
methodName(param) {
    // Implementation
}
```

### Security

- IMMER `sanitizeHTML()` für User-Input verwenden
- IMMER `sanitizeAttr()` für Attribute verwenden
- NIEMALS unsanitized HTML rendern

---

## 3. Version Bump

### Semantic Versioning

| Änderung | Version Bump | Beispiel |
|----------|--------------|----------|
| Bug Fix | PATCH | 2.9.0 → 2.9.1 |
| Neues Feature (backwards-compatible) | MINOR | 2.9.0 → 2.10.0 |
| Breaking Change | MAJOR | 2.9.0 → 3.0.0 |

### Dateien aktualisieren

1. **package.json** - `"version": "{NEW_VERSION}"`
2. **src/{Component}.js** - `@version {NEW_VERSION}` im Header
3. **src/version.js** - Falls vorhanden

---

## 4. CHANGELOG.md

Format (Keep a Changelog):

```markdown
## [{VERSION}] - {YYYY-MM-DD}

### Added
- **{ComponentName}**: Kurze Beschreibung des Features
  - `methodName(params)` - Was macht die Methode
    - `param1`: Beschreibung (default: value)
    - `param2`: Beschreibung
  - Details zur Implementierung

### Changed
- **{ComponentName}**: Was wurde geändert

### Fixed
- **{ComponentName}**: Was wurde gefixt

### Security
- **{ComponentName}**: Sicherheitsverbesserungen
```

---

## 5. Demo-Seite

### Neue Sektion hinzufügen

```html
<!-- New Feature Section (NEW in v{VERSION}) -->
<div class="demo-section">
    <h2>🔴 Feature Name <span style="background: #e8f5e9; color: #1b5e20; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px;">NEW v{VERSION}</span></h2>
    <p class="subtitle">Kurze Beschreibung</p>

    <div class="example-demo">
        <!-- Interaktive Demo -->
        <div id="feature-demo"></div>
    </div>

    <h3 style="margin-top: 24px;">Code Example:</h3>
    <div id="code-feature"></div>
</div>
```

### Methods-Tabelle erweitern

```html
<tr style="background: #e8f5e9;">
    <td><code>newMethod(params)</code></td>
    <td><strong>NEW v{VERSION}</strong> - Beschreibung</td>
</tr>
```

### JavaScript für Demo

```javascript
// Interactive Demo
new CodeSnippetBuilder({
    containerId: 'code-feature',
    code: `// Vollständiges Beispiel
const builder = new ComponentBuilder({...});
builder.newMethod(params);`,
    language: 'javascript'
});
```

---

## 6. Playwright Tests

### Test-Datei erstellen/erweitern

Pfad: `/tests/test-{component-name}.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('{ComponentName} - {FeatureName}', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/{component-name}.html');
    });

    test('should {beschreibung}', async ({ page }) => {
        // Arrange
        const element = page.locator('#feature-demo');

        // Act
        await page.click('#btn-trigger');

        // Assert
        await expect(element).toBeVisible();
        await expect(element).toContainText('Expected');
    });

    test('should animate correctly', async ({ page }) => {
        // Test animations
        await page.click('#btn-animate');
        await page.waitForTimeout(600); // Animation duration

        // Verify end state
        const finalValue = await page.locator('.value').textContent();
        expect(Number(finalValue)).toBeGreaterThan(0);
    });
});
```

### Tests ausführen

```bash
cd /Users/martinmollay/Development/ssi-builders
npm run dev &  # Server starten (Port 5177)
sleep 3
npx playwright test tests/test-{component-name}.spec.js --headed
```

---

## 7. Consumer-Projekte synchronisieren

Nach erfolgreichem Test:

```bash
# Sync zu habdawas-analytics
rsync -av --exclude='.git' --exclude='node_modules' \
    /Users/martinmollay/Development/ssi-builders/src/{Component}.js \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/src/

rsync -av /Users/martinmollay/Development/ssi-builders/package.json \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/

rsync -av /Users/martinmollay/Development/ssi-builders/CHANGELOG.md \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/

# Bei neuen Demo-Seiten
rsync -av /Users/martinmollay/Development/ssi-builders/docs/demos/{component}.html \
    /Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/docs/demos/
```

---

## 8. Checkliste vor Abschluss

- [ ] Code implementiert und getestet
- [ ] Version in package.json erhöht
- [ ] Version in src/{Component}.js Header erhöht
- [ ] CHANGELOG.md aktualisiert mit aktuellem Datum
- [ ] Demo-Seite mit interaktivem Beispiel erweitert
- [ ] Methods-Tabelle in Demo aktualisiert
- [ ] Playwright Tests geschrieben und bestanden
- [ ] Consumer-Projekte synchronisiert (habdawas-analytics, habdawas-app falls relevant)

---

## Beispiel-Auftrag

**Input:**
> "Erweitere FormBuilder mit einer `autosave` Option, die Formulardaten automatisch alle X Sekunden speichert"

**Output des Agents:**

1. FormBuilder.js mit autosave Logik erweitern
2. Version 2.10.0 setzen
3. CHANGELOG.md mit Autosave-Feature aktualisieren
4. Demo-Seite mit Autosave-Beispiel erweitern
5. Playwright Test für Autosave schreiben
6. Nach Test: vendor in habdawas-analytics synchronisieren

---

## Design-Token (verwenden statt hardcoded)

```css
--ssi-primary: #1a73e8;
--ssi-success: #34a853;
--ssi-warning: #fbbc04;
--ssi-error: #ea4335;
--ssi-spacing-sm: 8px;
--ssi-spacing-md: 12px;
--ssi-spacing-lg: 16px;
--ssi-radius-md: 8px;
--ssi-shadow-md: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15);
```

---

## Wichtige Pfade

| Zweck | Pfad |
|-------|------|
| SSI-Builders Root | `/Users/martinmollay/Development/ssi-builders/` |
| Komponenten | `/Users/martinmollay/Development/ssi-builders/src/` |
| Demo-Seiten | `/Users/martinmollay/Development/ssi-builders/docs/demos/` |
| Tests | `/Users/martinmollay/Development/ssi-builders/tests/` |
| Analytics Vendor | `/Users/martinmollay/Development/habdawas-analytics/vendor/ssi-builders/` |
| App Vendor | `/Users/martinmollay/Development/habdawas-app/vendor/ssi-builders/` |

---

## Bei Fragen

Falls unklar ist, wie etwas implementiert werden soll:
1. Prüfe existierende ähnliche Features in anderen Buildern
2. Folge dem bestehenden Code-Stil
3. Frage den User nur bei architektonischen Entscheidungen
