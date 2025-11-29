/**
 * TimeRangePicker - Time Range Selection Component for Analytics
 * Material Design 3 | Production-Ready
 *
 * @version 1.0.0
 * @author SSI Solutions
 *
 * @example
 * // Basic TimeRangePicker
 * const picker = new TimeRangePicker({
 *     containerId: 'time-picker',
 *     onChange: (range) => loadData(range)
 * });
 *
 * // With Comparison Toggle
 * const picker = new TimeRangePicker({
 *     containerId: 'time-picker',
 *     defaultRange: 'week',
 *     showComparison: true,
 *     onChange: (range, comparison) => {
 *         loadData(range);
 *         if (comparison) loadComparisonData(comparison);
 *     }
 * });
 */

import { i18n } from './i18n.js';

export class TimeRangePicker {
    /**
     * Get predefined time ranges with i18n labels
     */
    static get RANGES() {
        return {
            day: { label: i18n.t('timeRange.today'), value: 'day', days: 1 },
            week: { label: i18n.t('timeRange.last7Days'), value: 'week', days: 7 },
            month: { label: i18n.t('timeRange.thisMonth'), value: 'month', days: 30 },
            quarter: { label: i18n.t('timeRange.thisQuarter'), value: 'quarter', days: 90 },
            year: { label: i18n.t('timeRange.thisYear'), value: 'year', days: 365 }
        };
    }

    /**
     * Create a TimeRangePicker
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {string} [config.defaultRange='day'] - Default selected range
     * @param {Array} [config.ranges] - Array of range keys to show (default: all)
     * @param {boolean} [config.showComparison=false] - Show comparison toggle
     * @param {string} [config.comparisonLabel='vs. Vorperiode'] - Comparison label
     * @param {Function} [config.onChange] - Callback when range changes
     * @param {boolean} [config.showCustom=false] - Show custom date range option
     * @param {string} [config.size='medium'] - Size: 'small', 'medium', 'large'
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.defaultRange = config.defaultRange || 'day';
        this.ranges = config.ranges || Object.keys(TimeRangePicker.RANGES);
        this.showComparison = config.showComparison ?? false;
        this.comparisonLabel = config.comparisonLabel || i18n.t('timeRange.vsPreviousPeriod');
        this.onChange = config.onChange;
        this.showCustom = config.showCustom ?? false;
        this.size = config.size || 'medium';

        this.currentRange = this.defaultRange;
        this.comparisonEnabled = false;
        this.customStartDate = null;
        this.customEndDate = null;
        this.element = null;

        this.render();
    }

    /**
     * Get the start date for a given range
     * @param {string} range - Range key
     * @returns {Date} Start date
     */
    static getStartDate(range) {
        const now = new Date();

        if (range === 'custom') {
            return null; // Handle separately
        }

        const rangeConfig = TimeRangePicker.RANGES[range];
        if (!rangeConfig) {
            return new Date(now - 24 * 60 * 60 * 1000); // Default to 1 day
        }

        return new Date(now - rangeConfig.days * 24 * 60 * 60 * 1000);
    }

    /**
     * Get the comparison period start date
     * @param {string} range - Range key
     * @returns {Object} { start: Date, end: Date }
     */
    static getComparisonPeriod(range) {
        const rangeConfig = TimeRangePicker.RANGES[range];
        if (!rangeConfig) return null;

        const now = new Date();
        const currentStart = new Date(now - rangeConfig.days * 24 * 60 * 60 * 1000);
        const previousEnd = new Date(currentStart - 1); // Day before current period
        const previousStart = new Date(previousEnd - rangeConfig.days * 24 * 60 * 60 * 1000);

        return {
            start: previousStart,
            end: previousEnd
        };
    }

