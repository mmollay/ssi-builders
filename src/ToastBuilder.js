/**
 * ToastBuilder - Material Design 3 Toast Notifications
 *
 * @example
 * import { ToastBuilder } from '/vendor/ssi-builders/src/index.js';
 *
 * ToastBuilder.success('Saved successfully');
 *
 * ToastBuilder.show({
 *     title: 'Update Available',
 *     message: 'A new version is available.',
 *     type: 'info',
 *     duration: 5000
 * });
 */

import { GlobalConfig } from './GlobalConfig.js';
import { IconManager } from './IconManager.js';

export class ToastBuilder {
    static container = null;
    static toasts = [];

    /**
     * Show a toast notification
     * @param {Object} options
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message
     * @param {string} options.type - 'success' | 'error' | 'warning' | 'info'
     * @param {number} options.duration - Duration in ms (default: 3000)
     * @param {string} options.position - 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
     */
    static show(options) {
        const config = {
            title: '',
            message: '',
            type: 'info',
            duration: GlobalConfig.get('toasts.duration') || 3000,
            position: GlobalConfig.get('toasts.position') || 'top-right',
            ...options
        };

        this._ensureContainer(config.position);
        this._createToast(config);
    }

    static success(message, title = 'Success', options = {}) {
        this.show({ ...options, type: 'success', message, title });
    }

    static error(message, title = 'Error', options = {}) {
        this.show({ ...options, type: 'error', message, title });
    }

    static warning(message, title = 'Warning', options = {}) {
        this.show({ ...options, type: 'warning', message, title });
    }

    static info(message, title = 'Info', options = {}) {
        this.show({ ...options, type: 'info', message, title });
    }

    /**
     * Create container if it doesn't exist
     * @private
     */
    static _ensureContainer(position) {
        let container = document.querySelector(`.ssi-toast-container.${position}`);

        if (!container) {
            container = document.createElement('div');
            container.className = `ssi-toast-container ${position}`;
            document.body.appendChild(container);
        }

        this.container = container;
    }

    /**
     * Create and append toast element
     * @private
     */
    static _createToast(config) {
        const toast = document.createElement('div');
        toast.className = `ssi-toast ${config.type}`;
        toast.setAttribute('role', 'alert');

        // Icons mapping
        const icons = {
            success: 'check',
            error: 'alert-circle', // or 'x-circle' depending on icon set
            warning: 'alert-triangle',
            info: 'info'
        };

        const iconName = icons[config.type] || 'info';

        toast.innerHTML = `
            <div class="ssi-toast-icon">
                ${IconManager.getIcon(iconName)}
            </div>
            <div class="ssi-toast-content">
                ${config.title ? `<div class="ssi-toast-title">${config.title}</div>` : ''}
                ${config.message ? `<div class="ssi-toast-message">${config.message}</div>` : ''}
            </div>
            <button class="ssi-toast-close" aria-label="Close">
                ${IconManager.getIcon('x')}
            </button>
        `;

        // Close button handler
        const closeBtn = toast.querySelector('.ssi-toast-close');
        closeBtn.addEventListener('click', () => this._removeToast(toast));

        // Append to container
        // If bottom position, we might want to prepend or append depending on flex-direction
        // CSS handles order via flex-direction: column-reverse for bottom
        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss
        if (config.duration > 0) {
            setTimeout(() => {
                this._removeToast(toast);
            }, config.duration);
        }
    }

    /**
     * Remove toast with animation
     * @private
     */
    static _removeToast(toast) {
        if (!toast || toast.classList.contains('hiding')) return;

        toast.classList.remove('show');
        toast.classList.add('hiding');

        toast.addEventListener('transitionend', () => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            
            // Cleanup empty containers
            const containers = document.querySelectorAll('.ssi-toast-container');
            containers.forEach(c => {
                if (c.children.length === 0) {
                    c.remove();
                }
            });
        }, { once: true });
    }
}
