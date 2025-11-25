/**
 * FilterBar - Global Filter Component for Analytics Dashboards
 * Material Design 3 | Production-Ready
 *
 * @version 1.0.0
 * @author SSI Solutions
 *
 * @example
 * // Basic FilterBar
 * const filterBar = new FilterBar({
 *     containerId: 'filters',
 *     filters: [
 *         { type: 'select', key: 'category', label: 'Kategorie', options: [...] },
 *         { type: 'search', key: 'query', placeholder: 'Suchen...' }
 *     ],
 *     onChange: (values) => console.log('Filters changed:', values)
 * });
 *
 * // With TimeRangePicker integration
 * const filterBar = new FilterBar({
 *     containerId: 'filters',
 *     showTimeRange: true,
 *     filters: [...],
 *     onTimeRangeChange: (range) => loadData(range),
 *     onChange: (values) => applyFilters(values)
 * });
 */

import { IconManager } from './IconManager.js';

export class FilterBar {
    /**
     * Create a FilterBar
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.filters - Array of filter configurations
     * @param {Function} [config.onChange] - Callback when any filter changes
     * @param {boolean} [config.showRefresh=true] - Show refresh button
     * @param {boolean} [config.showReset=true] - Show reset button
     * @param {boolean} [config.showExport=false] - Show export button
     * @param {Function} [config.onRefresh] - Refresh button handler
     * @param {Function} [config.onExport] - Export button handler
     * @param {number} [config.debounceMs=300] - Debounce delay for search inputs
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.filters = config.filters || [];
        this.onChange = config.onChange;
        this.showRefresh = config.showRefresh ?? true;
        this.showReset = config.showReset ?? true;
        this.showExport = config.showExport ?? false;
        this.onRefresh = config.onRefresh;
        this.onExport = config.onExport;
        this.debounceMs = config.debounceMs ?? 300;

        this.values = {};
        this.debounceTimers = {};
        this.element = null;

        // Initialize values with defaults
        this.filters.forEach(filter => {
            this.values[filter.key] = filter.defaultValue ?? (filter.type === 'select' ? 'all' : '');
        });

        this.render();
    }

    /**
     * Render a single filter element
     * @private
     */
    renderFilter(filter) {
        switch (filter.type) {
            case 'select':
                return this.renderSelect(filter);
            case 'search':
                return this.renderSearch(filter);
            case 'date':
                return this.renderDate(filter);
            case 'checkbox':
                return this.renderCheckbox(filter);
            default:
                console.warn(`FilterBar: Unknown filter type "${filter.type}"`);
                return '';
        }
    }

    /**
     * Render select filter
     * @private
     */
    renderSelect(filter) {
        const options = filter.options || [];
        const optionsHtml = options.map(opt => {
            const value = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const selected = this.values[filter.key] === value ? 'selected' : '';
            return `<option value="${value}" ${selected}>${label}</option>`;
        }).join('');

        return `
            <div class="analytics-filter-group">
                ${filter.label ? `<label class="analytics-filter-label">${filter.label}</label>` : ''}
                <select class="analytics-filter-select" data-filter-key="${filter.key}">
                    ${filter.includeAll !== false ? `<option value="all">Alle</option>` : ''}
                    ${optionsHtml}
                </select>
            </div>
        `;
    }

    /**
     * Render search filter
     * @private
     */
    renderSearch(filter) {
        return `
            <div class="analytics-filter-group">
                ${filter.label ? `<label class="analytics-filter-label">${filter.label}</label>` : ''}
                <input
                    type="search"
                    class="analytics-filter-search"
                    data-filter-key="${filter.key}"
                    placeholder="${filter.placeholder || 'Suchen...'}"
                    value="${this.values[filter.key] || ''}"
                >
            </div>
        `;
    }

    /**
     * Render date filter
     * @private
     */
    renderDate(filter) {
        return `
            <div class="analytics-filter-group">
                ${filter.label ? `<label class="analytics-filter-label">${filter.label}</label>` : ''}
                <input
                    type="date"
                    class="analytics-filter-select"
                    data-filter-key="${filter.key}"
                    value="${this.values[filter.key] || ''}"
                    ${filter.min ? `min="${filter.min}"` : ''}
                    ${filter.max ? `max="${filter.max}"` : ''}
                >
            </div>
        `;
    }

    /**
     * Render checkbox filter
     * @private
     */
    renderCheckbox(filter) {
        const checked = this.values[filter.key] ? 'checked' : '';
        return `
            <div class="analytics-filter-group">
                <label class="analytics-filter-checkbox">
                    <input
                        type="checkbox"
                        data-filter-key="${filter.key}"
                        ${checked}
                    >
                    <span>${filter.label}</span>
                </label>
            </div>
        `;
    }

    /**
     * Render action buttons
     * @private
     */
    renderActions() {
        let actionsHtml = '';

        if (this.showReset) {
            actionsHtml += `
                <button class="analytics-filter-btn analytics-filter-btn-secondary" data-action="reset">
                    Reset
                </button>
            `;
        }

        if (this.showExport) {
            let exportIcon = '';
            try {
                exportIcon = IconManager.getIcon('download');
            } catch {
                exportIcon = '';
            }
            actionsHtml += `
                <button class="analytics-filter-btn analytics-filter-btn-secondary" data-action="export">
                    ${exportIcon}
                    Export
                </button>
            `;
        }

        if (this.showRefresh) {
            let refreshIcon = '';
            try {
                refreshIcon = IconManager.getIcon('refresh');
            } catch {
                refreshIcon = '';
            }
            actionsHtml += `
                <button class="analytics-filter-btn analytics-filter-btn-primary" data-action="refresh">
                    ${refreshIcon}
                    Aktualisieren
                </button>
            `;
        }

        return actionsHtml ? `<div class="analytics-filter-actions">${actionsHtml}</div>` : '';
    }

