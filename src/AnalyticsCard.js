/**
 * AnalyticsCard - KPI Card Component for Analytics Dashboards
 * Material Design 3 | Production-Ready
 *
 * @version 1.0.0
 * @author SSI Solutions
 *
 * @example
 * // Simple KPI Card
 * const card = new AnalyticsCard({
 *     containerId: 'kpi-searches',
 *     label: 'Suchen (24h)',
 *     value: 1234,
 *     format: 'number',
 *     icon: 'search',
 *     subtext: '~50 avg/hour'
 * });
 *
 * // With Trend Indicator
 * const card = new AnalyticsCard({
 *     containerId: 'kpi-revenue',
 *     label: 'Kosten',
 *     value: 12.50,
 *     format: 'currency',
 *     trend: { direction: 'up', value: 12, label: 'vs. Vorwoche' },
 *     color: 'success'
 * });
 */

import { IconManager } from './IconManager.js';

export class AnalyticsCard {
    /**
     * Create an AnalyticsCard
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {string} config.label - KPI label/title
     * @param {number|string} config.value - KPI value
     * @param {string} [config.format='number'] - Value format: number, currency, percent, time, custom
     * @param {string} [config.currencySymbol='$'] - Currency symbol for currency format
     * @param {number} [config.decimals=0] - Decimal places
     * @param {string} [config.icon] - Icon name (from IconManager)
     * @param {string} [config.subtext] - Secondary text below value
     * @param {Object} [config.trend] - Trend indicator
     * @param {string} config.trend.direction - 'up', 'down', or 'neutral'
     * @param {number} config.trend.value - Percentage change
     * @param {string} [config.trend.label] - Comparison label (e.g., "vs. Vorwoche")
     * @param {string} [config.color] - Accent color: 'primary', 'success', 'warning', 'error', 'purple'
     * @param {string} [config.size='medium'] - Card size: 'small', 'medium', 'large'
     * @param {boolean} [config.loading=false] - Show loading state
     * @param {Function} [config.onClick] - Click handler for drill-down
     * @param {string} [config.href] - Link URL (alternative to onClick)
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.label = config.label;
        this.value = config.value;
        this.format = config.format || 'number';
        this.currencySymbol = config.currencySymbol || '$';
        this.decimals = config.decimals ?? (this.format === 'currency' ? 2 : 0);
        this.icon = config.icon;
        this.subtext = config.subtext;
        this.trend = config.trend;
        this.color = config.color || 'primary';
        this.size = config.size || 'medium';
        this.loading = config.loading || false;
        this.onClick = config.onClick;
        this.href = config.href;

        this.element = null;
        this.render();
    }

    /**
     * Format the value based on format type
     * @private
     */
    formatValue(value) {
        if (value === null || value === undefined) return '-';

        switch (this.format) {
            case 'number':
                return typeof value === 'number' ? value.toLocaleString('de-DE') : value;

            case 'currency':
                return typeof value === 'number'
                    ? `${this.currencySymbol}${value.toLocaleString('de-DE', { minimumFractionDigits: this.decimals, maximumFractionDigits: this.decimals })}`
                    : value;

            case 'percent':
                return typeof value === 'number'
                    ? `${value.toLocaleString('de-DE', { minimumFractionDigits: this.decimals, maximumFractionDigits: this.decimals })}%`
                    : value;

            case 'time':
                return typeof value === 'number' ? `${value.toLocaleString('de-DE')}ms` : value;

            case 'compact':
                if (typeof value !== 'number') return value;
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toLocaleString('de-DE');

            default:
                return value;
        }
    }

    /**
     * Get trend icon based on direction
     * @private
     */
    getTrendIcon(direction) {
        switch (direction) {
            case 'up':
                return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>';
            case 'down':
                return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';
            default:
                return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>';
        }
    }

