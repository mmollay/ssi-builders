/**
 * ChangelogBuilder
 * SSI Builders v2.4.0
 *
 * A Material Design 3 changelog component for displaying version history.
 * Supports timeline, list, and compact variants with filtering and search.
 */

import { IconManager } from './IconManager.js';

export class ChangelogBuilder {
    static instanceCount = 0;

    // Category configuration
    static categories = {
        added: { label: 'Added', icon: 'add' },
        changed: { label: 'Changed', icon: 'edit' },
        fixed: { label: 'Fixed', icon: 'check' },
        removed: { label: 'Removed', icon: 'delete' },
        deprecated: { label: 'Deprecated', icon: 'warning' },
        security: { label: 'Security', icon: 'warning' }
    };

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.data - Changelog data array
     * @param {Object} config.options - Display options
     */
    constructor(config) {
        this.config = {
            containerId: null,
            title: 'Changelog',
            showTitle: true,
            data: [],
            options: {
                variant: 'timeline',     // 'timeline' | 'list' | 'compact'
                collapsible: true,
                showFilter: true,
                showSearch: true,
                showSummary: true,
                maxVisible: 5,
                expandFirst: true,
                fullWidth: false,
                dateFormat: 'long'       // 'long' | 'short' | 'relative'
            },
            onVersionClick: null,
            onFilterChange: null,
            ...config
        };

        this.instanceId = ++ChangelogBuilder.instanceCount;
        this.container = null;
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.expandedVersions = new Set();
        this.visibleCount = this.config.options.maxVisible;

        this.init();
    }

    init() {
        this.container = document.getElementById(this.config.containerId);
        if (!this.container) {
            console.error(`ChangelogBuilder: Container #${this.config.containerId} not found`);
            return;
        }

        // Expand first version by default
        if (this.config.options.expandFirst && this.config.data.length > 0) {
            this.expandedVersions.add(this.config.data[0].version);
        }

        this.render();
        this.bindEvents();
    }

    render() {
        const { variant, fullWidth } = this.config.options;
        const filteredData = this.getFilteredData();

        this.container.innerHTML = `
            <div class="changelog changelog--${variant}${fullWidth ? ' changelog--full-width' : ''}"
                 data-instance="${this.instanceId}">
                ${this.renderHeader()}
                ${filteredData.length > 0 ? this.renderVersions(filteredData) : this.renderEmpty()}
            </div>
        `;
    }

    renderHeader() {
        const { showTitle, title, options } = this.config;
        const { showFilter, showSearch } = options;

        if (!showTitle && !showFilter && !showSearch) return '';

        return `
            <div class="changelog__header">
                ${showTitle ? `
                    <h2 class="changelog__title">
                        <span class="changelog__title-icon">${IconManager.getIcon('history')}</span>
                        ${title}
                    </h2>
                ` : ''}

                ${showSearch ? `
                    <div class="changelog__search">
                        <span class="changelog__search-icon">${IconManager.getIcon('search')}</span>
                        <input type="text"
                               class="changelog__search-input"
                               placeholder="Search changes..."
                               value="${this.searchQuery}">
                    </div>
                ` : ''}

                ${showFilter ? this.renderFilter() : ''}
            </div>
        `;
    }

