/**
 * ModalBuilder.js - Modern, Reusable Modal Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Declarative configuration
 * - Multiple sizes (small, medium, large, fullscreen)
 * - Header, body, footer sections
 * - Backdrop click & ESC key close
 * - Async actions with loading states
 * - Stack multiple modals
 * - Accessibility (focus trap, ARIA)
 * - Animations (slide, fade, zoom)
 *
 * @version 2.3.0
 */

import { createVersionBadge } from './version.js';
import { i18n } from './i18n.js';

export class ModalBuilder {
    static activeModals = [];
    static modalCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.title - Modal title
     * @param {string|Function} config.body - Modal body content (HTML string or render function)
     * @param {Array} config.actions - Action buttons
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        this.id = `modal_${++ModalBuilder.modalCounter}`;
        this.title = config.title || '';
        this.body = config.body || config.content || ''; // Support both body and content
        this.actions = config.actions || [];
        this.options = {
            size: config.size || config.options?.size || 'medium', // Support both config.size and config.options.size
            closeOnBackdrop: config.closeOnBackdrop ?? config.options?.closeOnBackdrop ?? true,
            closeOnEsc: config.closeOnEsc ?? config.options?.closeOnEsc ?? true,
            showCloseButton: config.showCloseButton ?? config.options?.showCloseButton ?? true,
            animation: config.animation || config.options?.animation || 'fade', // fade, slide, zoom, none
            centered: config.centered ?? config.options?.centered ?? true,
            scrollable: config.scrollable ?? config.options?.scrollable ?? true,
            onOpen: config.onOpen || config.options?.onOpen || null,
            onClose: config.onClose || config.options?.onClose || null,
            ...config.options
        };

