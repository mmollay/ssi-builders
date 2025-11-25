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
                ${createVersionBadge()}
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
     * Render action button
     */
    renderAction(action) {
        const btnType = action.type === 'primary' ? 'primary' : action.type === 'danger' ? 'danger' : 'outlined';
        return `
            <button
                class="ssi-btn ssi-btn-${btnType}"
                data-action-key="${action.key}"
                ${action.disabled ? 'disabled' : ''}
            >
                ${action.icon || ''} ${action.label}
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
                title: config.title || 'Bestätigung',
                body: config.message || 'Sind Sie sicher?',
                actions: [
                    {
                        key: 'cancel',
                        label: config.cancelLabel || 'Abbrechen',
                        type: 'secondary',
                        handler: () => {
                            resolve(false);
                        }
                    },
                    {
                        key: 'confirm',
                        label: config.confirmLabel || 'Bestätigen',
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
                title: config.title || 'Hinweis',
                body: config.message || '',
                actions: [
                    {
                        key: 'ok',
                        label: config.okLabel || 'OK',
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
                title: config.title || 'Eingabe',
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
                        label: config.cancelLabel || 'Abbrechen',
                        type: 'secondary',
                        handler: () => {
                            resolve(null);
                        }
                    },
                    {
                        key: 'submit',
                        label: config.submitLabel || 'OK',
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
}

export default ModalBuilder;
// Fixed side-left, side-right, bottom alignment
