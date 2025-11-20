# CLAUDE.md - SSI Builders

**Zentrale UI-Komponenten-Bibliothek** für alle SSI-Projekte

---

## 🎯 Projekt-Zweck

SSI Builders ist die **einzige Source of Truth** für UI-Komponenten in allen SSI-Projekten:
- HabDaWas App
- Habbi Suchalgorithmus
- Bazar Bold
- Alle neuen SSI-Webprojekte

**Entwicklungs-Philosophie:**
- Features werden hier entwickelt und getestet
- Andere Projekte binden als Git Submodule ein
- Ein Feature überall verfügbar machen

---

## 📋 Verfügbare Builder (v1.0.0)

| Builder | Purpose | Status |
|---------|---------|--------|
| 📋 **ListBuilder** | Datentabellen mit Search/Sort/Filter | ✅ Prod |
| 📝 **FormBuilder** | Formulare mit Validation | ✅ Prod |
| 🪟 **ModalBuilder** | Modals/Dialoge (9 Größen) | ✅ Prod |
| 📊 **ChartBuilder** | Charts (Bar/Line/Pie/Donut) | ✅ Prod |
| 📑 **TabBuilder** | Tabs mit Keyboard Nav | ✅ Prod |
| 📜 **MenuBuilder** | Dropdown/Context Menus | ✅ Prod |
| 🗂️ **SidebarBuilder** | Navigation Sidebar | ✅ Prod |

---

## 🛠️ Entwicklungs-Workflow

### Wenn neues Feature benötigt wird:

1. **Feature in SSI-Builders entwickeln**
   ```bash
   cd /Users/martinmollay/Development/ssi-builders
   # Feature implementieren
   # Tests schreiben
   npm test
   ```

2. **Version erhöhen**
   ```bash
   npm run version:patch  # Bug fixes (1.0.0 → 1.0.1)
   npm run version:minor  # New features (1.0.0 → 1.1.0)
   npm run version:major  # Breaking changes (1.0.0 → 2.0.0)
   ```

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: Add new feature XYZ"
   git push && git push --tags
   ```

4. **In consuming Projekten updaten**
   ```bash
   cd /Users/martinmollay/Development/habbi-suchalgorytmus
   git submodule update --remote vendor/ssi-builders
   git add vendor/ssi-builders
   git commit -m "Update ssi-builders to v1.1.0"
   ```

---

## ✅ Code-Standards

### Material Design 3
- Alle Komponenten folgen MD3 Guidelines
- Farben: `#1a73e8` (Primary), `#34a853` (Success), `#ea4335` (Error)
- Spacing: 4px Grid (8px, 12px, 16px, 24px)

### Responsive Design
```css
/* Mobile First */
@media (min-width: 480px)  { /* Large Mobile */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Accessibility
- ARIA Labels auf allen interaktiven Elementen
- Keyboard Navigation (Tab, Enter, ESC, Arrow Keys)
- Focus States sichtbar
- Screen Reader Support

### Browser Support
- Modern Browsers (ES6+)
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 🧪 Testing

### Playwright Tests
```bash
npm test              # Headless
npm run test:headed   # Mit Browser
```

**Test-Struktur:**
```
tests/
├── list-builder.spec.js
├── form-builder.spec.js
├── modal-builder.spec.js
├── chart-builder.spec.js
├── tab-builder.spec.js
├── menu-builder.spec.js
└── sidebar-builder.spec.js
```

**Wichtig:** Alle Tests müssen passen vor Version Bump!

---

## 📝 Commit Messages

Conventional Commits verwenden:

```bash
feat: Add new chart type "scatter"
fix: Modal backdrop click not working
docs: Update FormBuilder examples
style: Improve button hover states
refactor: Simplify ListBuilder sorting logic
test: Add tests for ModalBuilder sizes
chore: Update dependencies
```

---

## 🚨 Breaking Changes vermeiden!

### DO:
- Neue Optionen als **optional** hinzufügen
- Backwards-kompatible Erweiterungen
- Deprecation Warnings vor Removal

### DON'T:
- Existierende API ändern ohne Major Version Bump
- CSS-Klassen umbenennen
- Defaults ändern ohne Migration Path

---

## 📚 Dokumentation

### Jeder Builder braucht:

1. **Inline JSDoc Comments**
   ```javascript
   /**
    * @param {Object} config - Configuration object
    * @param {string} config.title - Modal title
    */
   ```

2. **README Beispiele**
   - Quick Start Code
   - Common Use Cases
   - Configuration Options

3. **CHANGELOG Entry**
   ```markdown
   ## [1.1.0] - 2025-11-20
   ### Added
   - ModalBuilder: New "side-drawer" size option
   ```

---

## 🎨 CSS-Architektur

### File Structure:
```
src/
├── shared.css           # Global styles, colors, utils
├── ListBuilder.css      # Component-specific
├── FormBuilder.css
└── ...
```

### CSS Best Practices:
- BEM-ähnliche Namenskonvention: `.modal-header`, `.modal-body`
- CSS Custom Properties für Theming
- Mobile-First Media Queries
- Kein `!important` (außer absolut nötig)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-20 | Initial Release - 7 Builders |

---

## 💡 Claude-Anweisungen

### Wenn User fragt: "Ich brauche Feature X in Builder Y"

1. **Check:** Existiert Feature bereits?
   - Lies Builder-Code
   - Check README/Docs

2. **Entwicklung:**
   - Feature in SSI-Builders implementieren
   - Tests schreiben
   - Dokumentation updaten

3. **Integration:**
   - Version erhöhen
   - In consuming Projekt einbinden

### Wenn User sagt: "Builder nutzen in anderem Projekt"

1. **Git Submodule Setup:**
   ```bash
   cd /path/to/project
   git submodule add https://github.com/ssi-solutions/ssi-builders.git vendor/ssi-builders
   ```

2. **CLAUDE.md in Projekt ergänzen:**
   ```markdown
   ## UI Components

   **WICHTIG:** Nutzt SSI Builders (`/vendor/ssi-builders/`)
   - Docs: README.md im Submodule
   - Niemals eigene Modal/Form Komponenten schreiben!
   ```

3. **HTML/JS Setup zeigen**

---

## 🎯 Referenz-Projekt

**Habbi Suchalgorithmus** dient als Referenz-Implementierung:
- Location: `/Users/martinmollay/Development/habbi-suchalgorytmus`
- Zeigt Best Practices für Integration
- Wird zum Testen neuer Features genutzt

---

> **Version:** 1.0.0 | **Last Updated:** 2025-11-20
