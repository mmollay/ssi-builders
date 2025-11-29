/**
 * MessageBuilder - Material Design 3 Inline Messages/Alerts
 *
 * Unlike ToastBuilder (temporary notifications), MessageBuilder creates
 * persistent inline messages that remain visible until dismissed.
 *
 * @example
 * // Static methods for quick creation
 * MessageBuilder.info('#container', 'This is an informational message');
 * MessageBuilder.success('#container', 'Operation completed successfully');
 * MessageBuilder.warning('#container', 'Please review before continuing');
 * MessageBuilder.error('#container', 'An error occurred');
 *
 * @example
 * // Instance-based with full options
 * const message = new MessageBuilder({
 *     containerId: 'my-container',
 *     type: 'warning',
 *     title: 'Attention Required',
 *     message: 'Your session will expire in 5 minutes.',
 *     dismissible: true,
 *     icon: true,
 *     actions: [
 *         { label: 'Extend Session', handler: () => extendSession() }
 *     ]
 * });
 *
 * @version 1.0.0
 */

import { IconManager } from './IconManager.js';
import { i18n } from './i18n.js';

export class MessageBuilder {
    static messageCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {string} config.type - 'info' | 'success' | 'warning' | 'error' | 'loading'
     * @param {string} config.title - Optional title
     * @param {string} config.message - Message content
     * @param {boolean} config.dismissible - Show close button (default: true)
     * @param {boolean} config.icon - Show type icon (default: true)
     * @param {Array} config.actions - Optional action buttons [{label, handler, variant}]
     * @param {string} config.variant - 'filled' | 'outlined' | 'soft' (default: 'soft')
     * @param {Function} config.onDismiss - Callback when message is dismissed
     */
    constructor(config) {
        this.id = `message_${++MessageBuilder.messageCounter}`;
        this.config = {
            containerId: config.containerId,
            type: config.type || 'info',
            title: config.title || '',
            message: config.message || '',
            dismissible: config.dismissible !== false,
            icon: config.icon !== false,
            actions: config.actions || [],
            variant: config.variant || 'soft',
            onDismiss: config.onDismiss || null
        };

        this.element = null;
        this.container = null;

        if (this.config.containerId) {
            this.render();
        }
    }

    /**
     * Get icon for message type
     * @private
     */
    _getIcon() {
        const icons = {
            success: 'check',
            error: 'warning',
            warning: 'warning',
            info: 'info',
            loading: 'refresh'
        };
        return IconManager.getIcon(icons[this.config.type] || 'info');
    }

    /**
     * Render the message
     */
    render() {
        // Get container
        if (typeof this.config.containerId === 'string') {
            this.container = document.getElementById(this.config.containerId) ||
                             document.querySelector(this.config.containerId);
        } else {
            this.container = this.config.containerId;
        }

        if (!this.container) {
            console.error(`MessageBuilder: Container "${this.config.containerId}" not found`);
            return this;
        }

        // Build actions HTML
        const actionsHtml = this.config.actions.length > 0
            ? `<div class="message-actions">
                ${this.config.actions.map((action, idx) => `
                    <button class="message-action ${action.variant || 'text'}" data-action-idx="${idx}">
                        ${action.label}
                    </button>
                `).join('')}
               </div>`
            : '';

        // Build message HTML
        const messageHtml = `
            <div class="message-builder message-${this.config.type} message-${this.config.variant}"
                 id="${this.id}"
                 role="alert"
                 aria-live="${this.config.type === 'error' ? 'assertive' : 'polite'}">
                ${this.config.icon ? `
                    <div class="message-icon ${this.config.type === 'loading' ? 'message-icon-loading' : ''}">
                        ${this._getIcon()}
                    </div>
                ` : ''}
                <div class="message-content">
                    ${this.config.title ? `<div class="message-title">${this.config.title}</div>` : ''}
                    <div class="message-text">${this.config.message}</div>
                    ${actionsHtml}
                </div>
                ${this.config.dismissible ? `
                    <button class="message-dismiss" aria-label="${i18n.t('message.dismiss')}">
                        ${IconManager.getIcon('close')}
                    </button>
                ` : ''}
            </div>
        `;

        // Insert into container
        this.container.insertAdjacentHTML('beforeend', messageHtml);
        this.element = document.getElementById(this.id);

        // Attach event listeners
        this._attachEventListeners();

        // Trigger show animation
        requestAnimationFrame(() => {
            this.element?.classList.add('message-show');
        });

        return this;
    }

