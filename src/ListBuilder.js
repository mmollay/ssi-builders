/**
 * ListBuilder.js - Modern, Reusable List/Table Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Advanced search (debounced, multi-field)
 * - Multi-criteria filtering
 * - Sortable columns
 * - Pagination
 * - Row selection & bulk actions
 * - Column visibility toggles
 * - Responsive (card view on mobile, table on desktop)
 * - Loading/Empty/Error states
 * - Full accessibility
 * - Real-time updates (WebSocket/Supabase Realtime)
 * - Incremental data updates with animations
 *
 * @version 2.10.0
 */

import { BaseBuilder } from './BaseBuilder.js';
import { IconManager } from './IconManager.js';
import { i18n } from './i18n.js';

export class ListBuilder extends BaseBuilder {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - ID of the container element
     * @param {Array} config.columns - Column definitions
     * @param {Function} config.dataSource - Async function that returns data
     * @param {Object} config.actions - Action button definitions
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        super(config, {
            searchable: true,
            sortable: true,
            selectable: true,
            paginated: true,
            paginationType: 'standard',  // 'standard' | 'infinite' | 'loadmore'
            pageSize: 50,
            serverSide: false,           // Server-side pagination/filtering/sorting
            filters: [],
            emptyMessage: null,          // Uses i18n.t('list.empty') as default
            loadingMessage: null,        // Uses i18n.t('list.loading') as default
            mobileBreakpoint: 768,
            enableColumnToggle: true,
            tableStyle: {                // Table styling options
                striped: false,
                bordered: false,
                compact: false,
                hoverable: true,
                celled: false
            },
            variant: 'default'           // 'default' | 'frameless' | 'lines-only' | 'elegant' | 'minimal' | 'glass'
        });

        this.columns = config.columns || [];
        this.dataSource = config.dataSource;
        this.actions = config.actions || {};

        // Internal state - support both static data and dataSource
        this.data = config.data || [];
        this.filteredData = [];
        this.selectedRows = new Set();
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.activeFilters = {};
        this.hiddenColumns = new Set();
        this.isLoading = false;
        
        // Server-side pagination state
        this.totalCount = 0;           // Total items on server
        this.loadedData = [];          // For infinite/loadmore modes
        this.hasMore = true;           // More data available

        // Debounce timers
        this.searchDebounce = null;
        
        // Intersection Observer for infinite scroll
        this.scrollObserver = null;

        // Real-time mode configuration
        this.realtimeMode = null;
        this.webSocketConnection = null;
        this.supabaseSubscription = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize the ListBuilder
     */
    async init() {
        if (!super.init()) return;

        // Load hidden columns from localStorage
        const savedHidden = localStorage.getItem(`listBuilder_${this.containerId}_hiddenColumns`);
        if (savedHidden) {
            this.hiddenColumns = new Set(JSON.parse(savedHidden));
        }

        this.render();
        await this.loadData();
    }

