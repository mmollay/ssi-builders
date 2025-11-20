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
 * @version 1.0.0
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
            colors: config.options?.colors || [
                '#1a73e8', '#34a853', '#fbbc04', '#ea4335',
                '#9334e6', '#ff6d00', '#00acc1', '#5f6368'
            ],
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
        if (!this.data.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        const maxValue = Math.max(...this.data.map(d => d.value));
        const barWidth = 100 / this.data.length;

        return `
            <div class="chart-bars" style="height: ${this.options.height}px">
                ${this.data.map((item, index) => {
                    const height = (item.value / maxValue) * 100;
                    const color = this.options.colors[index % this.options.colors.length];

                    return `
                        <div class="chart-bar-wrapper" style="width: ${barWidth}%">
                            <div class="chart-bar-container">
                                ${this.options.showValues ? `
                                    <div class="chart-bar-value">${this.formatValue(item.value)}</div>
                                ` : ''}
                                <div
                                    class="chart-bar ${this.options.animated ? 'chart-animated' : ''}"
                                    style="height: ${height}%; background: ${color}"
                                    data-label="${item.label}"
                                    data-value="${item.value}"
                                ></div>
                            </div>
                            <div class="chart-bar-label">${item.label}</div>
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
        if (!this.data.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        const maxValue = Math.max(...this.data.map(d => d.value));
        const minValue = Math.min(...this.data.map(d => d.value));
        const range = maxValue - minValue || 1;

        const width = 800;
        const height = this.options.height;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Calculate points
        const points = this.data.map((item, index) => {
            const x = padding + (index / (this.data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;
            return { x, y, label: item.label, value: item.value };
        });

        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

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

                <!-- Line path -->
                <path d="${pathData}" fill="none" stroke="${this.options.colors[0]}"
                      stroke-width="3" class="${this.options.animated ? 'chart-line-animated' : ''}" />

                <!-- Data points -->
                ${points.map(p => `
                    <circle cx="${p.x}" cy="${p.y}" r="5" fill="${this.options.colors[0]}"
                            class="chart-point" data-label="${p.label}" data-value="${p.value}" />
                `).join('')}

                <!-- X-axis labels -->
                ${points.map(p => `
                    <text x="${p.x}" y="${height - padding + 20}" text-anchor="middle"
                          fill="#5f6368" font-size="12">${p.label}</text>
                `).join('')}
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
        if (!this.data.length) return '<p class="chart-empty">Keine Daten verfügbar</p>';

        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        const size = 300;
        const center = size / 2;
        const radius = size / 2 - 20;
        const innerRadius = isDonut ? radius * 0.6 : 0;

        let currentAngle = -90;

        return `
            <svg class="chart-svg chart-pie" viewBox="0 0 ${size} ${size}" style="max-width: ${size}px">
                ${this.data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle = endAngle;

                    const path = this.createArcPath(center, center, radius, innerRadius, startAngle, endAngle);
                    const color = this.options.colors[index % this.options.colors.length];

                    return `
                        <path
                            d="${path}"
                            fill="${color}"
                            class="chart-slice ${this.options.animated ? 'chart-animated' : ''}"
                            data-label="${item.label}"
                            data-value="${item.value}"
                            data-percentage="${percentage.toFixed(1)}"
                        />
                    `;
                }).join('')}

                ${isDonut ? `
                    <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" />
                    <text x="${center}" y="${center}" text-anchor="middle"
                          font-size="24" font-weight="bold" fill="#202124">
                        ${total}
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
                                <span class="chart-progress-label">${item.label}</span>
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
        return `
            <div class="chart-legend">
                ${this.data.map((item, index) => {
                    const color = this.options.colors[index % this.options.colors.length];
                    return `
                        <div class="chart-legend-item">
                            <span class="chart-legend-color" style="background: ${color}"></span>
                            <span class="chart-legend-label">${item.label}</span>
                            <span class="chart-legend-value">${this.formatValue(item.value)}</span>
                        </div>
                    `;
                }).join('')}
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
            <div class="chart-tooltip-label">${label}</div>
            <div class="chart-tooltip-value">${this.formatValue(value)}</div>
            ${percentage ? `<div class="chart-tooltip-percentage">${percentage}%</div>` : ''}
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