    /**
     * Render the time range picker
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`TimeRangePicker: Container "${this.containerId}" not found`);
            return;
        }

        // Build range buttons
        const rangeButtonsHtml = this.ranges.map(rangeKey => {
            const range = TimeRangePicker.RANGES[rangeKey];
            if (!range) return '';

            const activeClass = this.currentRange === rangeKey ? 'active' : '';
            return `<button class="analytics-time-btn ${activeClass}" data-range="${rangeKey}">${range.label}</button>`;
        }).join('');

        // Add custom button if enabled
        const customButtonHtml = this.showCustom
            ? `<button class="analytics-time-btn ${this.currentRange === 'custom' ? 'active' : ''}" data-range="custom">${i18n.t('timeRange.custom')}</button>`
            : '';

        // Build comparison toggle
        const comparisonHtml = this.showComparison
            ? `
                <div class="analytics-time-comparison">
                    <input type="checkbox" id="${this.containerId}-comparison" ${this.comparisonEnabled ? 'checked' : ''}>
                    <label for="${this.containerId}-comparison">${this.comparisonLabel}</label>
                </div>
            `
            : '';

        // Build custom date inputs (hidden by default)
        const customInputsHtml = this.showCustom && this.currentRange === 'custom'
            ? `
                <div class="analytics-time-custom">
                    <input type="date" class="analytics-filter-select" data-custom="start" value="${this.customStartDate || ''}">
                    <span>${i18n.t('timeRange.to')}</span>
                    <input type="date" class="analytics-filter-select" data-custom="end" value="${this.customEndDate || ''}">
                </div>
            `
            : '';

        const html = `
            <div class="analytics-time-picker-wrapper analytics-time-picker-${this.size}">
                <div class="analytics-time-picker">
                    ${rangeButtonsHtml}
                    ${customButtonHtml}
                </div>
                ${customInputsHtml}
                ${comparisonHtml}
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

        // Range button clicks
        this.element.querySelectorAll('.analytics-time-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const range = e.target.dataset.range;
                this.setRange(range);
            });
        });

        // Comparison toggle
        const comparisonCheckbox = this.element.querySelector(`#${this.containerId}-comparison`);
        if (comparisonCheckbox) {
            comparisonCheckbox.addEventListener('change', (e) => {
                this.comparisonEnabled = e.target.checked;
                this.triggerChange();
            });
        }

        // Custom date inputs
        this.element.querySelectorAll('[data-custom]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.dataset.custom === 'start') {
                    this.customStartDate = e.target.value;
                } else {
                    this.customEndDate = e.target.value;
                }
                this.triggerChange();
            });
        });
    }

    /**
     * Trigger onChange callback
     * @private
     */
    triggerChange() {
        if (!this.onChange) return;

        const rangeData = this.getRangeData();
        const comparisonData = this.comparisonEnabled ? this.getComparisonData() : null;

        this.onChange(rangeData, comparisonData);
    }

    /**
     * Get current range data
     * @returns {Object} Range data with start, end, and key
     */
    getRangeData() {
        const now = new Date();

        if (this.currentRange === 'custom') {
            return {
                key: 'custom',
                start: this.customStartDate ? new Date(this.customStartDate) : null,
                end: this.customEndDate ? new Date(this.customEndDate) : now,
                label: i18n.t('timeRange.custom')
            };
        }

        const rangeConfig = TimeRangePicker.RANGES[this.currentRange];
        if (!rangeConfig) {
            return {
                key: 'day',
                start: new Date(now - 24 * 60 * 60 * 1000),
                end: now,
                label: i18n.t('timeRange.today')
            };
        }

        return {
            key: this.currentRange,
            start: new Date(now - rangeConfig.days * 24 * 60 * 60 * 1000),
            end: now,
            days: rangeConfig.days,
            label: rangeConfig.label
        };
    }

    /**
     * Get comparison period data
     * @returns {Object|null} Comparison data
     */
    getComparisonData() {
        if (this.currentRange === 'custom') {
            // For custom ranges, calculate same duration before
            if (!this.customStartDate || !this.customEndDate) return null;

            const start = new Date(this.customStartDate);
            const end = new Date(this.customEndDate);
            const duration = end - start;

            return {
                start: new Date(start - duration),
                end: new Date(start - 1),
                label: i18n.t('timeRange.previousPeriod')
            };
        }

        const comparison = TimeRangePicker.getComparisonPeriod(this.currentRange);
        if (!comparison) return null;

        return {
            start: comparison.start,
            end: comparison.end,
            label: i18n.t('timeRange.previousPeriod')
        };
    }

    /**
     * Get current range key
     * @returns {string} Current range key
     */
    getRange() {
        return this.currentRange;
    }

    /**
     * Set the current range
     * @param {string} range - Range key
     * @param {boolean} [triggerChange=true] - Whether to trigger onChange
     */
    setRange(range, triggerChange = true) {
        if (!this.ranges.includes(range) && range !== 'custom') {
            console.warn(`TimeRangePicker: Invalid range "${range}"`);
            return;
        }

        this.currentRange = range;
        this.render();

        if (triggerChange) {
            this.triggerChange();
        }
    }

    /**
     * Set custom date range
     * @param {string|Date} start - Start date
     * @param {string|Date} end - End date
     */
    setCustomRange(start, end) {
        this.currentRange = 'custom';
        this.customStartDate = typeof start === 'string' ? start : start.toISOString().split('T')[0];
        this.customEndDate = typeof end === 'string' ? end : end.toISOString().split('T')[0];
        this.render();
        this.triggerChange();
    }

    /**
     * Enable/disable comparison
     * @param {boolean} enabled - Enable state
     */
    setComparison(enabled) {
        this.comparisonEnabled = enabled;
        this.render();
        this.triggerChange();
    }

    /**
     * Check if comparison is enabled
     * @returns {boolean} Comparison state
     */
    isComparisonEnabled() {
        return this.comparisonEnabled;
    }

    /**
     * Get SQL-compatible date filter
     * @returns {string} ISO date string for >= comparison
     */
    getSqlStartDate() {
        const rangeData = this.getRangeData();
        return rangeData.start ? rangeData.start.toISOString() : null;
    }

    /**
     * Destroy the picker
     */
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}
