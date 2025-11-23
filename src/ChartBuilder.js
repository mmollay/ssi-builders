/**
 * ChartBuilder.js - Modern, Reusable Chart Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Pure CSS/SVG charts (no external dependencies)
 * - Chart types: line, bar, pie, donut, progress
 * - Responsive & animated
 * - Tooltips on hover
 * - Legend support
 * - Color themes
 * - Export as PNG/SVG
 *
 * @version 2.0.0
 */

import { createVersionBadge } from './version.js';

export class ChartBuilder {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - ID of the container element
     * @param {string} config.type - Chart type (line, bar, pie, donut, progress)
     * @param {Array} config.data - Chart data
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.type = config.type || 'bar';
        this.data = config.data || [];
        this.options = {
            title: config.options?.title || '',
            subtitle: config.options?.subtitle || '',
            width: config.options?.width || '100%',
            height: config.options?.height || 300,
            colors: config.options?.colors || this.getDefaultColors(),
            showLegend: config.options?.showLegend !== false,
            showTooltips: config.options?.showTooltips !== false,
            showValues: config.options?.showValues || false,
            animated: config.options?.animated !== false,
            xAxisLabel: config.options?.xAxisLabel || '',
            yAxisLabel: config.options?.yAxisLabel || '',
            currency: config.options?.currency || false,
            percentage: config.options?.percentage || false,
            ...config.options
        };

