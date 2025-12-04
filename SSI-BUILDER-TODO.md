# SSI-Builder TODO & Issues

**Zentrale Sammlung aller offenen Tasks, Bugs und Feature-Requests**

> Diese Datei wird von verschiedenen Projekten befüllt, wenn Issues im SSI-Builder gefunden werden.
> AI kann diese Datei lesen und Issues direkt abarbeiten.

---

## 🐛 Bugs (Priorität: Hoch)

### [BUG-001] FormBuilder: Dropdown-Höhe inkonsistent in Filled Layout

**Reported by:** habdawas-analytics (2025-12-04)
**Status:** 🔴 Open
**Priority:** High
**Component:** FormBuilder, m3-form-styles.css
**Impact:** Visuelle Inkonsistenz in allen Projekten mit filled layout

**Problem:**
- Text Input Fields: height = 56px ✅
- Select/Dropdown Fields: height = ~60-64px ❌
- Unterschiedliche Höhen sehen unprofessionell aus

**Expected:**
- Alle Form Fields (input, select, textarea) sollen **exakt 56px** Höhe haben

**Fix:**
```css
/* File: /src/FormBuilder.css oder /src/m3-form-styles.css */

/* Ensure consistent height for all form fields in filled layout */
.form-field.filled .form-field-input,
.form-field.filled .form-field-select,
.form-field.filled .form-field-textarea {
    height: 56px;
    min-height: 56px;
}

/* Exception: textarea can be taller */
.form-field.filled .form-field-textarea {
    min-height: 56px;
    height: auto;
}
```

**Test:**
```javascript
ModalBuilder.form({
    fieldLayout: 'filled',
    gridColumns: 2,
    fields: [
        { key: 'name', type: 'text', label: 'Name', width: 6 },
        { key: 'country', type: 'select', label: 'Land', width: 4, options: [
            { value: 'AT', label: 'Österreich' },
            { value: 'DE', label: 'Deutschland' }
        ]}
    ]
});
```

**Erwartetes Ergebnis:**
- Beide Felder haben identische Höhe (56px)
- Prüfbar im CRUD-Demo

---

### [BUG-002] FormBuilder: Placeholder sichtbar in Filled Layout

**Reported by:** habdawas-analytics (2025-12-04)
**Status:** 🔴 Open
**Priority:** High
**Component:** FormBuilder, m3-form-styles.css
**Impact:** UX-Verwirrung, visuelle Überlappung mit floating label

**Problem:**
- Input Field mit `placeholder: 'Wien, Graz, Salzburg...'`
- In filled layout floatet Label nach oben: "Stadt"
- Placeholder bleibt sichtbar → überlappt visuell mit Label
- User ist verwirrt: Was soll eingegeben werden?

**Expected:**
- Placeholder **ausgeblendet** wenn Feld leer ist (nur Label sichtbar)
- Placeholder **dezent sichtbar** bei Focus (optional)

**Fix:**
```css
/* File: /src/FormBuilder.css oder /src/m3-form-styles.css */

/* Filled layout: Hide placeholder when field is empty */
.form-field.filled .form-field-input::placeholder,
.form-field.filled .form-field-textarea::placeholder {
    opacity: 0;
    transition: opacity 0.2s ease;
}

/* Optional: Show placeholder on focus for guidance */
.form-field.filled .form-field-input:focus::placeholder,
.form-field.filled .form-field-textarea:focus::placeholder {
    opacity: 0.6;
    color: var(--ssi-text-secondary, #5f6368);
}
```

**Test:**
```javascript
ModalBuilder.form({
    fieldLayout: 'filled',
    fields: [
        {
            key: 'city',
            type: 'text',
            label: 'Stadt',
            placeholder: 'Wien, Graz, Salzburg...'
        }
    ]
});
```

**Erwartetes Ergebnis:**
- Placeholder nicht sichtbar bei leerem Feld
- Label floatet sauber
- Placeholder erscheint dezent bei Focus

---

## 🚀 Feature Requests (Priorität: Mittel)

### [FEATURE-001] ModalBuilder.form() + TabBuilder Integration

**Requested by:** habdawas-analytics (2025-12-04)
**Status:** 🟡 Planned
**Priority:** Medium
**Component:** ModalBuilder, TabBuilder

**Description:**
Integration von TabBuilder innerhalb von ModalBuilder.form() um große Formulare in Tabs zu strukturieren.

**Use Case:**
```javascript
ModalBuilder.form({
    title: 'Benutzer bearbeiten',
    size: 'large',
    tabs: [
        {
            key: 'basic',
            label: 'Basisinformationen',
            icon: 'user',
            fields: [
                { key: 'name', type: 'text', label: 'Name' },
                { key: 'email', type: 'email', label: 'E-Mail' }
            ]
        },
        {
            key: 'credits',
            label: 'Credits & Limits',
            icon: 'coins',
            fields: [
                { key: 'credits', type: 'number', label: 'Credits' },
                { key: 'limit', type: 'number', label: 'Monatliches Limit' }
            ]
        }
    ]
});
```

**Benefits:**
- Bessere Organisation großer Formulare
- Logische Gruppierung von Feldern
- Material Design 3 konform

**Current Workaround:**
Section headers verwenden (funktioniert, aber nicht so elegant wie Tabs).

**Related:**
User hat gesagt: "A ich werde die Erweiterung beim SSI-builder machen und dir dann das Update zur Verfügung stellen!"

---

## 📝 Enhancements (Priorität: Niedrig)

### [ENHANCEMENT-001] Section Headers: Visueller Abstand vergrößern

**Requested by:** habdawas-analytics (2025-12-04)
**Status:** 🟢 Nice to have
**Priority:** Low
**Component:** FormBuilder

**Description:**
Section headers (v2.7.0 feature) könnten visuell prominenter sein:
- Größerer margin-top (aktuell zu wenig Abstand zur vorherigen Section)
- Optional: Trennlinie unter dem Header
- Optional: Icon-Support

**Current:**
```javascript
{ type: 'section-header', label: '1. BASISINFORMATIONEN', width: 12 }
```

**Proposed:**
```javascript
{
    type: 'section-header',
    label: 'Basisinformationen',
    icon: 'user',  // Optional
    divider: true,  // Optional bottom border
    width: 12
}
```

---

## ✅ Completed

_(Empty - Items werden hierhin verschoben nach Fix)_

---

## Workflow

### Für Projekte (Issues melden):
1. Neues Issue hier dokumentieren mit [BUG-XXX] oder [FEATURE-XXX]
2. Template verwenden: Status, Priority, Problem, Fix, Test
3. Projekt-Referenz angeben (habdawas-analytics, habdawas-app, etc.)

### Für SSI-Builder AI (Issues fixen):
1. Diese Datei lesen
2. Issues mit Status 🔴 Open priorisieren
3. Fix implementieren
4. Tests durchführen
5. Issue nach ✅ Completed verschieben
6. Version bump + CHANGELOG.md Update

---

## Version Planning

**v2.7.1** (Next Patch):
- [ ] BUG-001: Dropdown height consistency
- [ ] BUG-002: Placeholder visibility in filled layout

**v2.8.0** (Next Minor):
- [ ] FEATURE-001: ModalBuilder + TabBuilder integration

**v2.9.0** (Future):
- [ ] ENHANCEMENT-001: Section header improvements

---

**Last Updated:** 2025-12-04
**Maintainer:** Martin Mollay
