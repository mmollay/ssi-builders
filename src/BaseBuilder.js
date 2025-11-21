/**
 * BaseBuilder.js - Base class for all Builder components
 * Provides common functionality and state management
 */

import { createVersionBadge } from './version.js';

export class BaseBuilder {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - ID of the container element
     * @param {Object} defaultOptions - Default options for the specific builder
     */
    constructor(config, defaultOptions = {}) {
        this.containerId = config.containerId;
        this.options = {
            ...defaultOptions,
            ...config.options
        };

        // Common internal state
        this.container = null;
    }

    /**
     * Initialize the builder
     * Validates container and calls render
     */
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container #${this.containerId} not found`);
            return false;
        }
        return true;
    }

    /**
     * Render the version badge
     * @returns {string} HTML string for version badge
     */
    renderVersionBadge() {
        return createVersionBadge();
    }

    /**
     * Utility: Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