        this.init();
    }

    /**
     * Get default colors from Design Token system
     * @returns {Array} Array of color values
     */
    getDefaultColors() {
        const root = getComputedStyle(document.documentElement);
        return [
            root.getPropertyValue('--ssi-primary').trim() || '#1a73e8',
            root.getPropertyValue('--ssi-success').trim() || '#34a853',
            root.getPropertyValue('--ssi-warning').trim() || '#fbbc04',
            root.getPropertyValue('--ssi-error').trim() || '#ea4335',
            '#9334e6', '#ff6d00', '#00acc1',  // Extra colors (no token yet)
            root.getPropertyValue('--ssi-text-secondary').trim() || '#5f6368'
        ];
    }

    /**
     * Sanitize HTML content to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Sanitize attribute values to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized attribute value
     */
    sanitizeAttr(str) {
        return String(str).replace(/["'<>&]/g, (char) => {
            const map = { '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;', '&': '&amp;' };
            return map[char];
        });
    }

    /**
     * Initialize the ChartBuilder
     */
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }

        this.render();
    }

    /**
     * Main render function
     */
    render() {
        this.container.innerHTML = `
            <div class="chart-builder">
                ${this.renderHeader()}
                <div class="chart-container">
                    ${this.renderChart()}
                </div>
                ${this.options.showLegend ? this.renderLegend() : ''}
                ${createVersionBadge()}
            </div>
        `;

        if (this.options.showTooltips) {
            this.attachTooltipListeners();
        }
    }

    /**
     * Render header
     */
    renderHeader() {
        if (!this.options.title && !this.options.subtitle) return '';

        return `
            <div class="chart-header">
                ${this.options.title ? `<h3 class="chart-title">${this.options.title}</h3>` : ''}
                ${this.options.subtitle ? `<p class="chart-subtitle">${this.options.subtitle}</p>` : ''}
            </div>
        `;
    }

    /**
     * Render chart based on type
     */
    renderChart() {
        switch (this.type) {
            case 'bar':
                return this.renderBarChart();
            case 'line':
                return this.renderLineChart();
            case 'pie':
                return this.renderPieChart();
            case 'donut':
                return this.renderDonutChart();
            case 'progress':
                return this.renderProgressChart();
            default:
                return '<p>Unknown chart type</p>';
        }
    }

    /**
     * Render bar chart
     */
    renderBarChart() {
        // Handle both old format (array) and new format (labels + datasets)
        let chartData = [];
        if (Array.isArray(this.data)) {
            // Old format: [{label, value}, ...]
            chartData = this.data;
        } else if (this.data.labels && this.data.datasets) {
            // New format: {labels: [...], datasets: [{data: [...]}]}
            const dataset = this.data.datasets[0];
            chartData = this.data.labels.map((label, index) => ({
                label: label,
                value: dataset.data[index]
            }));
        }

        if (!chartData.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        const maxValue = Math.max(...chartData.map(d => d.value));
        const barWidth = 100 / chartData.length;

        // Get color from dataset or use default colors
        const getColor = (index) => {
            if (this.data.datasets && this.data.datasets[0].backgroundColor) {
                const bg = this.data.datasets[0].backgroundColor;
                return Array.isArray(bg) ? bg[index] : bg;
            }
            return this.options.colors[index % this.options.colors.length];
        };

        return `
            <div class="chart-bars" style="height: ${this.options.height}px">
                ${chartData.map((item, index) => {
                    const height = (item.value / maxValue) * 100;
                    const color = getColor(index);

                    return `
                        <div class="chart-bar-wrapper" style="width: ${barWidth}%">
                            <div class="chart-bar-container">
                                ${this.options.showValues ? `
                                    <div class="chart-bar-value">${this.formatValue(item.value)}</div>
                                ` : ''}
                                <div
                                    class="chart-bar ${this.options.animated ? 'chart-animated' : ''}"
                                    style="height: ${height}%; background: ${color}"
                                    data-label="${this.sanitizeAttr(item.label)}"
                                    data-value="${this.sanitizeAttr(item.value)}"
                                ></div>
                            </div>
                            <div class="chart-bar-label">${this.sanitizeHTML(item.label)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Render line chart
     */
    renderLineChart() {
        // Handle both old format (array) and new format (labels + datasets)
        let chartData = [];
        let datasets = [];

        if (Array.isArray(this.data)) {
            // Old format: [{label, value}, ...]
            chartData = this.data;
            datasets = [{
                data: this.data.map(d => d.value),
                borderColor: this.options.colors[0],
                backgroundColor: this.options.colors[0]
            }];
        } else if (this.data.labels && this.data.datasets) {
            // New format: {labels: [...], datasets: [{data: [...]}]}
            chartData = this.data.labels.map(label => ({ label }));
            datasets = this.data.datasets;
        }

        if (!chartData.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        // Get all values from all datasets
        const allValues = datasets.flatMap(ds => ds.data);
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);
        const range = maxValue - minValue || 1;

        const width = 800;
        const height = this.options.height;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Render each dataset
        const renderDataset = (dataset, datasetIndex) => {
            const points = chartData.map((item, index) => {
                const value = dataset.data[index];
                const x = padding + (index / (chartData.length - 1)) * chartWidth;
                const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
                return { x, y, label: item.label, value };
            });

            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const color = dataset.borderColor || this.options.colors[datasetIndex % this.options.colors.length];

            return `
                <!-- Line path -->
                <path d="${pathData}" fill="none" stroke="${color}"
                      stroke-width="3" class="${this.options.animated ? 'chart-line-animated' : ''}" />

                <!-- Data points -->
                ${points.map(p => `
                    <circle cx="${p.x}" cy="${p.y}" r="5" fill="${color}"
                            class="chart-point" data-label="${this.sanitizeAttr(p.label)}" data-value="${this.sanitizeAttr(p.value)}" />
                `).join('')}
            `;
        };

        return `
            <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <!-- Grid lines -->
                ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const y = padding + chartHeight * (1 - ratio);
                    const value = minValue + range * ratio;
                    return `
                        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"
                              stroke="#e8eaed" stroke-width="1" />
                        <text x="${padding - 5}" y="${y + 4}" text-anchor="end"
                              fill="#5f6368" font-size="12">${this.formatValue(value)}</text>
                    `;
                }).join('')}

                <!-- Datasets -->
                ${datasets.map((dataset, index) => renderDataset(dataset, index)).join('')}

                <!-- X-axis labels -->
                ${chartData.map((item, index) => {
                    const x = padding + (index / (chartData.length - 1)) * chartWidth;
                    return `
                        <text x="${x}" y="${height - padding + 20}" text-anchor="middle"
                              fill="#5f6368" font-size="12">${this.sanitizeHTML(item.label)}</text>
                    `;
                }).join('')}
            </svg>
        `;
    }

    /**
     * Render pie chart
     */
    renderPieChart() {
        return this.renderPieDonutChart(false);
    }

    /**
     * Render donut chart
     */
    renderDonutChart() {
        return this.renderPieDonutChart(true);
    }

    /**
     * Render pie/donut chart
     */
    renderPieDonutChart(isDonut) {
        // Handle both old format (array) and new format (labels + datasets)
        let chartData = [];
        if (Array.isArray(this.data)) {
            // Old format: [{label, value}, ...]
            chartData = this.data;
        } else if (this.data.labels && this.data.datasets) {
            // New format: {labels: [...], datasets: [{data: [...]}]}
            const dataset = this.data.datasets[0];
            chartData = this.data.labels.map((label, index) => ({
                label: label,
                value: dataset.data[index]
            }));
        }

        if (!chartData.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        const size = 300;
        const center = size / 2;
        const radius = size / 2 - 20;
        const innerRadius = isDonut ? radius * 0.6 : 0;

        let currentAngle = -90;

        // Get color from dataset or use default colors
        const getColor = (index) => {
            if (this.data.datasets && this.data.datasets[0].backgroundColor) {
                const bg = this.data.datasets[0].backgroundColor;
                return Array.isArray(bg) ? bg[index] : bg;
            }
            return this.options.colors[index % this.options.colors.length];
        };

        return `
            <svg class="chart-svg chart-pie" viewBox="0 0 ${size} ${size}" style="max-width: ${size}px">
                ${chartData.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle = endAngle;

                    const path = this.createArcPath(center, center, radius, innerRadius, startAngle, endAngle);
                    const color = getColor(index);

                    // Calculate label position (middle of the arc)
                    const midAngle = (startAngle + endAngle) / 2;
                    const midAngleRad = (midAngle * Math.PI) / 180;
                    const labelRadius = isDonut ? (radius + innerRadius) / 2 : radius * 0.65;
                    const labelX = center + labelRadius * Math.cos(midAngleRad);
                    const labelY = center + labelRadius * Math.sin(midAngleRad);

                    // Only show label if percentage is > 3% (to avoid overlapping on very small slices)
                    const showLabel = percentage > 3;

                    return `
                        <path
                            d="${path}"
                            fill="${color}"
                            class="chart-slice ${this.options.animated ? 'chart-animated' : ''}"
                            data-label="${item.label}"
                            data-value="${item.value}"
                            data-percentage="${percentage.toFixed(1)}"
                        />
                        ${showLabel ? `
                            <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle"
                                  font-size="16" font-weight="700" fill="white"
                                  stroke="#000" stroke-width="0.3"
                                  style="pointer-events: none; paint-order: stroke;">
                                ${percentage.toFixed(1)}%
                            </text>
                        ` : ''}
                    `;
                }).join('')}

                ${isDonut ? `
                    <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" />
                    <text x="${center}" y="${center}" text-anchor="middle"
                          font-size="24" font-weight="bold" fill="#202124">
                        ${this.formatValue(total)}
                    </text>
                    <text x="${center}" y="${center + 20}" text-anchor="middle"
                          font-size="12" fill="#5f6368">
                        Gesamt
                    </text>
                ` : ''}
            </svg>
        `;
    }

    /**
     * Render progress chart
     */
    renderProgressChart() {
        if (!this.data.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        return `
            <div class="chart-progress-list">
                ${this.data.map((item, index) => {
                    const percentage = Math.min(item.value, 100);
                    const color = this.options.colors[index % this.options.colors.length];

                    return `
                        <div class="chart-progress-item">
                            <div class="chart-progress-header">
                                <span class="chart-progress-label">${this.sanitizeHTML(item.label)}</span>
                                <span class="chart-progress-value">${this.formatValue(item.value)}</span>
                            </div>
                            <div class="chart-progress-bar">
                                <div
                                    class="chart-progress-fill ${this.options.animated ? 'chart-animated' : ''}"
                                    style="width: ${percentage}%; background: ${color}"
                                ></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Render legend
     */
    renderLegend() {
        // Handle both old format (array) and new format (labels + datasets)
        let legendItems = [];

        if (Array.isArray(this.data)) {
            // Old format: array of {label, value}
            legendItems = this.data.map((item, index) => ({
                label: item.label,
                value: item.value,
                color: this.options.colors[index % this.options.colors.length]
            }));
        } else if (this.data.labels && this.data.datasets) {
            // New format: {labels, datasets} - for Pie/Donut/Bar/Line charts
            const dataset = this.data.datasets[0];
            const colors = dataset.backgroundColor || this.options.colors;

            legendItems = this.data.labels.map((label, index) => ({
                label: label,
                value: dataset.data ? dataset.data[index] : undefined,
                color: Array.isArray(colors) ? colors[index % colors.length] : colors
            }));
        }

        return `
            <div class="chart-legend">
                ${legendItems.map(item => `
                    <div class="chart-legend-item">
                        <span class="chart-legend-color" style="background: ${item.color}"></span>
                        <span class="chart-legend-label">${this.sanitizeHTML(item.label)}</span>
                        ${item.value !== undefined ? `<span class="chart-legend-value">${this.formatValue(item.value)}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Attach tooltip listeners
     */
    attachTooltipListeners() {
        const elements = this.container.querySelectorAll('[data-label][data-value]');

        elements.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, el);
            });

            el.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    /**
     * Show tooltip
     */
    showTooltip(event, element) {
        const label = element.dataset.label;
        const value = element.dataset.value;
        const percentage = element.dataset.percentage;

        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <div class="chart-tooltip-label">${this.sanitizeHTML(label)}</div>
            <div class="chart-tooltip-value">${this.formatValue(value)}</div>
            ${percentage ? `<div class="chart-tooltip-percentage">${this.sanitizeHTML(percentage)}%</div>` : ''}
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

        this.activeTooltip = tooltip;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }

    /**
     * Format value
     */
    formatValue(value) {
        const num = parseFloat(value);

        if (this.options.currency) {
            return new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
            }).format(num);
        }

        if (this.options.percentage) {
            return num.toFixed(1) + '%';
        }

        return num.toLocaleString('de-DE');
    }

    /**
     * Create arc path for pie/donut chart
     */
    createArcPath(cx, cy, radius, innerRadius, startAngle, endAngle) {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        if (innerRadius === 0) {
            return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        } else {
            const x3 = cx + innerRadius * Math.cos(endRad);
            const y3 = cy + innerRadius * Math.sin(endRad);
            const x4 = cx + innerRadius * Math.cos(startRad);
            const y4 = cy + innerRadius * Math.sin(startRad);

            return `
                M ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                L ${x3} ${y3}
                A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
                Z
            `;
        }
    }

    /**
     * Update chart data
     */
    updateData(newData) {
        this.data = newData;
        this.render();
    }

    /**
     * Export chart as PNG
     */
    async exportPNG() {
        const svg = this.container.querySelector('svg');
        if (!svg) {
            console.warn('No SVG found to export');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chart-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    /**
     * Refresh chart
     */
    refresh() {
        this.render();
    }
}

export default ChartBuilder;
