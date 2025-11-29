/**
 * TabBuilder.js - Modern Tab Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Multiple tab styles (underline, pill, contained)
 * - Icon support
 * - Badge/counter support
 * - Lazy loading content
 * - URL hash navigation
 * - Keyboard navigation (Arrow keys)
 * - Responsive (mobile scroll)
 * - Event callbacks
 * - Disabled tabs
 *
 * @version 2.3.0
 */

import { createVersionBadge } from './version.js';

export class TabBuilder {
    static tabCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.tabs - Tab definitions
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        this.id = `tab_${++TabBuilder.tabCounter}`;
        this.containerId = config.containerId;
        this.tabs = config.tabs || [];
        this.options = {
            style: config.options?.style || 'underline', // underline, pill, contained
            position: config.options?.position || 'top', // top, bottom, left, right
            defaultTab: config.options?.defaultTab || 0,
            urlHash: config.options?.urlHash || false,
            onChange: config.options?.onChange || null,
            lazyLoad: config.options?.lazyLoad || false,
            fullWidth: config.options?.fullWidth || false,
            centered: config.options?.centered || false,
            ...config.options
        };

        this.activeTab = this.options.defaultTab;
        this.container = null;
    }

    /**
     * Initialize and render tabs
     */
    render() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container with ID "${this.containerId}" not found`);
            return this;
        }

        // Check URL hash if enabled
        if (this.options.urlHash && window.location.hash) {
            const hash = window.location.hash.substring(1);
            const index = this.tabs.findIndex(tab => tab.key === hash);
            if (index !== -1) this.activeTab = index;
        }

        const html = `
            <div class="tab-builder tab-style-${this.options.style} tab-position-${this.options.position} ${this.options.fullWidth ? 'tab-full-width' : ''} ${this.options.centered ? 'tab-centered' : ''}" id="${this.id}">
                ${this.renderTabList()}
                ${this.renderTabPanels()}
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();

        return this;
    }

    /**
     * Render tab list (navigation)
     */
    renderTabList() {
        return `
            <div class="tab-list" role="tablist">
                ${this.tabs.map((tab, index) => this.renderTab(tab, index)).join('')}
            </div>
        `;
    }

    /**
     * Render single tab button
     */
    renderTab(tab, index) {
        const isActive = index === this.activeTab;
        const isDisabled = tab.disabled;

        return `
            <button
                class="tab-button ${isActive ? 'tab-active' : ''} ${isDisabled ? 'tab-disabled' : ''}"
                role="tab"
                aria-selected="${isActive}"
                aria-controls="panel_${this.id}_${index}"
                id="tab_${this.id}_${index}"
                data-tab-index="${index}"
                ${isDisabled ? 'disabled' : ''}
            >
                ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
                <span class="tab-label">${tab.label}</span>
                ${tab.badge ? `<span class="tab-badge">${tab.badge}</span>` : ''}
            </button>
        `;
    }

    /**
     * Render tab panels (content areas)
     */
    renderTabPanels() {
        return `
            <div class="tab-panels">
                ${this.tabs.map((tab, index) => this.renderPanel(tab, index)).join('')}
            </div>
        `;
    }

    /**
     * Render single panel
     */
    renderPanel(tab, index) {
        const isActive = index === this.activeTab;
        let content = '';

        if (this.options.lazyLoad) {
            content = isActive ? this.getTabContent(tab) : '';
        } else {
            content = this.getTabContent(tab);
        }

        return `
            <div
                class="tab-panel ${isActive ? 'tab-panel-active' : ''}"
                role="tabpanel"
                aria-labelledby="tab_${this.id}_${index}"
                id="panel_${this.id}_${index}"
                data-panel-index="${index}"
            >
                ${content}
            </div>
        `;
    }

    /**
     * Get tab content (string or function)
     */
    getTabContent(tab) {
        if (typeof tab.content === 'function') {
            return tab.content();
        }
        return tab.content || '';
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const tabButtons = this.container.querySelectorAll('.tab-button:not(.tab-disabled)');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.tabIndex);
                this.switchTab(index);
            });
        });

        // Keyboard navigation
        this.container.querySelector('.tab-list')?.addEventListener('keydown', (e) => {
            const currentIndex = this.activeTab;
            let newIndex = currentIndex;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = this.getNextEnabledTab(currentIndex);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = this.getPreviousEnabledTab(currentIndex);
            } else if (e.key === 'Home') {
                e.preventDefault();
                newIndex = this.getFirstEnabledTab();
            } else if (e.key === 'End') {
                e.preventDefault();
                newIndex = this.getLastEnabledTab();
            }

            if (newIndex !== currentIndex) {
                this.switchTab(newIndex);
                this.container.querySelector(`[data-tab-index="${newIndex}"]`)?.focus();
            }
        });

        // URL hash change
        if (this.options.urlHash) {
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.substring(1);
                const index = this.tabs.findIndex(tab => tab.key === hash);
                if (index !== -1) this.switchTab(index);
            });
        }
    }

    /**
     * Switch to tab by index
     */
    switchTab(index) {
        if (index === this.activeTab || this.tabs[index]?.disabled) return;

        const previousTab = this.activeTab;
        this.activeTab = index;

        // Update tab buttons
        this.container.querySelectorAll('.tab-button').forEach((btn, i) => {
            btn.classList.toggle('tab-active', i === index);
            btn.setAttribute('aria-selected', i === index);
        });

        // Update panels
        this.container.querySelectorAll('.tab-panel').forEach((panel, i) => {
            panel.classList.toggle('tab-panel-active', i === index);

            // Lazy load content
            if (this.options.lazyLoad && i === index && !panel.innerHTML.trim()) {
                panel.innerHTML = this.getTabContent(this.tabs[i]);
            }
        });

        // Update URL hash
        if (this.options.urlHash) {
            window.history.pushState(null, '', `#${this.tabs[index].key}`);
        }

        // Call onChange callback
        this.options.onChange?.(index, previousTab);
    }

    /**
     * Get next enabled tab
     */
    getNextEnabledTab(currentIndex) {
        for (let i = currentIndex + 1; i < this.tabs.length; i++) {
            if (!this.tabs[i].disabled) return i;
        }
        return currentIndex;
    }

    /**
     * Get previous enabled tab
     */
    getPreviousEnabledTab(currentIndex) {
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (!this.tabs[i].disabled) return i;
        }
        return currentIndex;
    }

    /**
     * Get first enabled tab
     */
    getFirstEnabledTab() {
        for (let i = 0; i < this.tabs.length; i++) {
            if (!this.tabs[i].disabled) return i;
        }
        return 0;
    }

    /**
     * Get last enabled tab
     */
    getLastEnabledTab() {
        for (let i = this.tabs.length - 1; i >= 0; i--) {
            if (!this.tabs[i].disabled) return i;
        }
        return this.tabs.length - 1;
    }

    /**
     * Programmatically activate tab
     */
    activateTab(index) {
        this.switchTab(index);
    }

    /**
     * Update tab badge
     */
    updateBadge(tabIndex, badge) {
        const button = this.container.querySelector(`[data-tab-index="${tabIndex}"]`);
        if (!button) return;

        const badgeEl = button.querySelector('.tab-badge');
        if (badge) {
            if (badgeEl) {
                badgeEl.textContent = badge;
            } else {
                button.insertAdjacentHTML('beforeend', `<span class="tab-badge">${badge}</span>`);
            }
        } else {
            badgeEl?.remove();
        }
    }

    /**
     * Enable/disable tab
     */
    setTabDisabled(tabIndex, disabled) {
        const button = this.container.querySelector(`[data-tab-index="${tabIndex}"]`);
        if (!button) return;

        this.tabs[tabIndex].disabled = disabled;
        button.classList.toggle('tab-disabled', disabled);
        button.disabled = disabled;
    }

    /**
     * Destroy tab component
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

export default TabBuilder;
