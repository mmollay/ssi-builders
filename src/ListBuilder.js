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
 *
 * @version 2.2.0
 */

import { BaseBuilder } from './BaseBuilder.js';
import { IconManager } from './IconManager.js';

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
            emptyMessage: 'Keine Daten vorhanden',
            loadingMessage: 'Lade Daten...',
            mobileBreakpoint: 768,
            enableColumnToggle: true,
            tableStyle: {                // Table styling options
                striped: false,
                bordered: false,
                compact: false,
                hoverable: true,
                celled: false
            }
        });

        this.columns = config.columns || [];
        this.dataSource = config.dataSource;
        this.actions = config.actions || {};

        // Internal state
        this.data = [];
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
        this.container.innerHTML = `
            <div class="list-builder">
                ${this.renderToolbar()}
                <div class="list-builder-content">
                    ${this.renderTable()}
                </div>
                ${this.options.paginated ? this.renderPagination() : ''}
                ${this.renderVersionBadge()}
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
                                placeholder="Suchen..."
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
                            ${IconManager.getIcon('columns')} Spalten
                        </button>
                    ` : ''}

                    ${this.renderActions()}

                    ${this.options.selectable && this.selectedRows.size > 0 ? `
                        <button class="ssi-btn ssi-btn-danger ssi-btn-sm" id="${this.containerId}_bulkDelete">
                            ${IconManager.getIcon('delete')} Löschen (${this.selectedRows.size})
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
                <option value="">${filter.label}: Alle</option>
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
                    <p>${this.options.loadingMessage}</p>
                </div>
            `;
        }

        if (this.filteredData.length === 0) {
            return `
                <div class="list-empty">
                    <div class="list-empty-icon">${IconManager.getIcon('inbox')}</div>
                    <p>${this.options.emptyMessage}</p>
                    ${this.searchTerm || Object.keys(this.activeFilters).length > 0 ? `
                        <button class="ssi-btn ssi-btn-outlined ssi-btn-sm" id="${this.containerId}_clearFilters">
                            Filter zurücksetzen
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
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        if (totalPages <= 1) return '';

        const pages = this.getPaginationPages(totalPages);

        return `
            <div class="list-pagination">
                <div class="list-pagination-info">
                    Zeige ${(this.currentPage - 1) * this.options.pageSize + 1}
                    - ${Math.min(this.currentPage * this.options.pageSize, this.filteredData.length)}
                    von ${this.filteredData.length}
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
                const row = this.data.find(r => this.getRowId(r) === rowId);
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
                result = await this.dataSource();
                
                // Handle both formats
                if (result && typeof result === 'object' && 'items' in result) {
                    this.data = result.items || [];
                } else {
                    this.data = Array.isArray(result) ? result : [];
                }
                
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
        this.searchDebounce = setTimeout(() => {
            this.searchTerm = value;
            this.applyFilters();
            this.updateTableContent();
        }, 300);
    }

    /**
     * Handle filter change
     */
    handleFilterChange(key, value) {
        if (value) {
            this.activeFilters[key] = value;
        } else {
            delete this.activeFilters[key];
        }
        this.applyFilters();
        this.render();
    }

    /**
     * Handle sort
     */
    handleSort(columnKey) {
        if (this.sortColumn === columnKey) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnKey;
            this.sortDirection = 'asc';
        }
        this.applyFilters();
        this.updateTableContent();
    }

    /**
     * Handle page change
     */
    handlePageChange(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);

        if (page === 'prev') {
            this.currentPage = Math.max(1, this.currentPage - 1);
        } else if (page === 'next') {
            this.currentPage = Math.min(totalPages, this.currentPage + 1);
        } else {
            this.currentPage = parseInt(page);
        }

        this.updateTableContent();
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
                        <h3>Spalten anzeigen/verstecken</h3>
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
                        <button class="ssi-btn ssi-btn-outlined" id="${this.containerId}_cancelColumns">Abbrechen</button>
                        <button class="ssi-btn ssi-btn-primary" id="${this.containerId}_applyColumns">Anwenden</button>
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


}

export default ListBuilder;