    /**
     * Attach event listeners
     * @private
     */
    _attachEventListeners() {
        if (!this.element) return;

        // Dismiss button
        const dismissBtn = this.element.querySelector('.message-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.dismiss());
        }

        // Action buttons
        const actionBtns = this.element.querySelectorAll('.message-action');
        actionBtns.forEach(btn => {
            const idx = parseInt(btn.dataset.actionIdx);
            const action = this.config.actions[idx];
            if (action?.handler) {
                btn.addEventListener('click', () => action.handler(this));
            }
        });
    }

    /**
     * Dismiss/remove the message
     */
    dismiss() {
        if (!this.element) return this;

        this.element.classList.remove('message-show');
        this.element.classList.add('message-hiding');

        this.element.addEventListener('transitionend', () => {
            this.element?.remove();
            this.element = null;

            if (this.config.onDismiss) {
                this.config.onDismiss();
            }
        }, { once: true });

        return this;
    }

    /**
     * Update message content
     */
    update(options) {
        if (!this.element) return this;

        if (options.type) {
            this.element.classList.remove(`message-${this.config.type}`);
            this.config.type = options.type;
            this.element.classList.add(`message-${this.config.type}`);

            // Update icon
            const iconEl = this.element.querySelector('.message-icon');
            if (iconEl) {
                iconEl.innerHTML = this._getIcon();
                iconEl.classList.toggle('message-icon-loading', options.type === 'loading');
            }
        }

        if (options.title !== undefined) {
            this.config.title = options.title;
            let titleEl = this.element.querySelector('.message-title');
            if (options.title && !titleEl) {
                const contentEl = this.element.querySelector('.message-content');
                contentEl.insertAdjacentHTML('afterbegin', `<div class="message-title">${options.title}</div>`);
            } else if (titleEl) {
                titleEl.textContent = options.title;
            }
        }

        if (options.message !== undefined) {
            this.config.message = options.message;
            const textEl = this.element.querySelector('.message-text');
            if (textEl) {
                textEl.textContent = options.message;
            }
        }

        return this;
    }

    /**
     * Destroy the message
     */
    destroy() {
        this.element?.remove();
        this.element = null;
        return this;
    }

    // ========== Static convenience methods ==========

    /**
     * Create info message
     */
    static info(container, message, options = {}) {
        return new MessageBuilder({
            containerId: container,
            type: 'info',
            message,
            ...options
        });
    }

    /**
     * Create success message
     */
    static success(container, message, options = {}) {
        return new MessageBuilder({
            containerId: container,
            type: 'success',
            message,
            ...options
        });
    }

    /**
     * Create warning message
     */
    static warning(container, message, options = {}) {
        return new MessageBuilder({
            containerId: container,
            type: 'warning',
            message,
            ...options
        });
    }

    /**
     * Create error message
     */
    static error(container, message, options = {}) {
        return new MessageBuilder({
            containerId: container,
            type: 'error',
            message,
            ...options
        });
    }

    /**
     * Create loading message
     */
    static loading(container, message = 'Loading...', options = {}) {
        return new MessageBuilder({
            containerId: container,
            type: 'loading',
            message,
            dismissible: false,
            ...options
        });
    }

    /**
     * Clear all messages in a container
     */
    static clearAll(container) {
        const containerEl = typeof container === 'string'
            ? document.getElementById(container) || document.querySelector(container)
            : container;

        if (containerEl) {
            const messages = containerEl.querySelectorAll('.message-builder');
            messages.forEach(msg => {
                msg.classList.remove('message-show');
                msg.classList.add('message-hiding');
                setTimeout(() => msg.remove(), 300);
            });
        }
    }
}

export default MessageBuilder;