    /**
     * Count active filters
     * @private
     */
    countActiveFilters() {
        let count = 0;
        this.filters.forEach(filter => {
            const value = this.values[filter.key];
            if (filter.type === 'select' && value !== 'all' && value !== '') {
                count++;
            } else if (filter.type === 'search' && value && value.trim() !== '') {
                count++;
            } else if (filter.type === 'checkbox' && value) {
                count++;
            } else if (filter.type === 'date' && value) {
                count++;
            }
        });
        return count;
    }

    /**
     * Render the filter bar
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`FilterBar: Container "${this.containerId}" not found`);
            return;
        }

        const filtersHtml = this.filters.map(f => this.renderFilter(f)).join('');
        const actionsHtml = this.renderActions();
        const activeCount = this.countActiveFilters();
        const badgeHtml = activeCount > 0 ? `<span class="analytics-filter-badge">${activeCount}</span>` : '';

        const html = `
            <div class="analytics-filter-bar">
                ${filtersHtml}
                <div class="analytics-filter-spacer"></div>
                ${badgeHtml}
                ${actionsHtml}
            </div>
        `;

        container.innerHTML = html;
        this.element = container.firstElementChild;
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     * @private
     */
    attachEventListeners() {
        if (!this.element) return;

        // Select change events
        this.element.querySelectorAll('select[data-filter-key]').forEach(select => {
            select.addEventListener('change', (e) => {
                const key = e.target.dataset.filterKey;
                this.values[key] = e.target.value;
                this.triggerChange();
            });
        });

        // Search input events (with debounce)
        this.element.querySelectorAll('input[type="search"][data-filter-key]').forEach(input => {
            input.addEventListener('input', (e) => {
                const key = e.target.dataset.filterKey;

                // Clear existing timer
                if (this.debounceTimers[key]) {
                    clearTimeout(this.debounceTimers[key]);
                }

                // Set new timer
                this.debounceTimers[key] = setTimeout(() => {
                    this.values[key] = e.target.value;
                    this.triggerChange();
                }, this.debounceMs);
            });

            // Also trigger on Enter key immediately
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const key = e.target.dataset.filterKey;
                    if (this.debounceTimers[key]) {
                        clearTimeout(this.debounceTimers[key]);
                    }
                    this.values[key] = e.target.value;
                    this.triggerChange();
                }
            });
        });

        // Date input events
        this.element.querySelectorAll('input[type="date"][data-filter-key]').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.filterKey;
                this.values[key] = e.target.value;
                this.triggerChange();
            });
        });

        // Checkbox events
        this.element.querySelectorAll('input[type="checkbox"][data-filter-key]').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.filterKey;
                this.values[key] = e.target.checked;
                this.triggerChange();
            });
        });

        // Action button events
        this.element.querySelectorAll('button[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                switch (action) {
                    case 'refresh':
                        if (this.onRefresh) this.onRefresh();
                        break;
                    case 'reset':
                        this.reset();
                        break;
                    case 'export':
                        if (this.onExport) this.onExport();
                        break;
                }
            });
        });
    }

    /**
     * Trigger onChange callback
     * @private
     */
    triggerChange() {
        this.render(); // Re-render to update badge
        if (this.onChange) {
            this.onChange(this.getValues());
        }
    }

    /**
     * Get current filter values
     * @returns {Object} Current filter values
     */
    getValues() {
        return { ...this.values };
    }

    /**
     * Get a specific filter value
     * @param {string} key - Filter key
     * @returns {*} Filter value
     */
    getValue(key) {
        return this.values[key];
    }

    /**
     * Set filter values programmatically
     * @param {Object} values - Object with filter key-value pairs
     * @param {boolean} [triggerChange=true] - Whether to trigger onChange
     */
    setValues(values, triggerChange = true) {
        Object.assign(this.values, values);
        this.render();
        if (triggerChange && this.onChange) {
            this.onChange(this.getValues());
        }
    }

    /**
     * Reset all filters to defaults
     */
    reset() {
        this.filters.forEach(filter => {
            this.values[filter.key] = filter.defaultValue ?? (filter.type === 'select' ? 'all' : '');
        });
        this.render();
        if (this.onChange) {
            this.onChange(this.getValues());
        }
    }

    /**
     * Update filter options (e.g., for dynamic dropdowns)
     * @param {string} key - Filter key
     * @param {Array} options - New options array
     */
    updateOptions(key, options) {
        const filter = this.filters.find(f => f.key === key);
        if (filter && filter.type === 'select') {
            filter.options = options;
            this.render();
        }
    }

    /**
     * Enable/disable a filter
     * @param {string} key - Filter key
     * @param {boolean} enabled - Enable state
     */
    setEnabled(key, enabled) {
        const element = this.element?.querySelector(`[data-filter-key="${key}"]`);
        if (element) {
            element.disabled = !enabled;
        }
    }

    /**
     * Destroy the filter bar
     */
    destroy() {
        // Clear all debounce timers
        Object.values(this.debounceTimers).forEach(timer => clearTimeout(timer));
        this.debounceTimers = {};

        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}
