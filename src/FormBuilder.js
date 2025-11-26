/**
 * FormBuilder.js - Modern, Reusable Form Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Declarative field configuration
 * - Built-in validation (required, email, min/max, pattern, custom)
 * - Auto-save (debounced, localStorage)
 * - Multi-step forms (wizard)
 * - Conditional fields (show/hide based on values)
 * - Field types: text, email, number, select, checkbox, radio, textarea, date, file
 * - Error handling & success states
 * - Async submit with loading states
 * - Mobile-responsive
 *
 * @version 2.3.0
 */

import { BaseBuilder } from './BaseBuilder.js';
import { IconManager } from './IconManager.js';

export class FormBuilder extends BaseBuilder {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - ID of the container element
     * @param {Array} config.fields - Field definitions
     * @param {Function} config.onSubmit - Async submit handler
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        // Extract fieldLayout and fieldSize from config BEFORE calling super
        const fieldLayout = config.fieldLayout || config.options?.fieldLayout || 'standard';
        const fieldSize = config.fieldSize || config.options?.fieldSize || 'md';
        const layout = config.layout || config.options?.layout || 'vertical';
        const gridColumns = config.gridColumns || config.options?.gridColumns || 2;

        super(config, {
            submitLabel: 'Speichern',
            cancelLabel: 'Abbrechen',
            autoSave: false,
            autoSaveDelay: 1000,
            localStorageKey: null,
            showResetButton: true,
            multiStep: false,
            steps: [],
            layout: layout,            // 'vertical' | 'horizontal' | 'inline' | 'grid'
            gridColumns: gridColumns,
            fieldSize: fieldSize,      // 'sm' | 'md' | 'lg' - default size for all fields
            fieldLayout: fieldLayout,  // 'standard' | 'floating' | 'filled' | 'outlined'
            onCancel: null,
            initialValues: {}
        });

        this.fields = config.fields || [];
        this.onSubmit = config.onSubmit;

        // Internal state
        this.values = { ...this.options.initialValues };
        this.errors = {};
        this.touched = {};
        this.isSubmitting = false;
        this.currentStep = 0;
        this.autoSaveTimeout = null;

        // Load from localStorage if enabled
        if (this.options.localStorageKey) {
            const saved = localStorage.getItem(this.options.localStorageKey);
            if (saved) {
                this.values = { ...this.values, ...JSON.parse(saved) };
            }
        }