    /**
     * Main render function
     */
    render() {
        const variantClass = this.options.variant && this.options.variant !== 'default'
            ? `list-builder-${this.options.variant}`
            : '';

        this.container.innerHTML = `
            <div class="list-builder ${variantClass}">
                ${this.renderToolbar()}
                <div class="list-builder-content">
                    ${this.renderTable()}
                </div>
                ${this.options.paginated ? this.renderPagination() : ''}
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Render toolbar with search, filters, actions
     */
    renderToolbar() {
        return `
            <div class="list-toolbar">
                <div class="list-toolbar-left">
                    ${this.options.searchable ? `
                        <div class="list-search">
                            <input
                                type="text"
                                class="list-search-input"
                                placeholder="${i18n.t('list.search')}"
                                id="${this.containerId}_search"
                                value="${this.searchTerm}"
                            />
                        </div>
                    ` : ''}

                    ${this.options.filters.length > 0 ? `
                        <div class="list-filters">
                            ${this.options.filters.map(filter => this.renderFilter(filter)).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="list-toolbar-right">
                    ${this.options.enableColumnToggle ? `
                        <button class="ssi-btn ssi-btn-outlined ssi-btn-sm" id="${this.containerId}_columnToggle">
                            ${IconManager.getIcon('columns')} ${i18n.t('list.columns')}
                        </button>
                    ` : ''}

                    ${this.renderActions()}

                    ${this.options.selectable && this.selectedRows.size > 0 ? `
                        <button class="ssi-btn ssi-btn-danger ssi-btn-sm" id="${this.containerId}_bulkDelete">
                            ${IconManager.getIcon('delete')} ${i18n.t('list.deleteSelected', { count: this.selectedRows.size })}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render filter dropdown
     */
    renderFilter(filter) {
        const currentValue = this.activeFilters[filter.key] || '';
        return `
            <select
                class="list-filter-select"
                id="${this.containerId}_filter_${filter.key}"
                data-filter-key="${filter.key}"
            >
                <option value="">${filter.label}: ${i18n.t('list.all')}</option>
                ${filter.options.map(opt => `
                    <option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('')}
            </select>
        `;
    }

    /**
     * Render action buttons
     */
    renderActions() {
        if (!this.actions.toolbar) return '';

        return this.actions.toolbar.map(action => `
            <button
                class="ssi-btn ssi-btn-${action.type === 'primary' ? 'primary' : 'outlined'} ssi-btn-sm"
                id="${this.containerId}_action_${action.key}"
                data-action-key="${action.key}"
            >
                ${action.icon ? action.icon : ''} ${action.label}
            </button>
        `).join('');
    }

    /**
     * Render table
     */
    renderTable() {
        if (this.isLoading) {
            return `
                <div class="list-loading">
                    <div class="list-spinner"></div>
                    <p>${this.options.loadingMessage || i18n.t('list.loading')}</p>
                </div>
            `;
        }

        if (this.filteredData.length === 0) {
            return `
                <div class="list-empty">
                    <div class="list-empty-icon">${IconManager.getIcon('inbox')}</div>
                    <p>${this.options.emptyMessage || i18n.t('list.empty')}</p>
                    ${this.searchTerm || Object.keys(this.activeFilters).length > 0 ? `
                        <button class="ssi-btn ssi-btn-outlined ssi-btn-sm" id="${this.containerId}_clearFilters">
                            ${i18n.t('list.clearFilters')}
                        </button>
                    ` : ''}
                </div>
            `;
        }

        // Check if mobile
        const isMobile = window.innerWidth < this.options.mobileBreakpoint;

        return isMobile ? this.renderCards() : this.renderTableView();
    }

    /**
     * Render desktop table view
     */
    renderTableView() {
        const visibleColumns = this.columns.filter(col => !this.hiddenColumns.has(col.key));
        const paginatedData = this.getPaginatedData();
        
        // Build table CSS classes based on tableStyle options
        const tableClasses = ['list-table'];
        if (this.options.tableStyle.striped) tableClasses.push('list-table-striped');
        if (this.options.tableStyle.bordered) tableClasses.push('list-table-bordered');
        if (this.options.tableStyle.compact) tableClasses.push('list-table-compact');
        if (this.options.tableStyle.hoverable) tableClasses.push('list-table-hoverable');
        if (this.options.tableStyle.celled) tableClasses.push('list-table-celled');

        return `
            <div class="list-table-wrapper">
                <table class="${tableClasses.join(' ')}">
                    <thead>
                        <tr>
                            ${this.options.selectable ? `
                                <th class="list-table-checkbox">
                                    <input
                                        type="checkbox"
                                        id="${this.containerId}_selectAll"
                                        ${this.isAllSelected() ? 'checked' : ''}
                                    />
                                </th>
                            ` : ''}
                            ${visibleColumns.map(col => `
                                <th
                                    class="${this.options.sortable && col.sortable !== false ? 'list-table-sortable' : ''}"
                                    data-column-key="${col.key}"
                                    style="${col.width ? `width: ${col.width}` : ''}"
                                >
                                    <div class="list-table-header">
                                        <span>${col.label}</span>
                                        ${this.options.sortable && col.sortable !== false ? `
                                            <span class="list-sort-icon">
                                                ${this.sortColumn === col.key ?
                    (this.sortDirection === 'asc' ? '▲' : '▼')
                    : '⇅'}
                                            </span>
                                        ` : ''}
                                    </div>
                                </th>
                            `).join('')}
                            ${this.actions.row ? '<th class="list-table-actions">Aktionen</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedData.map((row, index) => this.renderTableRow(row, index, visibleColumns)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render table row
     */
    renderTableRow(row, index, visibleColumns) {
        const rowId = this.getRowId(row);
        const isSelected = this.selectedRows.has(rowId);

        return `
            <tr class="${isSelected ? 'list-row-selected' : ''}" data-row-id="${rowId}">
                ${this.options.selectable ? `
                    <td class="list-table-checkbox">
                        <input
                            type="checkbox"
                            class="list-row-checkbox"
                            data-row-id="${rowId}"
                            ${isSelected ? 'checked' : ''}
                        />
                    </td>
                ` : ''}
                ${visibleColumns.map(col => `
                    <td>
                        ${this.renderCell(row, col)}
                    </td>
                `).join('')}
                ${this.actions.row ? `
                    <td class="list-table-actions">
                        ${this.renderRowActions(row)}
                    </td>
                ` : ''}
            </tr>
        `;
    }

    /**
     * Render cell content
     */
    renderCell(row, column) {
        const value = this.getNestedValue(row, column.key);

        // Custom renderer
        if (column.render) {
            return column.render(value, row);
        }

        // Default renderers by type
        if (column.type === 'badge') {
            return `<span class="list-badge list-badge-${column.badgeClass?.(value) || 'default'}">${value}</span>`;
        }

        if (column.type === 'date') {
            return value ? new Date(value).toLocaleDateString('de-DE') : '-';
        }

        if (column.type === 'array') {
            return Array.isArray(value) ? value.join(', ') : '-';
        }

        if (column.type === 'tags') {
            return Array.isArray(value) ?
                value.map(tag => `<span class="list-tag">${tag}</span>`).join('')
                : '-';
        }

        return value ?? '-';
    }

    /**
     * Render row actions
     */
    renderRowActions(row) {
        if (!this.actions.row) return '';

        return this.actions.row.map(action => {
            const displayType = action.displayType || 'icon'; // Default: icon
            const buttonClass = action.buttonType || 'secondary';

            // Determine what to render based on displayType
            let content = '';
            let cssClass = '';

            // Helper: Render icon (supports SVG and emoji)
            const renderIcon = (iconContent) => {
                if (!iconContent) return '⚙️'; // Default fallback

                // If it's an SVG string or HTML, render as-is
                if (iconContent.includes('<svg') || iconContent.includes('<i ')) {
                    return iconContent;
                }

                // Otherwise treat as emoji/text
                return iconContent;
            };

            switch (displayType) {
                case 'emoji':
                    // Emoji only, compact
                    content = action.emoji || action.icon || '⚙️';
                    cssClass = `ssi-btn ssi-btn-icon ssi-btn-text ssi-btn-sm list-action-btn`;
                    break;

                case 'button':
                    // Full button with label only (no icon)
                    content = action.label;
                    cssClass = `ssi-btn ssi-btn-${buttonClass} list-action-btn list-action-btn-full`;
                    break;

                case 'button-icon':
                    // Full button with icon + label
                    const iconHtml = action.icon ? renderIcon(action.icon) : '';
                    content = `${iconHtml}${action.label}`;
                    cssClass = `ssi-btn ssi-btn-${buttonClass} list-action-btn list-action-btn-full list-action-btn-with-icon`;
                    break;

                case 'icon':
                default:
                    // Icon only, compact (default) - supports both SVG and emoji
                    content = renderIcon(action.icon);
                    cssClass = `ssi-btn ssi-btn-icon ssi-btn-text ssi-btn-sm list-action-btn`;
                    break;
            }

            return `
                <button
                    class="${cssClass}"
                    data-action-key="${action.key}"
                    data-row-id="${this.getRowId(row)}"
                    title="${action.label}"
                    aria-label="${action.label}"
                >
                    ${content}
                </button>
            `;
        }).join('');
    }

    /**
     * Render mobile card view
     */
    renderCards() {
        const paginatedData = this.getPaginatedData();

        return `
            <div class="list-cards">
                ${paginatedData.map(row => this.renderCard(row)).join('')}
            </div>
        `;
    }

    /**
     * Render single card
     */
    renderCard(row) {
        const rowId = this.getRowId(row);
        const isSelected = this.selectedRows.has(rowId);

        return `
            <div class="list-card ${isSelected ? 'list-card-selected' : ''}" data-row-id="${rowId}">
                ${this.options.selectable ? `
                    <div class="list-card-checkbox">
                        <input
                            type="checkbox"
                            class="list-row-checkbox"
                            data-row-id="${rowId}"
                            ${isSelected ? 'checked' : ''}
                        />
                    </div>
                ` : ''}

                <div class="list-card-content">
                    ${this.columns.filter(col => !col.hideInCard).map(col => `
                        <div class="list-card-field">
                            <div class="list-card-label">${col.label}</div>
                            <div class="list-card-value">${this.renderCell(row, col)}</div>
                        </div>
                    `).join('')}
                </div>

                ${this.actions.row ? `
                    <div class="list-card-actions">
                        ${this.renderRowActions(row)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render pagination
     */
    renderPagination() {
        // Use totalCount for server-side, filteredData.length for client-side
        const totalItems = this.options.serverSide ? this.totalCount : this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.options.pageSize);
        if (totalPages <= 1) return '';

        const pages = this.getPaginationPages(totalPages);

        return `
            <div class="list-pagination">
                <div class="list-pagination-info">
                    Zeige ${(this.currentPage - 1) * this.options.pageSize + 1}
                    - ${Math.min(this.currentPage * this.options.pageSize, totalItems)}
                    von ${totalItems}
                </div>
                <div class="list-pagination-controls">
                    <button
                        class="list-pagination-btn"
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        data-page="prev"
                    >‹</button>

                    ${pages.map(page => {
            if (page === '...') {
                return '<span class="list-pagination-ellipsis">...</span>';
            }
            return `
                            <button
                                class="list-pagination-btn ${page === this.currentPage ? 'active' : ''}"
                                data-page="${page}"
                            >${page}</button>
                        `;
        }).join('')}

                    <button
                        class="list-pagination-btn"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        data-page="next"
                    >›</button>
                </div>
            </div>
        `;
    }

    /**
     * Get pagination page numbers (with ellipsis)
     */
    getPaginationPages(totalPages) {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - delta && i <= this.currentPage + delta)) {
                range.push(i);
            }
        }

        let prev = 0;
        for (const i of range) {
            if (prev + 1 !== i) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            prev = i;
        }

        return rangeWithDots;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search
        if (this.options.searchable) {
            const searchInput = document.getElementById(`${this.containerId}_search`);
            searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filters
        this.options.filters.forEach(filter => {
            const select = document.getElementById(`${this.containerId}_filter_${filter.key}`);
            select?.addEventListener('change', (e) => this.handleFilterChange(filter.key, e.target.value));
        });

        // Column toggle
        const columnToggleBtn = document.getElementById(`${this.containerId}_columnToggle`);
        columnToggleBtn?.addEventListener('click', () => this.showColumnToggleModal());

        // Clear filters
        const clearBtn = document.getElementById(`${this.containerId}_clearFilters`);
        clearBtn?.addEventListener('click', () => this.clearFilters());

        // Select all
        const selectAllCheckbox = document.getElementById(`${this.containerId}_selectAll`);
        selectAllCheckbox?.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));

        // Row checkboxes
        document.querySelectorAll('.list-row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const rowId = e.target.dataset.rowId;
                this.toggleRowSelection(rowId, e.target.checked);
            });
        });

        // Sort columns
        document.querySelectorAll('.list-table-sortable').forEach(th => {
            th.addEventListener('click', () => {
                const columnKey = th.dataset.columnKey;
                this.handleSort(columnKey);
            });
        });

        // Toolbar actions
        if (this.actions.toolbar) {
            this.actions.toolbar.forEach(action => {
                const btn = document.getElementById(`${this.containerId}_action_${action.key}`);
                btn?.addEventListener('click', () => action.handler?.());
            });
        }

        // Row actions
        document.querySelectorAll('.list-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionKey = e.currentTarget.dataset.actionKey;
                const rowId = e.currentTarget.dataset.rowId;
                const action = this.actions.row?.find(a => a.key === actionKey);
                // Convert rowId to match the type of the actual row ID (number or string)
                const row = this.data.find(r => String(this.getRowId(r)) === rowId);
                action?.handler?.(row, rowId);
            });
        });

        // Pagination
        document.querySelectorAll('.list-pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.handlePageChange(page);
            });
        });

        // Responsive resize
        window.addEventListener('resize', this.debounce(() => {
            this.updateTableContent();
        }, 300));
    }

    /**
     * Load data from data source
     */
    async loadData() {
        this.isLoading = true;
        this.updateTableContent();

        try {
            let result;
            
            // Check if server-side mode
            if (this.options.serverSide) {
                // Pass parameters to dataSource for server-side processing
                const params = {
                    page: this.currentPage,
                    pageSize: this.options.pageSize,
                    search: this.searchTerm,
                    filters: this.activeFilters,
                    sort: this.sortColumn ? {
                        column: this.sortColumn,
                        direction: this.sortDirection
                    } : null
                };
                
                result = await this.dataSource(params);
                
                // Handle response format
                if (result && typeof result === 'object' && 'items' in result) {
                    // Server-side format: { items: [...], totalCount: 100 }
                    this.data = result.items || [];
                    this.totalCount = result.totalCount || result.items.length;
                    this.filteredData = this.data; // No client-side filtering needed
                } else {
                    // Fallback: assume array was returned
                    this.data = Array.isArray(result) ? result : [];
                    this.totalCount = this.data.length;
                    this.filteredData = this.data;
                }
            } else {
                // Client-side mode: load all data
                if (this.dataSource && typeof this.dataSource === 'function') {
                    result = await this.dataSource();

                    // Handle both formats
                    if (result && typeof result === 'object' && 'items' in result) {
                        this.data = result.items || [];
                    } else {
                        this.data = Array.isArray(result) ? result : [];
                    }
                }
                // else: this.data was already set in constructor

                // Apply client-side filtering
                this.applyFilters();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = [];
            this.filteredData = [];
            this.totalCount = 0;
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    /**
     * Apply all filters and search
     */
    applyFilters() {
        let filtered = [...this.data];

        // Apply search
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(row => {
                return this.columns.some(col => {
                    const value = this.getNestedValue(row, col.key);
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(searchLower);
                });
            });
        }

        // Apply filters
        Object.entries(this.activeFilters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(row => {
                    const rowValue = this.getNestedValue(row, key);
                    return rowValue === value;
                });
            }
        });

        // Apply sorting
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                const aVal = this.getNestedValue(a, this.sortColumn);
                const bVal = this.getNestedValue(b, this.sortColumn);

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                return this.sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        this.filteredData = filtered;
        this.currentPage = 1; // Reset to first page
    }

    /**
     * Get paginated data
     */
    getPaginatedData() {
        if (!this.options.paginated) return this.filteredData;

        const start = (this.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        return this.filteredData.slice(start, end);
    }

    /**
     * Handle search
     */
    handleSearch(value) {
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(async () => {
            this.searchTerm = value;
            this.currentPage = 1; // Reset to first page on search
            if (this.options.serverSide) {
                await this.loadData();
            } else {
                this.applyFilters();
                this.updateTableContent();
            }
        }, 300);
    }

    /**
     * Handle filter change
     */
    async handleFilterChange(key, value) {
        if (value) {
            this.activeFilters[key] = value;
        } else {
            delete this.activeFilters[key];
        }
        this.currentPage = 1; // Reset to first page on filter
        if (this.options.serverSide) {
            await this.loadData();
        } else {
            this.applyFilters();
            this.render();
        }
    }

    /**
     * Handle sort
     */
    async handleSort(columnKey) {
        if (this.sortColumn === columnKey) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnKey;
            this.sortDirection = 'asc';
        }
        if (this.options.serverSide) {
            await this.loadData();
        } else {
            this.applyFilters();
            this.updateTableContent();
        }
    }

    /**
     * Handle page change
     */
    async handlePageChange(page) {
        // Use totalCount for server-side, filteredData.length for client-side
        const totalItems = this.options.serverSide ? this.totalCount : this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.options.pageSize);

        if (page === 'prev') {
            this.currentPage = Math.max(1, this.currentPage - 1);
        } else if (page === 'next') {
            this.currentPage = Math.min(totalPages, this.currentPage + 1);
        } else {
            this.currentPage = parseInt(page);
        }

        if (this.options.serverSide) {
            await this.loadData();
        } else {
            this.updateTableContent();
        }
        this.container.querySelector('.list-table-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Handle select all
     */
    handleSelectAll(checked) {
        const paginatedData = this.getPaginatedData();
        paginatedData.forEach(row => {
            const rowId = this.getRowId(row);
            if (checked) {
                this.selectedRows.add(rowId);
            } else {
                this.selectedRows.delete(rowId);
            }
        });
        this.render();
    }

    /**
     * Toggle row selection
     */
    toggleRowSelection(rowId, checked) {
        if (checked) {
            this.selectedRows.add(rowId);
        } else {
            this.selectedRows.delete(rowId);
        }
        this.render();
    }

    /**
     * Check if all visible rows are selected
     */
    isAllSelected() {
        const paginatedData = this.getPaginatedData();
        if (paginatedData.length === 0) return false;
        return paginatedData.every(row => this.selectedRows.has(this.getRowId(row)));
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchTerm = '';
        this.activeFilters = {};
        this.applyFilters();
        this.render();
    }

    /**
     * Show column toggle modal
     */
    showColumnToggleModal() {
        const modalHtml = `
            <div class="list-modal" id="${this.containerId}_columnModal">
                <div class="list-modal-content">
                    <div class="list-modal-header">
                        <h3>${i18n.t('list.columns')}</h3>
                        <button class="list-modal-close">&times;</button>
                    </div>
                    <div class="list-modal-body">
                        ${this.columns.map(col => `
                            <label class="list-checkbox-label">
                                <input
                                    type="checkbox"
                                    ${!this.hiddenColumns.has(col.key) ? 'checked' : ''}
                                    data-column-key="${col.key}"
                                />
                                ${col.label}
                            </label>
                        `).join('')}
                    </div>
                    <div class="list-modal-footer">
                        <button class="ssi-btn ssi-btn-outlined" id="${this.containerId}_cancelColumns">${i18n.t('actions.cancel')}</button>
                        <button class="ssi-btn ssi-btn-primary" id="${this.containerId}_applyColumns">${i18n.t('filterBar.apply')}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById(`${this.containerId}_columnModal`);
        const closeBtn = modal.querySelector('.list-modal-close');
        const cancelBtn = document.getElementById(`${this.containerId}_cancelColumns`);
        const applyBtn = document.getElementById(`${this.containerId}_applyColumns`);

        const closeModal = () => modal.remove();

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        applyBtn.addEventListener('click', () => {
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
            this.hiddenColumns.clear();
            checkboxes.forEach(cb => {
                if (!cb.checked) {
                    this.hiddenColumns.add(cb.dataset.columnKey);
                }
            });
            localStorage.setItem(`listBuilder_${this.containerId}_hiddenColumns`, JSON.stringify([...this.hiddenColumns]));
            this.updateTableContent();
            closeModal();
        });
    }

    /**
     * Update only table content (without full re-render)
     */
    updateTableContent() {
        const contentDiv = this.container.querySelector('.list-builder-content');
        if (contentDiv) {
            contentDiv.innerHTML = this.renderTable();
            this.attachEventListeners();
        }

        // Update toolbar if selections changed
        const toolbar = this.container.querySelector('.list-toolbar');
        if (toolbar) {
            toolbar.outerHTML = this.renderToolbar();
            this.attachEventListeners();
        }

        // Update pagination
        if (this.options.paginated) {
            const paginationDiv = this.container.querySelector('.list-pagination');
            if (paginationDiv) {
                paginationDiv.outerHTML = this.renderPagination();
                this.attachEventListeners();
            }
        }
    }

    /**
     * Refresh data
     */
    async refresh() {
        await this.loadData();
    }

    /**
     * Get selected rows
     */
    getSelectedRows() {
        return this.data.filter(row => this.selectedRows.has(this.getRowId(row)));
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedRows.clear();
        this.render();
    }

    /**
     * Helper: Get row ID
     */
    getRowId(row) {
        return row.id || row.uuid || JSON.stringify(row);
    }

    /**
     * Helper: Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    // ========================================
    // REAL-TIME UPDATE METHODS (v2.10.0)
    // ========================================

    /**
     * Configure real-time mode for live updates
     * Similar to ChartBuilder's setRealtimeMode
     * @param {Object} config - Real-time configuration
     * @param {number} config.maxRows - Maximum rows before removing oldest (sliding window)
     * @param {number} config.animationDuration - Animation duration in ms (default: 300)
     * @param {string} config.insertPosition - 'top' or 'bottom' (default: 'top')
     * @param {Function} config.onInsert - Callback when row is inserted
     * @param {Function} config.onUpdate - Callback when row is updated
     * @param {Function} config.onRemove - Callback when row is removed
     * @since 2.10.0
     */
    setRealtimeMode(config = {}) {
        this.realtimeMode = {
            maxRows: config.maxRows || null,
            animationDuration: config.animationDuration || 300,
            insertPosition: config.insertPosition || 'top',
            onInsert: config.onInsert || null,
            onUpdate: config.onUpdate || null,
            onRemove: config.onRemove || null
        };
        return this;
    }

    /**
     * Prepend new data to the top of the list with fade-in animation
     * Does NOT reload the entire table - only adds new rows
     * @param {Array|Object} items - Single item or array of items to prepend
     * @param {Object} options - Animation options
     * @param {boolean} options.animate - Enable animation (default: true)
     * @param {number} options.duration - Animation duration in ms (default: 300)
     * @param {boolean} options.highlight - Highlight new rows briefly (default: true)
     * @since 2.10.0
     */
    prependData(items, options = {}) {
        const itemsArray = Array.isArray(items) ? items : [items];
        const animate = options.animate !== false;
        const duration = options.duration || this.realtimeMode?.animationDuration || 300;
        const highlight = options.highlight !== false;

        // Add to internal data at the beginning
        this.data = [...itemsArray, ...this.data];

        // Apply maxRows sliding window if configured
        if (this.realtimeMode?.maxRows && this.data.length > this.realtimeMode.maxRows) {
            const removeCount = this.data.length - this.realtimeMode.maxRows;
            const removedItems = this.data.splice(-removeCount, removeCount);

            // Animate removal of oldest rows
            removedItems.forEach(item => {
                this._animateRowRemoval(this.getRowId(item), duration);
            });
        }

        // Re-apply filters to update filteredData
        this.applyFilters();

        // Insert rows into DOM without full re-render
        this._insertRowsIntoDOM(itemsArray, 'top', animate, duration, highlight);

        // Trigger callback
        if (this.realtimeMode?.onInsert) {
            this.realtimeMode.onInsert(itemsArray);
        }

        return this;
    }

    /**
     * Append new data to the bottom of the list with fade-in animation
     * @param {Array|Object} items - Single item or array of items to append
     * @param {Object} options - Animation options
     * @since 2.10.0
     */
    appendData(items, options = {}) {
        const itemsArray = Array.isArray(items) ? items : [items];
        const animate = options.animate !== false;
        const duration = options.duration || this.realtimeMode?.animationDuration || 300;
        const highlight = options.highlight !== false;

        // Add to internal data at the end
        this.data = [...this.data, ...itemsArray];

        // Apply maxRows sliding window if configured
        if (this.realtimeMode?.maxRows && this.data.length > this.realtimeMode.maxRows) {
            const removeCount = this.data.length - this.realtimeMode.maxRows;
            const removedItems = this.data.splice(0, removeCount);

            // Animate removal of oldest rows (from top)
            removedItems.forEach(item => {
                this._animateRowRemoval(this.getRowId(item), duration);
            });
        }

        // Re-apply filters
        this.applyFilters();

        // Insert rows into DOM
        this._insertRowsIntoDOM(itemsArray, 'bottom', animate, duration, highlight);

        // Trigger callback
        if (this.realtimeMode?.onInsert) {
            this.realtimeMode.onInsert(itemsArray);
        }

        return this;
    }

    /**
     * Push a single data item (simplified real-time method)
     * Uses insertPosition from realtimeMode config
     * @param {Object} item - Single item to add
     * @since 2.10.0
     */
    pushData(item) {
        const position = this.realtimeMode?.insertPosition || 'top';
        if (position === 'top') {
            return this.prependData(item);
        } else {
            return this.appendData(item);
        }
    }

    /**
     * Update a specific row with new data (with highlight animation)
     * @param {string|number} id - Row ID to update
     * @param {Object} newData - New data for the row
     * @param {Object} options - Animation options
     * @since 2.10.0
     */
    updateRow(id, newData, options = {}) {
        const duration = options.duration || this.realtimeMode?.animationDuration || 300;
        const highlight = options.highlight !== false;

        // Find and update in data array
        const index = this.data.findIndex(row => String(this.getRowId(row)) === String(id));
        if (index === -1) {
            console.warn(`ListBuilder: Row with ID "${id}" not found`);
            return this;
        }

        // Merge new data
        this.data[index] = { ...this.data[index], ...newData };

        // Re-apply filters
        this.applyFilters();

        // Update DOM element
        const rowEl = this.container.querySelector(`tr[data-row-id="${id}"], .list-card[data-row-id="${id}"]`);
        if (rowEl) {
            // Re-render the row content
            const visibleColumns = this.columns.filter(col => !this.hiddenColumns.has(col.key));
            const isMobile = window.innerWidth < this.options.mobileBreakpoint;

            if (isMobile) {
                rowEl.outerHTML = this.renderCard(this.data[index]);
            } else {
                rowEl.outerHTML = this.renderTableRow(this.data[index], index, visibleColumns);
            }

            // Get the new element and animate
            const newRowEl = this.container.querySelector(`tr[data-row-id="${id}"], .list-card[data-row-id="${id}"]`);
            if (newRowEl && highlight) {
                newRowEl.classList.add('list-row-updated');
                setTimeout(() => {
                    newRowEl.classList.remove('list-row-updated');
                }, duration);
            }

            // Re-attach event listeners for this row
            this.attachEventListeners();
        }

        // Trigger callback
        if (this.realtimeMode?.onUpdate) {
            this.realtimeMode.onUpdate(this.data[index], id);
        }

        return this;
    }

    /**
     * Remove a row with fade-out animation
     * @param {string|number} id - Row ID to remove
     * @param {Object} options - Animation options
     * @since 2.10.0
     */
    removeRow(id, options = {}) {
        const duration = options.duration || this.realtimeMode?.animationDuration || 300;
        const animate = options.animate !== false;

        // Find in data array
        const index = this.data.findIndex(row => String(this.getRowId(row)) === String(id));
        if (index === -1) {
            console.warn(`ListBuilder: Row with ID "${id}" not found`);
            return this;
        }

        const removedItem = this.data[index];

        // Animate removal
        if (animate) {
            this._animateRowRemoval(id, duration);
        }

        // Remove from data after animation
        setTimeout(() => {
            this.data = this.data.filter(row => String(this.getRowId(row)) !== String(id));
            this.applyFilters();

            // Remove from DOM if not already removed
            const rowEl = this.container.querySelector(`tr[data-row-id="${id}"], .list-card[data-row-id="${id}"]`);
            if (rowEl) {
                rowEl.remove();
            }

            // Update pagination info
            this._updatePaginationInfo();
        }, animate ? duration : 0);

        // Trigger callback
        if (this.realtimeMode?.onRemove) {
            this.realtimeMode.onRemove(removedItem, id);
        }

        return this;
    }

    /**
     * Connect to WebSocket for real-time updates
     * @param {Object} config - WebSocket configuration
     * @param {string} config.url - WebSocket URL
     * @param {Function} config.onMessage - Message handler that returns { action, data }
     * @param {Function} config.onOpen - Connection opened callback
     * @param {Function} config.onClose - Connection closed callback
     * @param {Function} config.onError - Error callback
     * @param {boolean} config.reconnect - Auto-reconnect on disconnect (default: true)
     * @param {number} config.reconnectInterval - Reconnect interval in ms (default: 3000)
     * @since 2.10.0
     */
    connectWebSocket(config) {
        if (this.webSocketConnection) {
            this.webSocketConnection.close();
        }

        const reconnect = config.reconnect !== false;
        const reconnectInterval = config.reconnectInterval || 3000;

        const connect = () => {
            const ws = new WebSocket(config.url);

            ws.onopen = (event) => {
                console.log('ListBuilder: WebSocket connected');
                if (config.onOpen) config.onOpen(event);
            };

            ws.onmessage = (event) => {
                try {
                    const rawData = JSON.parse(event.data);
                    const result = config.onMessage ? config.onMessage(rawData) : rawData;

                    if (result) {
                        const { action, data, id } = result;

                        switch (action) {
                            case 'insert':
                            case 'INSERT':
                                this.prependData(data);
                                break;
                            case 'append':
                                this.appendData(data);
                                break;
                            case 'update':
                            case 'UPDATE':
                                if (id) this.updateRow(id, data);
                                break;
                            case 'delete':
                            case 'DELETE':
                                if (id) this.removeRow(id);
                                break;
                            case 'refresh':
                                this.refresh();
                                break;
                        }
                    }
                } catch (error) {
                    console.error('ListBuilder: WebSocket message parse error', error);
                }
            };

            ws.onclose = (event) => {
                console.log('ListBuilder: WebSocket disconnected');
                if (config.onClose) config.onClose(event);

                if (reconnect && !event.wasClean) {
                    setTimeout(connect, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                console.error('ListBuilder: WebSocket error', error);
                if (config.onError) config.onError(error);
            };

            this.webSocketConnection = ws;
        };

        connect();
        return this;
    }

    /**
     * Connect to Supabase Realtime for live updates
     * @param {Object} config - Supabase configuration
     * @param {Object} config.supabase - Supabase client instance
     * @param {string} config.table - Table name to subscribe to
     * @param {string} config.event - Event type: 'INSERT' | 'UPDATE' | 'DELETE' | '*' (default: '*')
     * @param {string} config.schema - Schema name (default: 'public')
     * @param {Function} config.filter - Optional filter function for incoming data
     * @since 2.10.0
     */
    connectSupabase(config) {
        if (!config.supabase) {
            console.error('ListBuilder: Supabase client required');
            return this;
        }

        const event = config.event || '*';
        const schema = config.schema || 'public';

        // Unsubscribe from previous subscription
        if (this.supabaseSubscription) {
            config.supabase.removeChannel(this.supabaseSubscription);
        }

        const channel = config.supabase
            .channel(`listbuilder-${this.containerId}-${config.table}`)
            .on(
                'postgres_changes',
                { event, schema, table: config.table },
                (payload) => {
                    // Apply optional filter
                    if (config.filter && !config.filter(payload.new || payload.old)) {
                        return;
                    }

                    switch (payload.eventType) {
                        case 'INSERT':
                            this.prependData(payload.new);
                            break;
                        case 'UPDATE':
                            const updateId = payload.new?.id || payload.new?.uuid;
                            if (updateId) this.updateRow(updateId, payload.new);
                            break;
                        case 'DELETE':
                            const deleteId = payload.old?.id || payload.old?.uuid;
                            if (deleteId) this.removeRow(deleteId);
                            break;
                    }
                }
            )
            .subscribe();

        this.supabaseSubscription = channel;
        console.log(`ListBuilder: Subscribed to Supabase Realtime (${config.table})`);

        return this;
    }

    /**
     * Disconnect all real-time connections
     * @since 2.10.0
     */
    disconnectRealtime() {
        if (this.webSocketConnection) {
            this.webSocketConnection.close();
            this.webSocketConnection = null;
        }

        if (this.supabaseSubscription) {
            // Note: Caller must have reference to supabase client to properly remove channel
            this.supabaseSubscription = null;
        }

        return this;
    }

    /**
     * Get current data (similar to ChartBuilder.getData)
     * @returns {Array} Current data array
     * @since 2.10.0
     */
    getData() {
        return [...this.data];
    }

    // ========================================
    // PRIVATE ANIMATION HELPERS
    // ========================================

    /**
     * Insert rows into DOM with animation
     * @private
     */
    _insertRowsIntoDOM(items, position, animate, duration, highlight) {
        const isMobile = window.innerWidth < this.options.mobileBreakpoint;
        const visibleColumns = this.columns.filter(col => !this.hiddenColumns.has(col.key));

        items.forEach((item, index) => {
            let rowHtml;

            if (isMobile) {
                rowHtml = this.renderCard(item);
            } else {
                rowHtml = this.renderTableRow(item, index, visibleColumns);
            }

            // Find the container
            const tbody = this.container.querySelector('tbody');
            const cardsContainer = this.container.querySelector('.list-cards');
            const container = tbody || cardsContainer;

            if (!container) {
                // If no container exists (empty state), do a full re-render
                this.updateTableContent();
                return;
            }

            // Create temporary element to parse HTML
            const temp = document.createElement('div');
            temp.innerHTML = rowHtml;
            const newRow = temp.firstElementChild;

            if (animate) {
                newRow.classList.add('list-row-entering');
            }
            if (highlight) {
                newRow.classList.add('list-row-new');
            }

            // Insert at correct position
            if (position === 'top') {
                container.insertBefore(newRow, container.firstChild);
            } else {
                container.appendChild(newRow);
            }

            // Trigger animation
            if (animate) {
                // Force reflow
                newRow.offsetHeight;
                newRow.classList.remove('list-row-entering');
                newRow.classList.add('list-row-entered');
            }

            // Remove highlight after animation
            if (highlight) {
                setTimeout(() => {
                    newRow.classList.remove('list-row-new');
                }, duration * 2);
            }
        });

        // Re-attach event listeners
        this.attachEventListeners();

        // Update pagination info
        this._updatePaginationInfo();
    }

    /**
     * Animate row removal
     * @private
     */
    _animateRowRemoval(id, duration) {
        const rowEl = this.container.querySelector(`tr[data-row-id="${id}"], .list-card[data-row-id="${id}"]`);
        if (rowEl) {
            rowEl.classList.add('list-row-exiting');
            rowEl.style.transition = `all ${duration}ms ease-out`;
        }
    }

    /**
     * Update pagination info without full re-render
     * @private
     */
    _updatePaginationInfo() {
        const paginationInfo = this.container.querySelector('.list-pagination-info');
        if (paginationInfo) {
            const totalItems = this.options.serverSide ? this.totalCount : this.filteredData.length;
            const start = (this.currentPage - 1) * this.options.pageSize + 1;
            const end = Math.min(this.currentPage * this.options.pageSize, totalItems);
            paginationInfo.textContent = `Zeige ${start} - ${end} von ${totalItems}`;
        }
    }

}

export default ListBuilder;