    /**
     * Render the card
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`AnalyticsCard: Container "${this.containerId}" not found`);
            return;
        }

        // Get icon HTML
        let iconHtml = '';
        if (this.icon) {
            try {
                iconHtml = `<span class="analytics-card-icon">${IconManager.getIcon(this.icon)}</span>`;
            } catch {
                iconHtml = '';
            }
        }

        // Build trend HTML
        let trendHtml = '';
        if (this.trend) {
            const trendClass = `analytics-card-trend analytics-card-trend-${this.trend.direction}`;
            trendHtml = `
                <div class="${trendClass}">
                    ${this.getTrendIcon(this.trend.direction)}
                    <span class="analytics-card-trend-value">${this.trend.value}%</span>
                    ${this.trend.label ? `<span class="analytics-card-trend-label">${this.trend.label}</span>` : ''}
                </div>
            `;
        }

        // Build subtext HTML
        let subtextHtml = '';
        if (this.subtext) {
            subtextHtml = `<div class="analytics-card-subtext">${this.subtext}</div>`;
        }

        // Determine if card is clickable
        const isClickable = this.onClick || this.href;
        const tag = this.href ? 'a' : 'div';
        const hrefAttr = this.href ? `href="${this.href}"` : '';
        const clickableClass = isClickable ? 'analytics-card-clickable' : '';

        // Build card HTML
        const html = `
            <${tag} class="analytics-card analytics-card-${this.size} analytics-card-${this.color} ${clickableClass} ${this.loading ? 'analytics-card-loading' : ''}" ${hrefAttr}>
                <div class="analytics-card-header">
                    ${iconHtml}
                    <span class="analytics-card-label">${this.label}</span>
                </div>
                <div class="analytics-card-body">
                    <div class="analytics-card-value ${this.loading ? 'skeleton' : ''}">
                        ${this.loading ? '' : this.formatValue(this.value)}
                    </div>
                    ${subtextHtml}
                </div>
                <div class="analytics-card-footer">
                    ${trendHtml}
                </div>
            </${tag}>
        `;

        container.innerHTML = html;
        this.element = container.firstElementChild;

        // Add click handler
        if (this.onClick && !this.href) {
            this.element.addEventListener('click', this.onClick);
        }
    }

    /**
     * Update the card value
     * @param {number|string} newValue - New value
     * @param {Object} [newTrend] - New trend object
     */
    update(newValue, newTrend) {
        this.value = newValue;
        if (newTrend !== undefined) {
            this.trend = newTrend;
        }
        this.loading = false;
        this.render();
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.loading = loading;
        this.render();
    }

    /**
     * Destroy the card
     */
    destroy() {
        if (this.element && this.onClick) {
            this.element.removeEventListener('click', this.onClick);
        }
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

/**
 * AnalyticsCardGrid - Helper to create multiple cards in a grid
 */
export class AnalyticsCardGrid {
    /**
     * Create a grid of analytics cards
     * @param {Object} config - Configuration
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.cards - Array of card configurations
     * @param {number} [config.columns=4] - Number of columns (auto-responsive)
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.cards = config.cards || [];
        this.columns = config.columns || 4;
        this.cardInstances = [];

        this.render();
    }

    /**
     * Render the grid
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`AnalyticsCardGrid: Container "${this.containerId}" not found`);
            return;
        }

        // Create grid container
        container.innerHTML = `<div class="analytics-card-grid analytics-card-grid-${this.columns}"></div>`;
        const grid = container.firstElementChild;

        // Create card containers and instances
        this.cards.forEach((cardConfig, index) => {
            const cardContainer = document.createElement('div');
            cardContainer.id = `${this.containerId}-card-${index}`;
            cardContainer.className = 'analytics-card-grid-item';
            grid.appendChild(cardContainer);

            // Create card instance
            const card = new AnalyticsCard({
                ...cardConfig,
                containerId: cardContainer.id
            });
            this.cardInstances.push(card);
        });
    }

    /**
     * Update a specific card by index
     * @param {number} index - Card index
     * @param {number|string} value - New value
     * @param {Object} [trend] - New trend
     */
    updateCard(index, value, trend) {
        if (this.cardInstances[index]) {
            this.cardInstances[index].update(value, trend);
        }
    }

    /**
     * Update all cards
     * @param {Array} data - Array of { value, trend } objects
     */
    updateAll(data) {
        data.forEach((item, index) => {
            if (this.cardInstances[index]) {
                this.cardInstances[index].update(item.value, item.trend);
            }
        });
    }

    /**
     * Set loading state for all cards
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.cardInstances.forEach(card => card.setLoading(loading));
    }

    /**
     * Destroy all cards
     */
    destroy() {
        this.cardInstances.forEach(card => card.destroy());
        this.cardInstances = [];
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}
