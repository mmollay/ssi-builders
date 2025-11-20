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
 * @version 1.0.0
 */

import { createVersionBadge } from './version.js';

export class FormBuilder {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - ID of the container element
     * @param {Array} config.fields - Field definitions
     * @param {Function} config.onSubmit - Async submit handler
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.fields = config.fields || [];
        this.onSubmit = config.onSubmit;
        this.options = {
            submitLabel: config.options?.submitLabel || 'Speichern',
            cancelLabel: config.options?.cancelLabel || 'Abbrechen',
            autoSave: config.options?.autoSave || false,
            autoSaveDelay: config.options?.autoSaveDelay || 1000,
            localStorageKey: config.options?.localStorageKey || null,
            showResetButton: config.options?.showResetButton !== false,
            multiStep: config.options?.multiStep || false,
            steps: config.options?.steps || [],
            layout: config.options?.layout || 'vertical', // vertical, horizontal, grid
            gridColumns: config.options?.gridColumns || 2,
            onCancel: config.options?.onCancel || null,
            initialValues: config.options?.initialValues || {},
            ...config.options
        };

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
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }

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
                ${createVersionBadge()}
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
                        <div class="form-step-number">${index < this.currentStep ? '✓' : index + 1}</div>
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

        const layoutClass = this.options.layout === 'grid'
            ? `form-builder-grid form-builder-grid-${this.options.gridColumns}`
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

        return `
            <div class="form-field ${error && touched ? 'form-field-error' : ''} ${field.fullWidth ? 'form-field-full' : ''}" data-field-key="${field.key}">
                ${field.label ? `
                    <label class="form-label" for="${this.containerId}_${field.key}">
                        ${field.label}
                        ${field.required ? '<span class="form-required">*</span>' : ''}
                    </label>
                ` : ''}

                ${this.renderFieldInput(field, value)}

                ${field.hint ? `<div class="form-hint">${field.hint}</div>` : ''}
                ${error && touched ? `<div class="form-error">${error}</div>` : ''}
            </div>
        `;
    }

    /**
     * Render field input based on type
     */
    renderFieldInput(field, value) {
        const fieldId = `${this.containerId}_${field.key}`;
        const commonAttrs = `
            id="${fieldId}"
            name="${field.key}"
            ${field.required ? 'required' : ''}
            ${field.disabled ? 'disabled' : ''}
            ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
        `;

        switch (field.type) {
            case 'textarea':
                return `
                    <textarea
                        class="form-input form-textarea"
                        ${commonAttrs}
                        rows="${field.rows || 4}"
                    >${value}</textarea>
                `;

            case 'select':
                return `
                    <select class="form-input form-select" ${commonAttrs}>
                        <option value="">-- Bitte wählen --</option>
                        ${field.options?.map(opt => `
                            <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `;

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
                    <input
                        type="number"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                        ${field.min !== undefined ? `min="${field.min}"` : ''}
                        ${field.max !== undefined ? `max="${field.max}"` : ''}
                        ${field.step !== undefined ? `step="${field.step}"` : ''}
                    />
                `;

            case 'email':
                return `
                    <input
                        type="email"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'date':
                return `
                    <input
                        type="date"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'password':
                return `
                    <input
                        type="password"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'time':
                return `
                    <input
                        type="time"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'datetime-local':
                return `
                    <input
                        type="datetime-local"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'color':
                return `
                    <input
                        type="color"
                        class="form-input"
                        ${commonAttrs}
                        value="${value || '#000000'}"
                    />
                `;

            case 'url':
                return `
                    <input
                        type="url"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;

            case 'tel':
                return `
                    <input
                        type="tel"
                        class="form-input"
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
                return `
                    <input
                        type="text"
                        class="form-input"
                        ${commonAttrs}
                        value="${value}"
                    />
                `;
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
        successDiv.textContent = this.options.successMessage || '✓ Erfolgreich gespeichert!';
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
