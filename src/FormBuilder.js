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
 * - M3 Component Integration (Slider, ColorPicker, Dropdown)
 *
 * @version 2.5.0
 */

import { BaseBuilder } from './BaseBuilder.js';
import { IconManager } from './IconManager.js';
import { M3Slider } from './M3Slider.js';
import { M3ColorPicker } from './M3ColorPicker.js';
import { M3DropdownMenu } from './M3DropdownMenu.js';
import { i18n } from './i18n.js';

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

        // NEW: Size, Gap, Density options
        const size = config.size || config.options?.size || null;  // 'small' | 'medium' | 'large'
        const gap = config.gap || config.options?.gap || null;     // 'compact' | 'normal' | 'comfortable'
        const density = config.density || config.options?.density || null; // 'dense' | 'normal' | 'comfortable'

        super(config, {
            submitLabel: null,   // Uses i18n.t('form.submit') as default
            cancelLabel: null,   // Uses i18n.t('form.cancel') as default
            resetLabel: null,    // Uses i18n.t('form.reset') as default
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
            size: size,                // 'small' | 'medium' | 'large' - field height
            gap: gap,                  // 'compact' | 'normal' | 'comfortable' - vertical spacing
            density: density,          // 'dense' | 'normal' | 'comfortable' - preset (size + gap)
            onCancel: null,
            onChange: null,        // Global onChange callback: (values, changedField) => void
            initialValues: {},
            // M3 Component Integration
            useM3Components: true,     // Enable M3 Slider, ColorPicker, Dropdown
            useOfficialMD3: false,     // Enable Official MD3 MCP Styles (textfield, checkbox, switch, radio)
            m3SliderOptions: {},       // Default options for M3Slider
            m3ColorPickerOptions: {},  // Default options for M3ColorPicker
            m3DropdownOptions: {}      // Default options for M3DropdownMenu
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

        // M3 Component instances (for cleanup)
        this.m3Components = {
            sliders: {},
            colorPickers: {},
            dropdowns: {}
        };

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
        // Destroy existing M3 components before re-render
        this.destroyM3Components();

        // Build CSS classes for size, gap, density options
        const sizeClass = this.options.size ? `form-size-${this.options.size}` : '';
        const gapClass = this.options.gap ? `form-gap-${this.options.gap}` : '';
        const densityClass = this.options.density ? `form-density-${this.options.density}` : '';
        const optionClasses = [sizeClass, gapClass, densityClass].filter(c => c).join(' ');

        this.container.innerHTML = `
            <div class="form-builder form-builder-m3 ${optionClasses}">
                ${this.options.multiStep ? this.renderSteps() : ''}
                <form class="form-builder-form" id="${this.containerId}_form">
                    ${this.renderFields()}
                    ${this.renderActions()}
                </form>
            </div>
        `;

        this.attachEventListeners();

        // Initialize M3 components after DOM is ready
        if (this.options.useM3Components) {
            this.initM3Components();
        }
    }

    /**
     * Destroy all M3 component instances
     */
    destroyM3Components() {
        // Destroy sliders
        Object.values(this.m3Components.sliders).forEach(slider => {
            if (slider && typeof slider.destroy === 'function') {
                slider.destroy();
            }
        });
        this.m3Components.sliders = {};

        // Destroy color pickers
        Object.values(this.m3Components.colorPickers).forEach(picker => {
            if (picker && typeof picker.destroy === 'function') {
                picker.destroy();
            }
        });
        this.m3Components.colorPickers = {};

        // Destroy dropdowns
        Object.values(this.m3Components.dropdowns).forEach(dropdown => {
            if (dropdown && typeof dropdown.destroy === 'function') {
                dropdown.destroy();
            }
        });
        this.m3Components.dropdowns = {};
    }

    /**
     * Initialize M3 components for special field types
     */
    initM3Components() {
        this.fields.forEach(field => {
            if (!this.isFieldVisible(field)) return;

            const containerId = `${this.containerId}_${field.key}_m3`;

            // M3 Slider for range/slider fields
            if ((field.type === 'range' || field.type === 'slider') && this.options.useM3Components) {
                const container = document.getElementById(containerId);
                if (container) {
                    const value = this.values[field.key] ?? field.defaultValue ?? field.min ?? 0;
                    this.m3Components.sliders[field.key] = new M3Slider({
                        containerId: containerId,
                        label: field.label || '', // Pass label to M3Slider
                        min: field.min ?? 0,
                        max: field.max ?? 100,
                        step: field.step ?? 1,
                        value: value,
                        unit: field.unit || '',
                        discrete: field.discrete ?? false,
                        showTicks: field.showTicks ?? false,
                        disabled: field.disabled ?? false,
                        size: field.sliderSize || 'md',
                        color: field.sliderColor || 'primary',
                        ...this.options.m3SliderOptions,
                        ...field.m3Options,
                        onChange: (newValue) => {
                            this.values[field.key] = newValue;
                            this.validateField(field);
                            this._notifyChange(field, newValue); // Trigger form onChange callback
                            if (this.options.autoSave) {
                                this.triggerAutoSave();
                            }
                        }
                    });
                }
            }

            // M3 ColorPicker for color fields
            if (field.type === 'color' && this.options.useM3Components) {
                const container = document.getElementById(containerId);
                if (container) {
                    const value = this.values[field.key] ?? field.defaultValue ?? '#1a73e8';
                    this.m3Components.colorPickers[field.key] = new M3ColorPicker({
                        containerId: containerId,
                        label: field.label || '', // Pass label to M3ColorPicker
                        value: value,
                        showAlpha: field.showAlpha ?? false,
                        presets: field.colorPresets || null,
                        disabled: field.disabled ?? false,
                        ...this.options.m3ColorPickerOptions,
                        ...field.m3Options,
                        onChange: (colorObj) => {
                            this.values[field.key] = colorObj.hex;
                            this.validateField(field);
                            this._notifyChange(field, colorObj.hex); // Trigger form onChange callback
                            if (this.options.autoSave) {
                                this.triggerAutoSave();
                            }
                        }
                    });
                }
            }

            // M3 Dropdown for select fields
            if (field.type === 'select' && this.options.useM3Components && field.useM3Dropdown !== false) {
                const container = document.getElementById(containerId);
                if (container) {
                    const value = this.values[field.key] ?? field.defaultValue ?? null;
                    const fieldLayout = field.layout || this.options.fieldLayout;
                    const variant = fieldLayout === 'outlined' ? 'outlined' : 'filled';

                    // Normalize options to { value, label } format
                    const options = (field.options || []).map(opt =>
                        typeof opt === 'string' ? { value: opt, label: opt } : opt
                    );

                    this.m3Components.dropdowns[field.key] = new M3DropdownMenu({
                        containerId: containerId,
                        label: field.label || i18n.t('dropdown.select'),
                        placeholder: field.placeholder || i18n.t('dropdown.placeholder'),
                        options: options,
                        value: value,
                        variant: variant,
                        required: field.required ?? false,
                        disabled: field.disabled ?? false,
                        searchable: field.searchable ?? false,
                        searchPlaceholder: field.searchPlaceholder || i18n.t('dropdown.search'),
                        supportingText: field.description || field.hint || null,
                        ...this.options.m3DropdownOptions,
                        ...field.m3Options,
                        onChange: (newValue, label, option) => {
                            this.values[field.key] = newValue;
                            this.touched[field.key] = true;
                            this.validateField(field);
                            this.updateFieldError(field);
                            if (this.options.autoSave) {
                                this.triggerAutoSave();
                            }
                        }
                    });
                }
            }
        });
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
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text safe for HTML insertion
     */
    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Check if field type has its own label (M3 components or selection controls)
     * These fields handle their own label rendering, so FormBuilder should NOT render a label
     */
    fieldHasOwnLabel(field) {
        const type = field.type;

        // Selection controls always have their own labels
        if (['checkbox', 'radio', 'toggle'].includes(type)) {
            return true;
        }

        // Studio-style components that render their own labels
        if (['section-header', 'inline-checkbox'].includes(type)) {
            return true;
        }

        // M3 components have their own labels when useM3Components is enabled
        if (this.options.useM3Components) {
            // M3Slider, M3ColorPicker, M3DropdownMenu all render their own labels
            if (['slider', 'range', 'color'].includes(type)) {
                return true;
            }
            // M3DropdownMenu for select (unless explicitly disabled)
            if (type === 'select' && field.useM3Dropdown !== false) {
                return true;
            }
        }

        return false;
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

        // Check if field handles its own label
        const hasOwnLabel = this.fieldHasOwnLabel(field);

        // Build field classes
        const widthClass = field.width && field.width >= 1 && field.width <= 12
            ? `form-field-width-${field.width}`
            : '';

        const fieldClasses = [
            'form-field',
            `form-field-${fieldLayout}`,
            `form-field-size-${fieldSize}`,
            `form-field-${field.type}`, // Add type class
            widthClass,
            error && touched ? 'form-field-error' : '',
            field.fullWidth ? 'form-field-full' : '',
            hasOwnLabel ? 'form-field-has-own-label' : ''
        ].filter(Boolean).join(' ');

        // For M3 filled and outlined, input comes BEFORE label (for ~ CSS selector)
        // AND use wrapper div to isolate label from supporting text
        if (fieldLayout === 'floating' || fieldLayout === 'filled' || fieldLayout === 'outlined') {
            return `
                <div class="${fieldClasses}" data-field-key="${field.key}">
                    <div class="input-wrapper">
                        ${this.renderFieldInput(field, value, fieldSize)}
                        ${field.label && !hasOwnLabel ? `
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
                ${field.label && !hasOwnLabel ? `
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
     * Render Official MD3 MCP Textfield
     * Uses styles from Material Design 3 MCP Server
     */
    renderMD3Textfield(field, value, variant = 'filled', size = 'medium') {
        const sizeClass = size === 'small' ? 'md-textfield--small' :
                         size === 'large' ? 'md-textfield--large' : 'md-textfield--medium';
        const variantClass = variant === 'outlined' ? 'md-textfield--outlined' : 'md-textfield--filled';
        const errorClass = this.errors[field.key] && this.touched[field.key] ? 'md-textfield--error' : '';
        const disabledClass = field.disabled ? 'md-textfield--disabled' : '';

        // XSS Protection: Escape all user-provided values
        const escapedValue = this.escapeHtml(value);
        const escapedLabel = this.escapeHtml(field.label);
        const escapedPlaceholder = this.escapeHtml(field.placeholder);
        const escapedDescription = this.escapeHtml(field.description);
        const escapedError = this.escapeHtml(this.errors[field.key]);

        return `
            <div class="md-textfield ${variantClass} ${sizeClass} ${errorClass} ${disabledClass}">
                ${escapedLabel ? `<label class="md-textfield__label" for="${this.containerId}_${field.key}">${escapedLabel}${field.required ? ' <span class="required">*</span>' : ''}</label>` : ''}
                <div class="md-textfield__field">
                    ${field.leadingIcon ? `<span class="md-textfield__leading-icon">${IconManager.getIcon(field.leadingIcon)}</span>` : ''}
                    <input
                        type="${field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text'}"
                        id="${this.containerId}_${field.key}"
                        name="${field.key}"
                        class="md-textfield__input"
                        value="${escapedValue}"
                        placeholder="${escapedPlaceholder}"
                        ${field.required ? 'required' : ''}
                        ${field.disabled ? 'disabled' : ''}
                        ${field.readonly ? 'readonly' : ''}
                    />
                    ${field.trailingIcon ? `<span class="md-textfield__trailing-icon">${IconManager.getIcon(field.trailingIcon)}</span>` : ''}
                </div>
                ${escapedDescription || escapedError ? `
                    <div class="md-textfield__supporting-text">
                        ${this.errors[field.key] && this.touched[field.key]
                            ? `<span class="md-textfield__error-text">${escapedError}</span>`
                            : escapedDescription
                                ? `<span class="md-textfield__supporting">${escapedDescription}</span>`
                                : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render Official MD3 MCP Checkbox
     */
    renderMD3Checkbox(field, value) {
        // XSS Protection: Escape label
        const escapedLabel = this.escapeHtml(field.checkboxLabel || field.label);

        return `
            <div class="md3-checkbox-with-label">
                <div class="md3-checkbox ${field.disabled ? 'md3-checkbox--disabled' : ''}">
                    <input
                        type="checkbox"
                        class="input"
                        id="${this.containerId}_${field.key}"
                        name="${field.key}"
                        ${value ? 'checked' : ''}
                        ${field.disabled ? 'disabled' : ''}
                    />
                    <div class="container">
                        <div class="outline"></div>
                        <div class="background"></div>
                        <div class="icon">
                            <svg viewBox="0 0 18 18">
                                <path class="mark checkmark" d="M6,9 L8,11 L12,7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                <label for="${this.containerId}_${field.key}" class="label">${escapedLabel}</label>
            </div>
        `;
    }

    /**
     * Render Official MD3 MCP Switch
     */
    renderMD3Switch(field, value) {
        // XSS Protection: Escape label
        const escapedLabel = this.escapeHtml(field.toggleLabel || field.label);

        return `
            <label class="md-switch-container">
                <div class="md-switch ${field.disabled ? 'md-switch--disabled' : ''}">
                    <input
                        type="checkbox"
                        role="switch"
                        id="${this.containerId}_${field.key}"
                        name="${field.key}"
                        class="md-switch__input"
                        ${value ? 'checked' : ''}
                        ${field.disabled ? 'disabled' : ''}
                    />
                    <div class="md-switch__track">
                        <div class="md-switch__handle"></div>
                    </div>
                </div>
                <span class="md-switch__label">${escapedLabel}</span>
            </label>
        `;
    }

    /**
     * Render Official MD3 MCP Radio Group
     */
    renderMD3RadioGroup(field, value) {
        const isInline = field.radioLayout === 'horizontal';
        // XSS Protection: Escape aria-label
        const escapedAriaLabel = this.escapeHtml(field.label);

        return `
            <div class="md-radio-group ${isInline ? 'md-radio-group--inline' : ''}" role="radiogroup" aria-label="${escapedAriaLabel}">
                ${(field.options || []).map((opt, index) => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    // XSS Protection: Escape option values and labels
                    const escapedOptValue = this.escapeHtml(optValue);
                    const escapedOptLabel = this.escapeHtml(optLabel);
                    return `
                        <label class="md-radio ${field.disabled ? 'md-radio--disabled' : ''}" for="${this.containerId}_${field.key}_${index}">
                            <input
                                type="radio"
                                name="${field.key}"
                                value="${escapedOptValue}"
                                id="${this.containerId}_${field.key}_${index}"
                                class="md-radio__input"
                                ${value === optValue ? 'checked' : ''}
                                ${field.disabled ? 'disabled' : ''}
                            />
                            <div class="md-radio__background">
                                <div class="md-radio__outer-circle"></div>
                                <div class="md-radio__inner-circle"></div>
                            </div>
                            <span class="md-radio__label">${escapedOptLabel}</span>
                        </label>
                    `;
                }).join('')}
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

        // Use Official MD3 MCP styles if enabled
        if (this.options.useOfficialMD3) {
            const variant = fieldLayout === 'outlined' ? 'outlined' : 'filled';
            const size = fieldSize === 'sm' ? 'small' : fieldSize === 'lg' ? 'large' : 'medium';

            switch (field.type) {
                case 'text':
                case 'email':
                case 'password':
                    return this.renderMD3Textfield(field, value, variant, size);
                case 'checkbox':
                    return this.renderMD3Checkbox(field, value);
                case 'toggle':
                    return this.renderMD3Switch(field, value);
                case 'radio':
                    return this.renderMD3RadioGroup(field, value);
            }
        }

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
                const autoGrow = field.autoGrow !== false; // Default: true
                const maxHeight = field.maxHeight || 300; // Default max height in px
                return wrapInputGroup(`
                    <textarea
                        class="form-input form-textarea ${sizeClass}"
                        ${commonAttrs}
                        rows="${field.rows || 3}"
                        ${autoGrow ? `data-autogrow="true" data-max-height="${maxHeight}"` : ''}
                        style="${autoGrow ? `max-height: ${maxHeight}px;` : ''}"
                    >${value}</textarea>
                `);

            case 'select':
                // Use M3DropdownMenu if enabled
                if (this.options.useM3Components && field.useM3Dropdown !== false) {
                    return `<div id="${this.containerId}_${field.key}_m3" class="form-m3-dropdown-container"></div>`;
                }
                // Fallback to native select
                const isM3Variant = fieldLayout === 'filled' || fieldLayout === 'outlined';
                return wrapInputGroup(`
                    <select class="form-input form-select ${sizeClass}" ${commonAttrs}>
                        ${isM3Variant
                            ? '<option value="" disabled selected hidden></option>'
                            : '<option value="">-- Bitte wählen --</option>'}
                        ${field.options?.map(opt => {
                            // Support both string options and object options {value, label}
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            return `<option value="${optValue}" ${value === optValue ? 'selected' : ''}>${optLabel}</option>`;
                        }).join('')}
                    </select>
                `);

            case 'checkbox':
                // If options are provided, render a checkbox group
                if (field.options && Array.isArray(field.options)) {
                    const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
                    return `
                        ${field.label ? `<div class="m3-checkbox-group-label">${field.label}${field.required ? '<span class="form-required">*</span>' : ''}</div>` : ''}
                        <div class="m3-checkbox-group">
                            ${field.options.map(opt => {
                                const optValue = typeof opt === 'string' ? opt : opt.value;
                                const optLabel = typeof opt === 'string' ? opt : opt.label;
                                const isChecked = selectedValues.includes(optValue);
                                return `
                                    <label class="m3-checkbox ${field.disabled ? 'm3-checkbox--disabled' : ''}">
                                        <input
                                            type="checkbox"
                                            class="m3-checkbox__input"
                                            name="${field.key}"
                                            value="${optValue}"
                                            ${isChecked ? 'checked' : ''}
                                            ${field.disabled ? 'disabled' : ''}
                                        />
                                        <span class="m3-checkbox__label">${optLabel}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
                // Single checkbox
                return `
                    <label class="m3-checkbox ${field.disabled ? 'm3-checkbox--disabled' : ''}">
                        <input
                            type="checkbox"
                            class="m3-checkbox__input"
                            ${commonAttrs}
                            ${value ? 'checked' : ''}
                        />
                        <span class="m3-checkbox__label">${field.checkboxLabel || field.label || ''}</span>
                    </label>
                `;

            case 'radio':
                const radioLayout = field.radioLayout || 'vertical'; // vertical, horizontal, grid-2, grid-3
                const radioGroupClass = radioLayout === 'horizontal' ? 'm3-radio-group--horizontal' : '';
                return `
                    ${field.label ? `<div class="m3-radio-group-label">${field.label}${field.required ? '<span class="form-required">*</span>' : ''}</div>` : ''}
                    <div class="m3-radio-group ${radioGroupClass}">
                        ${field.options?.map(opt => {
                            // Support both string options and object options {value, label}
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            return `
                            <label class="m3-radio ${field.disabled ? 'm3-radio--disabled' : ''}">
                                <input
                                    type="radio"
                                    class="m3-radio__input"
                                    name="${field.key}"
                                    value="${optValue}"
                                    ${value === optValue ? 'checked' : ''}
                                    ${field.disabled ? 'disabled' : ''}
                                />
                                <span class="m3-radio__label">${optLabel}</span>
                            </label>
                        `}).join('')}
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
                            aria-label="${i18n.t('form.decreaseValue')}"
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
                            aria-label="${i18n.t('form.increaseValue')}"
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
                            aria-label="${i18n.t('form.togglePassword')}"
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
                // Use M3ColorPicker if enabled
                if (this.options.useM3Components) {
                    return `<div id="${this.containerId}_${field.key}_m3" class="form-m3-colorpicker-container"></div>`;
                }
                // Fallback to native color input
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
                // Use M3Slider if enabled
                if (this.options.useM3Components) {
                    return `<div id="${this.containerId}_${field.key}_m3" class="form-m3-slider-container"></div>`;
                }
                // Fallback to native range input
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
                    <label class="m3-switch ${field.disabled ? 'm3-switch--disabled' : ''}">
                        <input
                            type="checkbox"
                            class="m3-switch__input"
                            ${commonAttrs}
                            ${value ? 'checked' : ''}
                        />
                        <span class="m3-switch__track">
                            <span class="m3-switch__thumb"></span>
                        </span>
                        <span class="m3-switch__label">${field.toggleLabel || field.label || ''}</span>
                    </label>
                `;

            // ============================================
            // STUDIO-STYLE FIELD TYPES
            // ============================================

            case 'button-group':
                // Horizontal buttons for single-select (like Spacing, Width, Position)
                return `
                    <div class="form-button-group" data-field-key="${this.escapeHtml(field.key)}">
                        ${field.options?.map(opt => {
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const optSubLabel = typeof opt === 'object' ? opt.subLabel : null;
                            const isActive = value === optValue;
                            return `
                                <button
                                    type="button"
                                    class="form-button-group__btn ${isActive ? 'active' : ''}"
                                    data-value="${this.escapeHtml(optValue)}"
                                    ${field.disabled ? 'disabled' : ''}
                                >
                                    ${this.escapeHtml(optLabel)}
                                    ${optSubLabel ? `<span class="form-button-group__sublabel">${this.escapeHtml(optSubLabel)}</span>` : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                `;

            case 'card-select':
                // Grid with selectable cards (like Layout Skeleton)
                const gridCols = field.columns || 2;
                return `
                    <div class="form-card-select" data-field-key="${this.escapeHtml(field.key)}" style="grid-template-columns: repeat(${parseInt(gridCols) || 2}, 1fr);">
                        ${field.options?.map(opt => {
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const optIcon = typeof opt === 'object' ? opt.icon : null;
                            const isActive = value === optValue;
                            return `
                                <div
                                    class="form-card-select__card ${isActive ? 'active' : ''}"
                                    data-value="${this.escapeHtml(optValue)}"
                                    ${field.disabled ? 'data-disabled="true"' : ''}
                                >
                                    ${optIcon ? `<div class="form-card-select__icon">${optIcon}</div>` : ''}
                                    <div class="form-card-select__label">${this.escapeHtml(optLabel)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;

            case 'color-swatches':
                // Color picker with round swatches
                const colors = field.colors || field.options || ['#1a73e8', '#7c4dff', '#00897b', '#ff6d00', '#e53935'];
                return `
                    <div class="form-color-swatches" data-field-key="${this.escapeHtml(field.key)}">
                        ${colors.map(color => {
                            const colorValue = typeof color === 'string' ? color : color.value;
                            const colorLabel = typeof color === 'object' ? color.label : null;
                            const isActive = value === colorValue;
                            // Sanitize color value to prevent CSS injection
                            const safeColorValue = this.escapeHtml(colorValue);
                            const safeColorLabel = this.escapeHtml(colorLabel || colorValue);
                            return `
                                <button
                                    type="button"
                                    class="form-color-swatch ${isActive ? 'active' : ''}"
                                    data-value="${safeColorValue}"
                                    style="background-color: ${safeColorValue};"
                                    title="${safeColorLabel}"
                                    ${field.disabled ? 'disabled' : ''}
                                >
                                    ${isActive ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                `;

            case 'inline-checkbox':
                // Compact checkbox with background container
                return `
                    <div class="form-inline-checkbox ${value ? 'checked' : ''}" data-field-key="${this.escapeHtml(field.key)}">
                        <input
                            type="checkbox"
                            id="${this.escapeHtml(this.containerId)}_${this.escapeHtml(field.key)}"
                            name="${this.escapeHtml(field.key)}"
                            ${value ? 'checked' : ''}
                            ${field.disabled ? 'disabled' : ''}
                        />
                        <label for="${this.escapeHtml(this.containerId)}_${this.escapeHtml(field.key)}">${this.escapeHtml(field.checkboxLabel || field.label || '')}</label>
                    </div>
                `;

            case 'section-header':
                // Section header like "1. LAYOUT SKELETON"
                return `
                    <div class="form-section-header">
                        ${field.number ? `<span class="form-section-header__number">${this.escapeHtml(field.number)}.</span>` : ''}
                        ${this.escapeHtml(field.label || field.title || '')}
                    </div>
                `;

            case 'item-list':
                // Dynamic list with add/remove (for Navigation Items, Footer Links)
                const items = Array.isArray(value) ? value : [];
                const itemFields = field.itemFields || [{ key: 'label', placeholder: 'Label' }];
                return `
                    <div class="form-item-list" data-field-key="${this.escapeHtml(field.key)}">
                        <div class="form-item-list__items">
                            ${items.map((item, idx) => `
                                <div class="form-item-list__row" data-index="${idx}">
                                    ${itemFields.map(itemField => {
                                        const itemValue = item[itemField.key] || '';
                                        if (itemField.type === 'select') {
                                            return `
                                                <select
                                                    class="form-item-list__input"
                                                    data-item-key="${this.escapeHtml(itemField.key)}"
                                                    ${itemField.disabled ? 'disabled' : ''}
                                                >
                                                    ${itemField.options?.map(opt => {
                                                        const optVal = typeof opt === 'string' ? opt : opt.value;
                                                        const optLbl = typeof opt === 'string' ? opt : opt.label;
                                                        return `<option value="${this.escapeHtml(optVal)}" ${itemValue === optVal ? 'selected' : ''}>${this.escapeHtml(optLbl)}</option>`;
                                                    }).join('')}
                                                </select>
                                            `;
                                        }
                                        return `
                                            <input
                                                type="${this.escapeHtml(itemField.type || 'text')}"
                                                class="form-item-list__input"
                                                data-item-key="${this.escapeHtml(itemField.key)}"
                                                value="${this.escapeHtml(itemValue)}"
                                                placeholder="${this.escapeHtml(itemField.placeholder || '')}"
                                                ${itemField.disabled ? 'disabled' : ''}
                                            />
                                        `;
                                    }).join('')}
                                    <button type="button" class="form-item-list__delete" data-index="${idx}">×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="form-item-list__add">
                            + ${this.escapeHtml(field.addLabel || 'Add Item')}
                        </button>
                    </div>
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
        // If showActions is explicitly false, don't render any actions
        if (this.options.showActions === false) {
            return '';
        }

        // Use M3 button classes when useM3Components is enabled
        const primaryBtnClass = this.options.useM3Components
            ? 'm3-button m3-button--filled'
            : 'ssi-btn ssi-btn-primary';
        const outlinedBtnClass = this.options.useM3Components
            ? 'm3-button m3-button--outlined'
            : 'ssi-btn ssi-btn-outlined';

        // Get labels from options or i18n
        const submitLabel = this.options.submitLabel || i18n.t('form.submit');
        const cancelLabel = this.options.cancelLabel || i18n.t('form.cancel');
        const resetLabel = this.options.resetLabel || i18n.t('form.reset');
        const previousLabel = i18n.t('form.previous');
        const nextLabel = i18n.t('form.next');
        const savingLabel = i18n.t('status.saving');

        if (this.options.multiStep) {
            return `
                <div class="form-actions">
                    ${this.currentStep > 0 ? `
                        <button type="button" class="${outlinedBtnClass}" id="${this.containerId}_prevStep">
                            ${previousLabel}
                        </button>
                    ` : ''}
                    ${this.currentStep < this.options.steps.length - 1 ? `
                        <button type="button" class="${primaryBtnClass}" id="${this.containerId}_nextStep">
                            ${nextLabel}
                        </button>
                    ` : `
                        <button type="submit" class="${primaryBtnClass}" ${this.isSubmitting ? 'disabled' : ''}>
                            ${this.isSubmitting ? savingLabel : submitLabel}
                        </button>
                    `}
                </div>
            `;
        }

        return `
            <div class="form-actions">
                ${this.options.showResetButton ? `
                    <button type="button" class="${outlinedBtnClass}" id="${this.containerId}_reset">
                        ${resetLabel}
                    </button>
                ` : ''}
                ${this.options.onCancel ? `
                    <button type="button" class="${outlinedBtnClass}" id="${this.containerId}_cancel">
                        ${cancelLabel}
                    </button>
                ` : ''}
                <button type="submit" class="${primaryBtnClass}" ${this.isSubmitting ? 'disabled' : ''}>
                    ${this.isSubmitting ? savingLabel : submitLabel}
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
                    toggleBtn.setAttribute('aria-label', isPassword ? i18n.t('form.hidePassword') : i18n.t('form.showPassword'));
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

        // Textarea auto-grow
        const autoGrowTextareas = this.container.querySelectorAll('textarea[data-autogrow="true"]');
        autoGrowTextareas.forEach(textarea => {
            const adjustHeight = () => {
                const maxHeight = parseInt(textarea.dataset.maxHeight) || 300;
                textarea.style.height = 'auto';
                const newHeight = Math.min(textarea.scrollHeight, maxHeight);
                textarea.style.height = newHeight + 'px';

                // Show/hide scrollbar based on content
                if (textarea.scrollHeight > maxHeight) {
                    textarea.style.overflowY = 'auto';
                } else {
                    textarea.style.overflowY = 'hidden';
                }
            };

            textarea.addEventListener('input', adjustHeight);
            textarea.addEventListener('focus', adjustHeight);
            // Initial adjustment
            setTimeout(adjustHeight, 10);
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

        // ============================================
        // STUDIO-STYLE FIELD EVENT LISTENERS
        // ============================================

        // Button Group clicks
        this.container.querySelectorAll('.form-button-group').forEach(group => {
            const fieldKey = group.dataset.fieldKey;
            const field = this.fields.find(f => f.key === fieldKey);

            group.querySelectorAll('.form-button-group__btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const value = btn.dataset.value;

                    // Update active state
                    group.querySelectorAll('.form-button-group__btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Update form value
                    this.values[fieldKey] = value;
                    this._notifyChange(field, value);
                    this.triggerAutoSave();
                });
            });
        });

        // Card Select clicks
        this.container.querySelectorAll('.form-card-select').forEach(grid => {
            const fieldKey = grid.dataset.fieldKey;
            const field = this.fields.find(f => f.key === fieldKey);

            grid.querySelectorAll('.form-card-select__card').forEach(card => {
                card.addEventListener('click', () => {
                    if (card.dataset.disabled === 'true') return;

                    const value = card.dataset.value;

                    // Update active state
                    grid.querySelectorAll('.form-card-select__card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');

                    // Update form value
                    this.values[fieldKey] = value;
                    this._notifyChange(field, value);
                    this.triggerAutoSave();
                });
            });
        });

        // Color Swatches clicks
        this.container.querySelectorAll('.form-color-swatches').forEach(container => {
            const fieldKey = container.dataset.fieldKey;
            const field = this.fields.find(f => f.key === fieldKey);

            container.querySelectorAll('.form-color-swatch').forEach(swatch => {
                swatch.addEventListener('click', (e) => {
                    e.preventDefault();
                    const value = swatch.dataset.value;

                    // Update active state
                    container.querySelectorAll('.form-color-swatch').forEach(s => {
                        s.classList.remove('active');
                        s.textContent = '';
                    });
                    swatch.classList.add('active');
                    swatch.textContent = '✓';

                    // Update form value
                    this.values[fieldKey] = value;
                    this._notifyChange(field, value);
                    this.triggerAutoSave();
                });
            });
        });

        // Inline Checkbox clicks
        this.container.querySelectorAll('.form-inline-checkbox').forEach(container => {
            const fieldKey = container.dataset.fieldKey;
            const field = this.fields.find(f => f.key === fieldKey);
            const checkbox = container.querySelector('input[type="checkbox"]');

            checkbox?.addEventListener('change', () => {
                const value = checkbox.checked;
                container.classList.toggle('checked', value);

                // Update form value
                this.values[fieldKey] = value;
                this._notifyChange(field, value);
                this.triggerAutoSave();
            });
        });

        // Item List events (add, remove, input change)
        this.container.querySelectorAll('.form-item-list').forEach(container => {
            const fieldKey = container.dataset.fieldKey;
            const field = this.fields.find(f => f.key === fieldKey);

            // Add button
            const addBtn = container.querySelector('.form-item-list__add');
            addBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                const items = Array.isArray(this.values[fieldKey]) ? [...this.values[fieldKey]] : [];

                // Create empty item based on itemFields
                const newItem = {};
                (field?.itemFields || [{ key: 'label' }]).forEach(itemField => {
                    newItem[itemField.key] = itemField.defaultValue || '';
                });

                items.push(newItem);
                this.values[fieldKey] = items;
                this.reRenderItemList(fieldKey, field);
                this._notifyChange(field, items);
                this.triggerAutoSave();
            });

            // Delete buttons & input changes
            this.attachItemListRowEvents(container, fieldKey, field);
        });
    }

    /**
     * Re-render item list after add/remove
     */
    reRenderItemList(fieldKey, field) {
        const container = this.container.querySelector(`.form-item-list[data-field-key="${fieldKey}"]`);
        if (!container) return;

        const items = Array.isArray(this.values[fieldKey]) ? this.values[fieldKey] : [];
        const itemFields = field?.itemFields || [{ key: 'label', placeholder: 'Label' }];
        const itemsContainer = container.querySelector('.form-item-list__items');

        itemsContainer.innerHTML = items.map((item, idx) => `
            <div class="form-item-list__row" data-index="${idx}">
                ${itemFields.map(itemField => {
                    const itemValue = item[itemField.key] || '';
                    if (itemField.type === 'select') {
                        return `
                            <select
                                class="form-item-list__input"
                                data-item-key="${itemField.key}"
                                ${itemField.disabled ? 'disabled' : ''}
                            >
                                ${itemField.options?.map(opt => {
                                    const optVal = typeof opt === 'string' ? opt : opt.value;
                                    const optLbl = typeof opt === 'string' ? opt : opt.label;
                                    return `<option value="${optVal}" ${itemValue === optVal ? 'selected' : ''}>${optLbl}</option>`;
                                }).join('')}
                            </select>
                        `;
                    }
                    return `
                        <input
                            type="${itemField.type || 'text'}"
                            class="form-item-list__input"
                            data-item-key="${itemField.key}"
                            value="${itemValue}"
                            placeholder="${itemField.placeholder || ''}"
                            ${itemField.disabled ? 'disabled' : ''}
                        />
                    `;
                }).join('')}
                <button type="button" class="form-item-list__delete" data-index="${idx}">×</button>
            </div>
        `).join('');

        // Re-attach events
        this.attachItemListRowEvents(container, fieldKey, field);
    }

    /**
     * Attach events to item list rows
     */
    attachItemListRowEvents(container, fieldKey, field) {
        // Delete buttons
        container.querySelectorAll('.form-item-list__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(btn.dataset.index);
                const items = Array.isArray(this.values[fieldKey]) ? [...this.values[fieldKey]] : [];
                items.splice(idx, 1);
                this.values[fieldKey] = items;
                this.reRenderItemList(fieldKey, field);
                this._notifyChange(field, items);
                this.triggerAutoSave();
            });
        });

        // Input changes
        container.querySelectorAll('.form-item-list__row').forEach(row => {
            const idx = parseInt(row.dataset.index);

            row.querySelectorAll('.form-item-list__input').forEach(input => {
                input.addEventListener('input', () => {
                    const itemKey = input.dataset.itemKey;
                    const items = Array.isArray(this.values[fieldKey]) ? [...this.values[fieldKey]] : [];

                    if (items[idx]) {
                        items[idx][itemKey] = input.value;
                        this.values[fieldKey] = items;
                        this._notifyChange(field, items);
                        this.triggerAutoSave();
                    }
                });

                input.addEventListener('change', () => {
                    const itemKey = input.dataset.itemKey;
                    const items = Array.isArray(this.values[fieldKey]) ? [...this.values[fieldKey]] : [];

                    if (items[idx]) {
                        items[idx][itemKey] = input.value;
                        this.values[fieldKey] = items;
                        this._notifyChange(field, items);
                        this.triggerAutoSave();
                    }
                });
            });
        });
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

        // Notify about change (field-level and global callbacks)
        this._notifyChange(field, value);

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
            this.showError(error.message || i18n.t('status.error'));
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
     * Notify about a field value change
     * Calls both field-level and global onChange callbacks
     * @param {Object} field - The field that changed
     * @param {*} value - The new value
     */
    _notifyChange(field, value) {
        // Call field-level onChange if defined
        if (field?.onChange) {
            field.onChange(value, this.values);
        }
        // Call global onChange if defined
        if (this.options.onChange) {
            this.options.onChange(this.values, field?.key);
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
     * Destroy the form builder instance
     * Cleans up all resources and clears the container
     */
    destroy() {
        // Clear any pending auto-save
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
        }

        // Destroy M3 components
        this.destroyM3Components();

        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }

        // Clear internal state
        this.values = {};
        this.errors = {};
        this.touched = {};
        this.fields = [];
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