    renderFilter() {
        const categories = ['all', ...Object.keys(ChangelogBuilder.categories)];

        return `
            <div class="changelog__filter">
                ${categories.map(cat => `
                    <button class="changelog__filter-btn${this.activeFilter === cat ? ' changelog__filter-btn--active' : ''}"
                            data-filter="${cat}">
                        ${cat !== 'all' ? `<span class="changelog__filter-dot changelog__filter-dot--${cat}"></span>` : ''}
                        ${cat === 'all' ? 'All' : ChangelogBuilder.categories[cat].label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderVersions(data) {
        const visibleData = data.slice(0, this.visibleCount);
        const hasMore = data.length > this.visibleCount;

        return `
            <div class="changelog__versions">
                ${visibleData.map(version => this.renderVersion(version)).join('')}
            </div>
            ${hasMore ? this.renderShowMore(data.length - this.visibleCount) : ''}
        `;
    }

    renderVersion(version) {
        const isExpanded = this.expandedVersions.has(version.version);
        const isHighlight = version.highlight;
        const filteredChanges = this.filterChanges(version.changes);

        if (filteredChanges.length === 0 && this.activeFilter !== 'all') {
            return '';
        }

        const summary = this.getVersionSummary(version.changes);
        const { collapsible, showSummary } = this.config.options;

        return `
            <div class="changelog__version${isHighlight ? ' changelog__version--highlight' : ''}${isExpanded ? ' changelog__version--expanded' : ' changelog__version--collapsed'}"
                 data-version="${version.version}">
                <div class="changelog__version-header">
                    <span class="changelog__version-badge">v${version.version}</span>
                    ${isHighlight ? '<span class="changelog__new-badge">NEW</span>' : ''}
                    <span class="changelog__version-date">${this.formatDate(version.date)}</span>

                    ${showSummary ? `
                        <div class="changelog__version-summary">
                            ${Object.entries(summary).map(([type, count]) => count > 0 ? `
                                <span class="changelog__version-count changelog__version-count--${type}">
                                    ${count}
                                </span>
                            ` : '').join('')}
                        </div>
                    ` : ''}

                    ${collapsible ? `
                        <span class="changelog__version-toggle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </span>
                    ` : ''}
                </div>

                <div class="changelog__changes">
                    ${this.renderChanges(filteredChanges)}
                </div>
            </div>
        `;
    }

    renderChanges(changes) {
        // Group by category
        const grouped = {};
        changes.forEach(change => {
            const type = change.type || 'changed';
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(change);
        });

        return Object.entries(grouped).map(([type, items]) => `
            <div class="changelog__category">
                <div class="changelog__category-title changelog__category-title--${type}">
                    <span class="changelog__category-icon">
                        ${IconManager.getIcon(ChangelogBuilder.categories[type]?.icon || 'info')}
                    </span>
                    ${ChangelogBuilder.categories[type]?.label || type}
                </div>
                <ul class="changelog__items">
                    ${items.map(item => `
                        <li class="changelog__item changelog__item--${type}">
                            ${this.highlightSearch(item.text)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    renderShowMore(remaining) {
        return `
            <div class="changelog__show-more">
                <button class="changelog__show-more-btn" data-action="show-more">
                    Show ${remaining} more version${remaining > 1 ? 's' : ''}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
            </div>
        `;
    }

    renderEmpty() {
        return `
            <div class="changelog__empty">
                <div class="changelog__empty-icon">${IconManager.getIcon('search')}</div>
                <p class="changelog__empty-text">No changes found</p>
            </div>
        `;
    }

    bindEvents() {
        // Filter buttons
        this.container.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.changelog__filter-btn');
            if (filterBtn) {
                this.activeFilter = filterBtn.dataset.filter;
                this.render();
                this.bindEvents();
                this.config.onFilterChange?.(this.activeFilter);
                return;
            }

            // Version header click (toggle)
            const versionHeader = e.target.closest('.changelog__version-header');
            if (versionHeader && this.config.options.collapsible) {
                const version = versionHeader.closest('.changelog__version');
                const versionId = version.dataset.version;

                if (this.expandedVersions.has(versionId)) {
                    this.expandedVersions.delete(versionId);
                } else {
                    this.expandedVersions.add(versionId);
                }

                version.classList.toggle('changelog__version--expanded');
                version.classList.toggle('changelog__version--collapsed');

                this.config.onVersionClick?.(versionId);
                return;
            }

            // Show more button
            const showMoreBtn = e.target.closest('[data-action="show-more"]');
            if (showMoreBtn) {
                this.visibleCount = this.config.data.length;
                this.render();
                this.bindEvents();
                return;
            }
        });

        // Search input
        const searchInput = this.container.querySelector('.changelog__search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchQuery = e.target.value.toLowerCase();
                    this.render();
                    this.bindEvents();
                    // Restore focus to search
                    const newInput = this.container.querySelector('.changelog__search-input');
                    if (newInput) {
                        newInput.focus();
                        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
                    }
                }, 300);
            });
        }
    }

    // Helper methods
    getFilteredData() {
        let data = [...this.config.data];

        // Filter by category
        if (this.activeFilter !== 'all') {
            data = data.filter(version =>
                version.changes.some(change => change.type === this.activeFilter)
            );
        }

        // Filter by search
        if (this.searchQuery) {
            data = data.filter(version =>
                version.changes.some(change =>
                    change.text.toLowerCase().includes(this.searchQuery)
                )
            );
        }

        return data;
    }

    filterChanges(changes) {
        let filtered = changes;

        if (this.activeFilter !== 'all') {
            filtered = filtered.filter(c => c.type === this.activeFilter);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(c =>
                c.text.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    }

    getVersionSummary(changes) {
        const summary = {};
        Object.keys(ChangelogBuilder.categories).forEach(cat => summary[cat] = 0);

        changes.forEach(change => {
            const type = change.type || 'changed';
            if (summary[type] !== undefined) {
                summary[type]++;
            }
        });

        return summary;
    }

    highlightSearch(text) {
        if (!this.searchQuery) return text;

        const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
        return text.replace(regex, '<span class="changelog__item-highlight">$1</span>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const { dateFormat } = this.config.options;

        if (dateFormat === 'relative') {
            return this.getRelativeDate(date);
        }

        const options = dateFormat === 'short'
            ? { month: 'short', day: 'numeric', year: 'numeric' }
            : { month: 'long', day: 'numeric', year: 'numeric' };

        return date.toLocaleDateString('en-US', options);
    }

    getRelativeDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    }

    // Public API
    setFilter(filter) {
        this.activeFilter = filter;
        this.render();
        this.bindEvents();
    }

    search(query) {
        this.searchQuery = query.toLowerCase();
        this.render();
        this.bindEvents();
    }

    expandAll() {
        this.config.data.forEach(v => this.expandedVersions.add(v.version));
        this.render();
        this.bindEvents();
    }

    collapseAll() {
        this.expandedVersions.clear();
        this.render();
        this.bindEvents();
    }

    setData(data) {
        this.config.data = data;
        this.render();
        this.bindEvents();
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