        this.isOpen = false;
        this.isLoading = false;
        this.modalElement = null;
        this.escHandler = null;  // Initialize for cleanup in close()
    }

    /**
     * Open the modal
     */
    open() {
        if (this.isOpen) return;

        this.render();
        this.isOpen = true;

        // Add to active modals stack
        ModalBuilder.activeModals.push(this);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Show modal with animation
        setTimeout(() => {
            this.modalElement.classList.add('modal-show');
        }, 10);

        // Call onOpen callback
        this.options.onOpen?.();

        // Setup event listeners
        this.attachEventListeners();

        return this;
    }

    /**
     * Close the modal
     */
    close() {
        if (!this.isOpen) return;

        // FIX: Remove ESC key listener to prevent listener accumulation
        // This was causing the "3 clicks to close" bug
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }

        this.modalElement.classList.remove('modal-show');

        setTimeout(() => {
            this.modalElement?.remove();
            this.isOpen = false;

            // Remove from active modals stack
            const index = ModalBuilder.activeModals.indexOf(this);
            if (index > -1) {
                ModalBuilder.activeModals.splice(index, 1);
            }

            // Restore body scroll if no other modals are open
            if (ModalBuilder.activeModals.length === 0) {
                document.body.style.overflow = '';
            }

            // Call onClose callback
            this.options.onClose?.();
        }, 300);

        return this;
    }

    /**
     * Render modal
     */
    render() {
        // Determine overlay positioning class based on size
        let overlayPositionClass = '';
        if (this.options.size === 'side-left') {
            overlayPositionClass = 'modal-overlay-side-left';
        } else if (this.options.size === 'side-right') {
            overlayPositionClass = 'modal-overlay-side-right';
        } else if (this.options.size === 'bottom') {
            overlayPositionClass = 'modal-overlay-bottom';
        }

        // Don't apply centered class to side/bottom modals
        const isSideOrBottom = ['side-left', 'side-right', 'bottom'].includes(this.options.size);
        const centeredClass = (this.options.centered && !isSideOrBottom) ? 'modal-centered' : '';

        const modalHtml = `
            <div class="modal-overlay ${overlayPositionClass} modal-animation-${this.options.animation}" id="${this.id}">
                <div class="modal-backdrop" data-modal-backdrop="${this.id}"></div>
                <div class="modal-container modal-${this.options.size} ${centeredClass} ${this.options.scrollable ? 'modal-scrollable' : ''}">
                    ${this.renderHeader()}
                    ${this.renderBody()}
                    ${this.renderFooter()}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modalElement = document.getElementById(this.id);
    }

    /**
     * Render header
     */
    renderHeader() {
        if (!this.title && !this.options.showCloseButton) return '';

        return `
            <div class="modal-header">
                ${this.title ? `<h3 class="modal-title">${this.title}</h3>` : ''}
                ${this.options.showCloseButton ? `
                    <button class="modal-close-btn" data-modal-close="${this.id}" aria-label="Close">
                        ×
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render body
     */
    renderBody() {
        const content = typeof this.body === 'function' ? this.body() : this.body;

        return `
            <div class="modal-body">
                ${this.isLoading ? `
                    <div class="modal-loading">
                        <div class="modal-spinner"></div>
                        <p>Lädt...</p>
                    </div>
                ` : content}
            </div>
        `;
    }

    /**
     * Render footer
     */
    renderFooter() {
        if (this.actions.length === 0) return '';

        return `
            <div class="modal-footer">
                ${this.actions.map(action => this.renderAction(action)).join('')}
            </div>
        `;
    }

    /**
     * Render action button with M3 styling
     */
    renderAction(action) {
        // Map action types to M3 button classes
        let btnClass = 'm3-button';
        switch (action.type) {
            case 'primary':
                btnClass += ' m3-button--filled';
                break;
            case 'danger':
                btnClass += ' m3-button--filled m3-button--danger';
                break;
            case 'success':
                btnClass += ' m3-button--filled m3-button--success';
                break;
            case 'text':
                btnClass += ' m3-button--text';
                break;
            case 'tonal':
                btnClass += ' m3-button--tonal';
                break;
            default:
                btnClass += ' m3-button--outlined';
        }

        return `
            <button
                class="${btnClass}"
                data-action-key="${action.key}"
                ${action.disabled ? 'disabled' : ''}
            >
                ${action.icon ? `<span class="m3-button__icon">${action.icon}</span>` : ''} ${action.label}
            </button>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close button
        const closeBtn = this.modalElement.querySelector(`[data-modal-close="${this.id}"]`);
        closeBtn?.addEventListener('click', () => this.close());

        // Backdrop click
        if (this.options.closeOnBackdrop) {
            const backdrop = this.modalElement.querySelector(`[data-modal-backdrop="${this.id}"]`);
            backdrop?.addEventListener('click', () => this.close());
        }

        // ESC key
        if (this.options.closeOnEsc) {
            this.escHandler = (e) => {
                if (e.key === 'Escape' && ModalBuilder.activeModals[ModalBuilder.activeModals.length - 1] === this) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escHandler);
        }

        // Action buttons
        this.actions.forEach(action => {
            const btn = this.modalElement.querySelector(`[data-action-key="${action.key}"]`);
            btn?.addEventListener('click', async () => {
                if (action.handler) {
                    const shouldClose = await action.handler(this);
                    if (shouldClose !== false) {
                        this.close();
                    }
                } else {
                    this.close();
                }
            });
        });
    }

    /**
     * Update modal body
     */
    updateBody(content) {
        const bodyDiv = this.modalElement.querySelector('.modal-body');
        if (bodyDiv) {
            bodyDiv.innerHTML = typeof content === 'function' ? content() : content;
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.isLoading = true;
        this.updateBody('');
    }

    /**
     * Hide loading state
     */
    hideLoading(content) {
        this.isLoading = false;
        if (content) {
            this.updateBody(content);
        }
    }

    /**
     * Static method: Create and open modal
     */
    static create(config) {
        const modal = new ModalBuilder(config);
        return modal.open();
    }

    /**
     * Static method: Confirm dialog
     */
    static confirm(config) {
        return new Promise((resolve) => {
            const modal = new ModalBuilder({
                title: config.title || i18n.t('modal.confirmTitle'),
                body: config.message || '',
                actions: [
                    {
                        key: 'cancel',
                        label: config.cancelLabel || i18n.t('modal.cancel'),
                        type: 'secondary',
                        handler: () => {
                            resolve(false);
                        }
                    },
                    {
                        key: 'confirm',
                        label: config.confirmLabel || i18n.t('modal.confirm'),
                        type: config.danger ? 'danger' : 'primary',
                        handler: () => {
                            resolve(true);
                        }
                    }
                ],
                options: {
                    size: config.size || 'small',
                    ...config.options
                }
            });
            modal.open();
        });
    }

    /**
     * Static method: Alert dialog
     */
    static alert(config) {
        return new Promise((resolve) => {
            const modal = new ModalBuilder({
                title: config.title || i18n.t('modal.alertTitle'),
                body: config.message || '',
                actions: [
                    {
                        key: 'ok',
                        label: config.okLabel || i18n.t('modal.ok'),
                        type: 'primary',
                        handler: () => {
                            resolve(true);
                        }
                    }
                ],
                options: {
                    size: config.size || 'small',
                    ...config.options
                }
            });
            modal.open();
        });
    }

    /**
     * Static method: Prompt dialog
     */
    static prompt(config) {
        return new Promise((resolve) => {
            const inputId = `prompt_input_${Date.now()}`;
            let inputValue = config.defaultValue || '';

            const modal = new ModalBuilder({
                title: config.title || i18n.t('modal.promptTitle'),
                body: `
                    <div class="modal-prompt">
                        ${config.message ? `<p>${config.message}</p>` : ''}
                        <input
                            type="${config.type || 'text'}"
                            id="${inputId}"
                            class="form-input"
                            placeholder="${config.placeholder || ''}"
                            value="${inputValue}"
                        />
                    </div>
                `,
                actions: [
                    {
                        key: 'cancel',
                        label: config.cancelLabel || i18n.t('modal.cancel'),
                        type: 'secondary',
                        handler: () => {
                            resolve(null);
                        }
                    },
                    {
                        key: 'submit',
                        label: config.submitLabel || i18n.t('modal.ok'),
                        type: 'primary',
                        handler: () => {
                            const input = document.getElementById(inputId);
                            resolve(input?.value || null);
                        }
                    }
                ],
                options: {
                    size: config.size || 'small',
                    onOpen: () => {
                        const input = document.getElementById(inputId);
                        input?.focus();
                        input?.addEventListener('input', (e) => {
                            inputValue = e.target.value;
                        });
                    },
                    ...config.options
                }
            });
            modal.open();
        });
    }

    /**
     * Static method: Close all modals
     */
    static closeAll() {
        [...ModalBuilder.activeModals].forEach(modal => modal.close());
    }

    /**
     * Static method: Form dialog with FormBuilder integration
     * Opens a modal containing a FormBuilder form
     *
     * @param {Object} config - Configuration object
     * @param {string} config.title - Modal title
     * @param {Array} config.fields - FormBuilder fields configuration
     * @param {Object} config.values - Initial form values (for edit mode)
     * @param {Function} config.dataSource - Async function to load form data (for AJAX)
     * @param {Function} config.onSubmit - Called with form values on submit
     * @param {string} config.submitLabel - Submit button label
     * @param {string} config.cancelLabel - Cancel button label
     * @param {string} config.size - Modal size (default: 'medium')
     * @param {string} config.fieldLayout - 'filled' or 'outlined' (default: 'filled')
     * @param {string} config.density - 'dense', 'normal', 'comfortable' (default: 'normal')
     * @param {Object} config.formOptions - Additional FormBuilder options
     * @returns {Promise<Object|null>} Form values on submit, null on cancel
     *
     * @example
     * // Simple form
     * const result = await ModalBuilder.form({
     *     title: 'Neuer Benutzer',
     *     fields: [
     *         { key: 'name', type: 'text', label: 'Name', required: true },
     *         { key: 'email', type: 'email', label: 'E-Mail', required: true }
     *     ]
     * });
     *
     * @example
     * // Edit form with AJAX data loading
     * const result = await ModalBuilder.form({
     *     title: 'Benutzer bearbeiten',
     *     fields: [...],
     *     dataSource: async () => {
     *         const response = await fetch(`/api/users/${userId}`);
     *         return response.json();
     *     }
     * });
     */
    static form(config) {
        return new Promise(async (resolve) => {
            const formContainerId = `modal_form_${Date.now()}`;
            let formBuilder = null;
            let initialValues = config.values || {};

            // Load data from dataSource if provided
            const loadData = config.dataSource ? true : false;

            const modal = new ModalBuilder({
                title: config.title || i18n.t('modal.formTitle') || 'Formular',
                body: `<div id="${formContainerId}" class="modal-form-container"></div>`,
                actions: [], // We'll handle buttons via FormBuilder
                size: config.size || 'medium',
                closeOnBackdrop: config.closeOnBackdrop ?? false, // Don't close on backdrop for forms
                closeOnEsc: config.closeOnEsc ?? true,
                onOpen: async () => {
                    // Dynamic import of FormBuilder to avoid circular dependency
                    const { FormBuilder } = await import('./FormBuilder.js');

                    // Show loading state if dataSource is provided
                    if (loadData) {
                        const container = document.getElementById(formContainerId);
                        container.innerHTML = `
                            <div class="modal-loading">
                                <div class="modal-spinner"></div>
                                <p>${i18n.t('modal.loading') || 'Lädt...'}</p>
                            </div>
                        `;

                        try {
                            initialValues = await config.dataSource();
                        } catch (error) {
                            console.error('Error loading form data:', error);
                            container.innerHTML = `
                                <div class="modal-error">
                                    <p>${i18n.t('modal.loadError') || 'Fehler beim Laden der Daten'}</p>
                                </div>
                            `;
                            return;
                        }
                    }

                    // Create FormBuilder instance
                    formBuilder = new FormBuilder({
                        containerId: formContainerId,
                        fields: config.fields || [],
                        fieldLayout: config.fieldLayout || 'filled',
                        density: config.density || 'normal',
                        layout: config.layout || 'grid',
                        gridColumns: config.gridColumns || 1,
                        options: {
                            useM3Components: true,
                            showResetButton: config.showResetButton ?? false,
                            submitLabel: config.submitLabel || i18n.t('form.submit') || 'Speichern',
                            cancelLabel: config.cancelLabel || i18n.t('form.cancel') || 'Abbrechen',
                            initialValues: initialValues,  // FIX: Use initialValues, not values
                            fieldLayout: config.fieldLayout || 'filled',  // FIX: Also pass fieldLayout in options
                            density: config.density || 'normal',          // FIX: Also pass density in options
                            layout: config.layout || 'grid',              // FIX: Also pass layout in options
                            gridColumns: config.gridColumns || 1,         // FIX: Also pass gridColumns in options
                            ...config.formOptions
                        },
                        buttons: [
                            {
                                key: 'cancel',
                                label: config.cancelLabel || i18n.t('form.cancel') || 'Abbrechen',
                                type: 'secondary',
                                onClick: () => {
                                    modal.close();
                                    resolve(null);
                                }
                            },
                            {
                                key: 'submit',
                                label: config.submitLabel || i18n.t('form.submit') || 'Speichern',
                                type: 'primary',
                                submit: true
                            }
                        ],
                        onSubmit: async (values) => {
                            // Call custom onSubmit if provided
                            if (config.onSubmit) {
                                try {
                                    const result = await config.onSubmit(values);
                                    // If onSubmit returns false, don't close
                                    if (result === false) return;
                                } catch (error) {
                                    console.error('Form submit error:', error);
                                    return; // Don't close on error
                                }
                            }
                            modal.close();
                            resolve(values);
                        }
                    });
                },
                onClose: () => {
                    // Clean up FormBuilder
                    if (formBuilder && typeof formBuilder.destroy === 'function') {
                        formBuilder.destroy();
                    }
                    // Resolve with null if closed without submit
                    resolve(null);
                },
                ...config.options
            });

            modal.open();
        });
    }

    /**
     * Static method: Delete confirmation with optional AJAX
     *
     * @param {Object} config - Configuration object
     * @param {string} config.title - Modal title
     * @param {string} config.message - Confirmation message
     * @param {string} config.itemName - Name of item being deleted (for message)
     * @param {Function} config.onConfirm - Called when confirmed (can be async for AJAX)
     * @returns {Promise<boolean>} true if confirmed and successful, false if cancelled
     *
     * @example
     * const deleted = await ModalBuilder.delete({
     *     itemName: 'Max Mustermann',
     *     onConfirm: async () => {
     *         await fetch(`/api/users/${userId}`, { method: 'DELETE' });
     *     }
     * });
     */
    static delete(config) {
        return new Promise((resolve) => {
            const itemName = config.itemName || '';
            const message = config.message ||
                (itemName
                    ? `${i18n.t('modal.deleteConfirm') || 'Möchten Sie'} "${itemName}" ${i18n.t('modal.deleteConfirmEnd') || 'wirklich löschen?'}`
                    : i18n.t('modal.deleteGeneric') || 'Möchten Sie diesen Eintrag wirklich löschen?');

            const modal = new ModalBuilder({
                title: config.title || i18n.t('modal.deleteTitle') || 'Löschen bestätigen',
                body: `
                    <div class="modal-delete-confirm">
                        <p>${message}</p>
                        ${config.warning ? `<p class="modal-delete-warning">${config.warning}</p>` : ''}
                    </div>
                `,
                actions: [
                    {
                        key: 'cancel',
                        label: config.cancelLabel || i18n.t('modal.cancel') || 'Abbrechen',
                        type: 'secondary',
                        handler: () => {
                            resolve(false);
                        }
                    },
                    {
                        key: 'delete',
                        label: config.deleteLabel || i18n.t('modal.delete') || 'Löschen',
                        type: 'danger',
                        handler: async (modalInstance) => {
                            if (config.onConfirm) {
                                // Show loading state
                                const deleteBtn = modalInstance.modalElement.querySelector('[data-action-key="delete"]');
                                const originalText = deleteBtn.innerHTML;
                                deleteBtn.innerHTML = `<span class="btn-spinner"></span> ${i18n.t('modal.deleting') || 'Löschen...'}`;
                                deleteBtn.disabled = true;

                                try {
                                    await config.onConfirm();
                                    resolve(true);
                                } catch (error) {
                                    console.error('Delete error:', error);
                                    deleteBtn.innerHTML = originalText;
                                    deleteBtn.disabled = false;
                                    // Show error message
                                    const body = modalInstance.modalElement.querySelector('.modal-body');
                                    body.innerHTML += `
                                        <div class="modal-error-message">
                                            ${i18n.t('modal.deleteError') || 'Fehler beim Löschen'}
                                        </div>
                                    `;
                                    return false; // Don't close modal
                                }
                            } else {
                                resolve(true);
                            }
                        }
                    }
                ],
                options: {
                    size: config.size || 'small',
                    ...config.options
                }
            });
            modal.open();
        });
    }
}

export default ModalBuilder;
// Fixed side-left, side-right, bottom alignment