        this.init();
    }

    /**
     * Initialize the FormBuilder
     */
    init() {
        if (!super.init()) return;
        this.render();
    }

    /**
     * Main render function
     */
    render() {
        this.container.innerHTML = `
            <div class="form-builder">
                ${this.options.multiStep ? this.renderSteps() : ''}
                <form class="form-builder-form" id="${this.containerId}_form">
                    ${this.renderFields()}
                    ${this.renderActions()}
                </form>
                ${this.renderVersionBadge()}
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Render multi-step progress indicator
     */
    renderSteps() {
        if (!this.options.multiStep) return '';

        return `
            <div class="form-steps">
                ${this.options.steps.map((step, index) => `
                    <div class="form-step ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}">
                        <div class="form-step-number">${index < this.currentStep ? IconManager.getIcon('check') : index + 1}</div>
                        <div class="form-step-label">${step.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render all fields
     */
    renderFields() {
        const fieldsToRender = this.options.multiStep
            ? this.fields.filter(f => f.step === this.currentStep)
            : this.fields;

        const visibleFields = fieldsToRender.filter(field => this.isFieldVisible(field));

        // Check if any fields use width property (12-column system)
        const hasFieldWidths = this.fields.some(f => f.width);

        const layoutClass = this.options.layout === 'grid'
            ? hasFieldWidths
                ? 'form-builder-grid'  // 12-column grid for flexible widths
                : `form-builder-grid form-builder-grid-${this.options.gridColumns}`  // Legacy 2/3/4 column grid
            : `form-builder-${this.options.layout}`;

        return `
            <div class="${layoutClass}">
                ${visibleFields.map(field => this.renderField(field)).join('')}
            </div>
        `;
    }

    /**
     * Check if field should be visible (conditional logic)
     */
    isFieldVisible(field) {
        if (!field.showIf) return true;

        // Support both function and object format
        if (typeof field.showIf === 'function') {
            return field.showIf(this.values);
        }

        const { field: dependentField, value: expectedValue } = field.showIf;
        return this.values[dependentField] === expectedValue;
    }

    /**
     * Render single field
     */
    renderField(field) {
        const value = this.values[field.key] ?? field.defaultValue ?? '';
        const error = this.errors[field.key];
        const touched = this.touched[field.key];
        const fieldSize = field.size || this.options.fieldSize;
        const fieldLayout = field.layout || this.options.fieldLayout;
        
        // Build field classes
        const widthClass = field.width && field.width >= 1 && field.width <= 12
            ? `form-field-width-${field.width}`
            : '';

        const fieldClasses = [
            'form-field',
            `form-field-${fieldLayout}`,
            `form-field-size-${fieldSize}`,
            widthClass,
            error && touched ? 'form-field-error' : '',
            field.fullWidth ? 'form-field-full' : ''
        ].filter(Boolean).join(' ');

        // For M3 filled and outlined, input comes BEFORE label (for ~ CSS selector)
        // AND use wrapper div to isolate label from supporting text
        if (fieldLayout === 'floating' || fieldLayout === 'filled' || fieldLayout === 'outlined') {
            return `
                <div class="${fieldClasses}" data-field-key="${field.key}">
                    <div class="input-wrapper">
                        ${this.renderFieldInput(field, value, fieldSize)}
                        ${field.label ? `
                            <label class="form-label ssi-label-${fieldSize}" for="${this.containerId}_${field.key}">
                                ${field.label}${field.required ? '<span class="form-required">*</span>' : ''}
                            </label>
                        ` : ''}
                    </div>
                    ${field.description ? `<div class="form-description">${field.description}</div>` : ''}
                    ${field.hint ? `<div class="form-hint">${field.hint}</div>` : ''}
                    ${error && touched ? `<div class="form-error">${error}</div>` : ''}
                </div>
            `;
        }

        // Standard layout - label before input
        return `
            <div class="${fieldClasses}" data-field-key="${field.key}">
                ${field.label ? `
                    <label class="form-label ssi-label-${fieldSize}" for="${this.containerId}_${field.key}">
                        ${field.label}${field.required ? '<span class="form-required">*</span>' : ''}
                    </label>
                ` : ''}
                ${this.renderFieldInput(field, value, fieldSize)}
                ${field.description ? `<div class="form-description">${field.description}</div>` : ''}
                ${field.hint ? `<div class="form-hint">${field.hint}</div>` : ''}
                ${error && touched ? `<div class="form-error">${error}</div>` : ''}
            </div>
        `;
    }

    /**
     * Render field input based on type
     */
    renderFieldInput(field, value, fieldSize = 'md') {
        const sizeClass = `ssi-input-${fieldSize}`;
        
        // For M3 floating labels, we MUST have a placeholder (even if just a space)
        const fieldLayout = field.layout || this.options.fieldLayout;
        const placeholder = field.placeholder !== undefined ? field.placeholder : 
                          (fieldLayout === 'filled' || fieldLayout === 'outlined' || fieldLayout === 'floating' ? ' ' : '');
        
        const commonAttrs = `
            id="${this.containerId}_${field.key}"
            name="${field.key}"
            ${field.required ? 'required' : ''}
            ${field.disabled ? 'disabled' : ''}
            ${field.readonly ? 'readonly' : ''}
            ${placeholder ? `placeholder="${placeholder}"` : ''}
        `.trim();

        // Helper for input groups with prefix/suffix
        const wrapInputGroup = (input) => {
            if (!field.prefix && !field.suffix) return input;
            return `
                <div class="form-input-group">
                    ${field.prefix ? `<span class="form-input-prefix">${field.prefix}</span>` : ''}
                    ${input}
                    ${field.suffix ? `<span class="form-input-suffix">${field.suffix}</span>` : ''}
                </div>
            `;
        };

        switch (field.type) {
            case 'textarea':
                return wrapInputGroup(`
                    <textarea
                        class="form-input form-textarea ${sizeClass}"
                        ${commonAttrs}
                        rows="${field.rows || 4}"
                    >${value}</textarea>
                `);

            case 'select':
                // For M3 filled/outlined, use hidden empty option
                const isM3Variant = fieldLayout === 'filled' || fieldLayout === 'outlined';
                return wrapInputGroup(`
                    <select class="form-input form-select ${sizeClass}" ${commonAttrs}>
                        ${isM3Variant
                            ? '<option value="" disabled selected hidden></option>'
                            : '<option value="">-- Bitte wählen --</option>'}
                        ${field.options?.map(opt => `
                            <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `);

            case 'checkbox':
                return `
                    <label class="form-checkbox-label">
                        <input
                            type="checkbox"
                            class="form-checkbox"
                            ${commonAttrs}
                            ${value ? 'checked' : ''}
                        />
                        <span>${field.checkboxLabel || field.label}</span>
                    </label>
                `;

            case 'radio':
                const radioLayout = field.radioLayout || 'vertical'; // vertical, horizontal, grid-2, grid-3
                return `
                    <div class="form-radio-group form-radio-${radioLayout}">
                        ${field.options?.map(opt => `
                            <label class="form-radio-label">
                                <input
                                    type="radio"
                                    class="form-radio"
                                    name="${field.key}"
                                    value="${opt.value}"
                                    ${value === opt.value ? 'checked' : ''}
                                    ${field.disabled ? 'disabled' : ''}
                                />
                                <span>${opt.label}</span>
                            </label>
                        `).join('')}
                    </div>
                `;

            case 'file':
                return `
                    <input
                        type="file"
                        class="form-input form-file"
                        ${commonAttrs}
                        ${field.accept ? `accept="${field.accept}"` : ''}
                        ${field.multiple ? 'multiple' : ''}
                    />
                `;

            case 'number':
                return `
                    <div class="form-number-wrapper">
                        <button
                            type="button"
                            class="form-number-btn form-number-decrement"
                            aria-label="Wert verringern"
                            data-field-key="${field.key}"
                        >−</button>
                        <input
                            type="number"
                            class="form-input form-number-input ${sizeClass}"
                            ${commonAttrs}
                            value="${value}"
                            ${field.min !== undefined ? `min="${field.min}"` : ''}
                            ${field.max !== undefined ? `max="${field.max}"` : ''}
                            ${field.step !== undefined ? `step="${field.step}"` : ''}
                        />
                        <button
                            type="button"
                            class="form-number-btn form-number-increment"
                            aria-label="Wert erhöhen"
                            data-field-key="${field.key}"
                        >+</button>
                    </div>
                `;

            case 'email':
                return wrapInputGroup(`
                    <input
                        type="email"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                    />
                `);

            case 'date':
                return `
                    <input
                        type="date"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'password':
                return `
                    <div class="form-password-wrapper">
                        <input
                            type="password"
                            class="form-input form-password-input ${sizeClass}"
                            ${commonAttrs}
                            value="${value}"
                        />
                        <button
                            type="button"
                            class="form-password-toggle"
                            aria-label="Passwort anzeigen/verbergen"
                            data-field-key="${field.key}"
                        >
                            ${IconManager.getIcon('eye-off')}
                        </button>
                    </div>
                `;

            case 'time':
                return `
                    <input
                        type="time"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'datetime-local':
                return `
                    <input
                        type="datetime-local"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'color':
                return `
                    <input
                        type="color"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value || '#000000'}"
                    />
                `;

            case 'url':
                return `
                    <input
                        type="url"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'tel':
                return `
                    <input
                        type="tel"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                        ${field.pattern ? `pattern="${field.pattern}"` : ''}
                    />
                `;

            case 'range':
            case 'slider':
                return `
                    <div class="form-range-wrapper">
                        <input
                            type="range"
                            class="form-input form-range"
                            ${commonAttrs}
                            value="${value || field.min || 0}"
                            min="${field.min || 0}"
                            max="${field.max || 100}"
                            step="${field.step || 1}"
                        />
                        <span class="form-range-value">${value || field.min || 0}${field.unit || ''}</span>
                    </div>
                `;

            case 'toggle':
                return `
                    <label class="form-toggle-label">
                        <input
                            type="checkbox"
                            class="form-toggle-input"
                            ${commonAttrs}
                            ${value ? 'checked' : ''}
                        />
                        <span class="form-toggle-slider"></span>
                        <span class="form-toggle-text">${field.toggleLabel || field.label || ''}</span>
                    </label>
                `;

            default: // text
                return wrapInputGroup(`
                    <input
                        type="text"
                        class="form-input ${sizeClass}"
                        ${commonAttrs}
                        value="${value}"
                    />
                `);
        }
    }

    /**
     * Render action buttons
     */
    renderActions() {
        if (this.options.multiStep) {
            return `
                <div class="form-actions">
                    ${this.currentStep > 0 ? `
                        <button type="button" class="ssi-btn ssi-btn-outlined" id="${this.containerId}_prevStep">
                            ← Zurück
                        </button>
                    ` : ''}
                    ${this.currentStep < this.options.steps.length - 1 ? `
                        <button type="button" class="ssi-btn ssi-btn-primary" id="${this.containerId}_nextStep">
                            Weiter →
                        </button>
                    ` : `
                        <button type="submit" class="ssi-btn ssi-btn-primary" ${this.isSubmitting ? 'disabled' : ''}>
                            ${this.isSubmitting ? 'Wird gespeichert...' : this.options.submitLabel}
                        </button>
                    `}
                </div>
            `;
        }

        return `
            <div class="form-actions">
                ${this.options.showResetButton ? `
                    <button type="button" class="ssi-btn ssi-btn-outlined" id="${this.containerId}_reset">
                        Zurücksetzen
                    </button>
                ` : ''}
                ${this.options.onCancel ? `
                    <button type="button" class="ssi-btn ssi-btn-outlined" id="${this.containerId}_cancel">
                        ${this.options.cancelLabel}
                    </button>
                ` : ''}
                <button type="submit" class="ssi-btn ssi-btn-primary" ${this.isSubmitting ? 'disabled' : ''}>
                    ${this.isSubmitting ? 'Wird gespeichert...' : this.options.submitLabel}
                </button>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const form = document.getElementById(`${this.containerId}_form`);

        // Form submit
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Field changes
        this.fields.forEach(field => {
            const input = document.getElementById(`${this.containerId}_${field.key}`);
            if (!input) return;

            input.addEventListener('input', (e) => this.handleFieldChange(field, e.target));
            input.addEventListener('blur', () => this.handleFieldBlur(field));

            // Special handling for range/slider - update display value
            if (field.type === 'range' || field.type === 'slider') {
                const valueDisplay = input.parentElement?.querySelector('.form-range-value');
                input.addEventListener('input', (e) => {
                    if (valueDisplay) {
                        valueDisplay.textContent = e.target.value + (field.unit || '');
                    }
                });
            }
        });

        // Password toggle buttons
        const passwordToggles = this.container.querySelectorAll('.form-password-toggle');
        passwordToggles.forEach(toggleBtn => {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const fieldKey = toggleBtn.dataset.fieldKey;
                const passwordInput = document.getElementById(`${this.containerId}_${fieldKey}`);

                if (passwordInput) {
                    const isPassword = passwordInput.type === 'password';
                    passwordInput.type = isPassword ? 'text' : 'password';
                    toggleBtn.innerHTML = IconManager.getIcon(isPassword ? 'eye' : 'eye-off');
                    toggleBtn.setAttribute('aria-label', isPassword ? 'Passwort verbergen' : 'Passwort anzeigen');
                }
            });
        });

        // Number stepper buttons
        const numberSteppers = this.container.querySelectorAll('.form-number-btn');
        numberSteppers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const fieldKey = btn.dataset.fieldKey;
                const numberInput = document.getElementById(`${this.containerId}_${fieldKey}`);
                const field = this.fields.find(f => f.key === fieldKey);

                if (numberInput && field) {
                    const currentValue = parseFloat(numberInput.value) || (field.min !== undefined ? field.min : 0);
                    const step = field.step !== undefined ? field.step : 1;
                    const isIncrement = btn.classList.contains('form-number-increment');

                    let newValue = isIncrement ? currentValue + step : currentValue - step;

                    // Apply min/max constraints
                    if (field.min !== undefined && newValue < field.min) {
                        newValue = field.min;
                    }
                    if (field.max !== undefined && newValue > field.max) {
                        newValue = field.max;
                    }

                    numberInput.value = newValue;
                    // Trigger input event to update form state
                    numberInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });

        // Reset button
        const resetBtn = document.getElementById(`${this.containerId}_reset`);
        resetBtn?.addEventListener('click', () => this.reset());

        // Cancel button
        const cancelBtn = document.getElementById(`${this.containerId}_cancel`);
        cancelBtn?.addEventListener('click', () => this.options.onCancel?.());

        // Multi-step navigation
        const nextBtn = document.getElementById(`${this.containerId}_nextStep`);
        nextBtn?.addEventListener('click', () => this.nextStep());

        const prevBtn = document.getElementById(`${this.containerId}_prevStep`);
        prevBtn?.addEventListener('click', () => this.prevStep());

        // M3 Floating Label Logic
        this.attachFloatingLabels();
    }

    /**
     * Attach floating label logic for M3 filled/outlined variants
     */
    attachFloatingLabels() {
        // Find all filled and outlined form fields
        const m3Fields = this.container.querySelectorAll('.form-field-filled, .form-field-outlined');

        m3Fields.forEach(fieldDiv => {
            const input = fieldDiv.querySelector('.form-input, .form-select, .form-textarea');
            const label = fieldDiv.querySelector('.form-label');

            if (!input || !label) return;

            // Get input type
            const inputType = input.getAttribute('type');

            // Function to check if label should float
            const checkLabelFloat = () => {
                let shouldFloat = false;

                // For select, check if value is not empty
                if (input.tagName === 'SELECT') {
                    shouldFloat = input.value && input.value !== '';
                }
                // For date/time/color inputs - only float if truly has value or focused
                else if (['date', 'time', 'datetime-local', 'month', 'week', 'color'].includes(inputType)) {
                    // These inputs always have a value, so check if user has actually selected something
                    // Date: empty = "" or placeholder state
                    // Color: empty = "#000000" (default)
                    const isEmpty = !input.value ||
                                  (inputType === 'color' && input.value === '#000000') ||
                                  input.value === '';
                    shouldFloat = !isEmpty || document.activeElement === input;
                }
                // For number inputs with stepper wrapper
                else if (inputType === 'number') {
                    // Check if has actual value (not just min/max)
                    shouldFloat = input.value !== '' && input.value !== null;
                }
                // For other inputs (text, email, password, etc.)
                else {
                    shouldFloat = (input.value && input.value.trim() !== '') || document.activeElement === input;
                }

                if (shouldFloat) {
                    label.classList.add('form-label-float');
                } else {
                    label.classList.remove('form-label-float');
                }
            };

            // Initial check on render
            checkLabelFloat();

            // Listen for input changes
            input.addEventListener('input', checkLabelFloat);
            input.addEventListener('change', checkLabelFloat);
            input.addEventListener('blur', checkLabelFloat);
            input.addEventListener('focus', checkLabelFloat);
        });
    }

    /**
     * Handle field change
     */
    handleFieldChange(field, target) {
        let value;

        if (field.type === 'checkbox' || field.type === 'toggle') {
            value = target.checked;
        } else if (field.type === 'file') {
            value = target.files;
        } else if (field.type === 'number' || field.type === 'range' || field.type === 'slider') {
            value = target.value ? parseFloat(target.value) : null;
        } else {
            value = target.value;
        }

        this.values[field.key] = value;

        // Validate on change
        this.validateField(field);

        // Re-render if conditional fields exist
        if (this.hasConditionalFields()) {
            this.updateFieldsVisibility();
        }

        // Auto-save
        if (this.options.autoSave) {
            this.triggerAutoSave();
        }
    }

    /**
     * Handle field blur
     */
    handleFieldBlur(field) {
        this.touched[field.key] = true;
        this.validateField(field);
        this.updateFieldError(field);
    }

    /**
     * Update field error display
     */
    updateFieldError(field) {
        const fieldDiv = this.container.querySelector(`[data-field-key="${field.key}"]`);
        if (!fieldDiv) return;

        const error = this.errors[field.key];
        const touched = this.touched[field.key];

        if (error && touched) {
            fieldDiv.classList.add('form-field-error');
            const errorDiv = fieldDiv.querySelector('.form-error');
            if (errorDiv) {
                errorDiv.textContent = error;
            }
        } else {
            fieldDiv.classList.remove('form-field-error');
        }
    }

    /**
     * Check if form has conditional fields
     */
    hasConditionalFields() {
        return this.fields.some(f => f.showIf);
    }

    /**
     * Update fields visibility
     */
    updateFieldsVisibility() {
        const formContent = this.container.querySelector('.form-builder-form > div');
        if (formContent) {
            formContent.innerHTML = this.renderFields().match(/<div class="form-builder[^>]*">([\s\S]*)<\/div>/)[1];
            this.attachEventListeners();
        }
    }

    /**
     * Validate single field
     */
    validateField(field) {
        const value = this.values[field.key];
        let error = null;

        // Required validation
        if (field.required && !value) {
            error = field.requiredMessage || `${field.label} ist erforderlich`;
        }

        // Email validation
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            error = field.emailMessage || 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        }

        // Min/Max validation for numbers
        if (field.type === 'number' && value !== null) {
            if (field.min !== undefined && value < field.min) {
                error = field.minMessage || `Wert muss mindestens ${field.min} sein`;
            }
            if (field.max !== undefined && value > field.max) {
                error = field.maxMessage || `Wert darf maximal ${field.max} sein`;
            }
        }

        // Pattern validation
        if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
            error = field.patternMessage || 'Ungültiges Format';
        }

        // Custom validation
        if (field.validate && value) {
            const customError = field.validate(value, this.values);
            if (customError) error = customError;
        }

        if (error) {
            this.errors[field.key] = error;
        } else {
            delete this.errors[field.key];
        }

        return !error;
    }

    /**
     * Validate all fields
     */
    validateAll() {
        const fieldsToValidate = this.options.multiStep
            ? this.fields.filter(f => f.step === this.currentStep)
            : this.fields;

        fieldsToValidate.forEach(field => {
            if (this.isFieldVisible(field)) {
                this.touched[field.key] = true;
                this.validateField(field);
            }
        });

        return Object.keys(this.errors).length === 0;
    }

    /**
     * Handle form submit
     */
    async handleSubmit() {
        if (!this.validateAll()) {
            // Re-render to show errors
            this.render();
            return;
        }

        if (!this.onSubmit) {
            console.warn('No onSubmit handler provided');
            return;
        }

        this.isSubmitting = true;
        this.render();

        try {
            await this.onSubmit(this.values);
            this.showSuccess();

            // Clear localStorage after successful submit
            if (this.options.localStorageKey) {
                localStorage.removeItem(this.options.localStorageKey);
            }
        } catch (error) {
            console.error('Form submit error:', error);
            this.showError(error.message || 'Fehler beim Speichern');
        } finally {
            this.isSubmitting = false;
            this.render();
        }
    }

    /**
     * Next step in multi-step form
     */
    nextStep() {
        if (!this.validateAll()) {
            this.render();
            return;
        }

        if (this.currentStep < this.options.steps.length - 1) {
            this.currentStep++;
            this.render();
        }
    }

    /**
     * Previous step in multi-step form
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
    }

    /**
     * Trigger auto-save
     */
    triggerAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            if (this.options.localStorageKey) {
                localStorage.setItem(this.options.localStorageKey, JSON.stringify(this.values));
            }
        }, this.options.autoSaveDelay);
    }

    /**
     * Reset form
     */
    reset() {
        this.values = { ...this.options.initialValues };
        this.errors = {};
        this.touched = {};
        this.currentStep = 0;

        if (this.options.localStorageKey) {
            localStorage.removeItem(this.options.localStorageKey);
        }

        this.render();
    }

    /**
     * Set field value programmatically
     */
    setValue(key, value) {
        this.values[key] = value;
        const field = this.fields.find(f => f.key === key);
        if (field) {
            this.validateField(field);
        }
        this.render();
    }

    /**
     * Get form values
     */
    getValues() {
        return { ...this.values };
    }

    /**
     * Show success message
     */
    showSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-message';
        successDiv.innerHTML = this.options.successMessage || `${IconManager.getIcon('check')} Erfolgreich gespeichert!`;
        this.container.insertBefore(successDiv, this.container.firstChild);

        setTimeout(() => successDiv.remove(), 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.textContent = message;
        this.container.insertBefore(errorDiv, this.container.firstChild);

        setTimeout(() => errorDiv.remove(), 5000);
    }

    /**
     * Helper: Validate email
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

export default FormBuilder;
