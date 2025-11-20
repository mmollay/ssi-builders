/**
 * SidebarBuilder.js - Modern Sidebar Navigation Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Collapsible sidebar
 * - Nested navigation
 * - Icon support
 * - Badge/counter support
 * - Mobile drawer mode
 * - Persistent state (localStorage)
 * - Active state management
 * - Search/filter items
 * - User profile section
 * - Footer actions
 *
 * @version 1.0.0
 */

import { createVersionBadge } from './version.js';

export class SidebarBuilder {
    static sidebarCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.items - Navigation items
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        this.id = `sidebar_${++SidebarBuilder.sidebarCounter}`;
        this.containerId = config.containerId;
        this.items = config.items || [];
        this.options = {
            position: config.options?.position || 'left', // left, right
            collapsible: config.options?.collapsible !== false,
            defaultCollapsed: config.options?.defaultCollapsed || false,
            persistent: config.options?.persistent !== false,
            width: config.options?.width || 280,
            collapsedWidth: config.options?.collapsedWidth || 72,
            header: config.options?.header || null,
            footer: config.options?.footer || null,
            searchable: config.options?.searchable || false,
            onNavigate: config.options?.onNavigate || null,
            ...config.options
        };

        this.isCollapsed = this.options.persistent
            ? localStorage.getItem(`sidebar_${this.id}_collapsed`) === 'true'
            : this.options.defaultCollapsed;

        this.activeItem = null;
        this.container = null;
        this.expandedGroups = new Set();
    }

    /**
     * Initialize and render sidebar
     */
    render() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container with ID "${this.containerId}" not found`);
            return this;
        }

        const width = this.isCollapsed ? this.options.collapsedWidth : this.options.width;

        const html = `
            <aside class="sidebar sidebar-${this.options.position} ${this.isCollapsed ? 'sidebar-collapsed' : ''}" id="${this.id}" style="width: ${width}px;">
                ${this.options.header ? this.renderHeader() : ''}
                ${this.options.searchable ? this.renderSearch() : ''}
                ${this.renderNav()}
                ${this.options.footer ? this.renderFooter() : ''}
                ${this.options.collapsible ? this.renderToggleButton() : ''}
                ${createVersionBadge()}
            </aside>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();

        // Set active item from URL
        this.updateActiveFromUrl();

        return this;
    }

    /**
     * Render header
     */
    renderHeader() {
        const header = this.options.header;
        if (typeof header === 'function') {
            return `<div class="sidebar-header">${header(this.isCollapsed)}</div>`;
        }
        return `<div class="sidebar-header">${header}</div>`;
    }

    /**
     * Render search
     */
    renderSearch() {
        return `
            <div class="sidebar-search">
                <input
                    type="text"
                    class="sidebar-search-input"
                    placeholder="${this.isCollapsed ? '🔍' : 'Suchen...'}"
                    aria-label="Suche"
                />
            </div>
        `;
    }

    /**
     * Render navigation
     */
    renderNav() {
        return `
            <nav class="sidebar-nav">
                ${this.renderItems(this.items)}
            </nav>
        `;
    }

    /**
     * Render navigation items
     */
    renderItems(items, level = 0) {
        return `
            <ul class="sidebar-list" data-level="${level}">
                ${items.map(item => this.renderItem(item, level)).join('')}
            </ul>
        `;
    }

    /**
     * Render single navigation item
     */
    renderItem(item, level) {
        if (item.type === 'divider') {
            return '<li class="sidebar-divider"></li>';
        }

        if (item.type === 'heading') {
            return `
                <li class="sidebar-heading ${this.isCollapsed ? 'sidebar-heading-collapsed' : ''}">
                    ${item.label}
                </li>
            `;
        }

        const hasChildren = item.items && item.items.length > 0;
        const isExpanded = this.expandedGroups.has(item.key);
        const isActive = this.activeItem === item.key;

        return `
            <li class="sidebar-item ${isActive ? 'sidebar-item-active' : ''}" data-item-key="${item.key}">
                <a
                    href="${item.href || '#'}"
                    class="sidebar-link ${hasChildren ? 'sidebar-link-has-children' : ''}"
                    ${item.target ? `target="${item.target}"` : ''}
                    title="${item.label}"
                >
                    ${item.icon ? `<span class="sidebar-icon">${item.icon}</span>` : ''}
                    <span class="sidebar-label">${item.label}</span>
                    ${item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : ''}
                    ${hasChildren ? `<span class="sidebar-arrow ${isExpanded ? 'sidebar-arrow-expanded' : ''}">›</span>` : ''}
                </a>
                ${hasChildren ? `
                    <div class="sidebar-submenu ${isExpanded ? 'sidebar-submenu-expanded' : ''}">
                        ${this.renderItems(item.items, level + 1)}
                    </div>
                ` : ''}
            </li>
        `;
    }

    /**
     * Render footer
     */
    renderFooter() {
        const footer = this.options.footer;
        if (typeof footer === 'function') {
            return `<div class="sidebar-footer">${footer(this.isCollapsed)}</div>`;
        }
        return `<div class="sidebar-footer">${footer}</div>`;
    }

    /**
     * Render toggle button
     */
    renderToggleButton() {
        return `
            <button class="sidebar-toggle" aria-label="${this.isCollapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}">
                <span class="sidebar-toggle-icon">◂</span>
            </button>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const sidebarElement = document.getElementById(this.id);

        // Toggle button
        const toggleBtn = sidebarElement.querySelector('.sidebar-toggle');
        toggleBtn?.addEventListener('click', () => this.toggle());

        // Navigation links
        const links = sidebarElement.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const item = link.closest('.sidebar-item');
                const itemKey = item?.dataset.itemKey;

                // Handle submenu toggle
                if (link.classList.contains('sidebar-link-has-children')) {
                    e.preventDefault();
                    this.toggleGroup(itemKey);
                } else {
                    // Handle navigation
                    this.setActive(itemKey);
                    this.options.onNavigate?.(itemKey, this.findItemByKey(itemKey));
                }
            });
        });

        // Search
        const searchInput = sidebarElement.querySelector('.sidebar-search-input');
        searchInput?.addEventListener('input', (e) => {
            this.filterItems(e.target.value);
        });
    }

    /**
     * Toggle sidebar collapsed/expanded
     */
    toggle() {
        this.isCollapsed = !this.isCollapsed;

        const sidebarElement = document.getElementById(this.id);
        const width = this.isCollapsed ? this.options.collapsedWidth : this.options.width;

        sidebarElement.classList.toggle('sidebar-collapsed');
        sidebarElement.style.width = `${width}px`;

        // Update search placeholder
        const searchInput = sidebarElement.querySelector('.sidebar-search-input');
        if (searchInput) {
            searchInput.placeholder = this.isCollapsed ? '🔍' : 'Suchen...';
        }

        // Save state
        if (this.options.persistent) {
            localStorage.setItem(`sidebar_${this.id}_collapsed`, this.isCollapsed);
        }

        return this;
    }

    /**
     * Expand sidebar
     */
    expand() {
        if (!this.isCollapsed) return this;
        return this.toggle();
    }

    /**
     * Collapse sidebar
     */
    collapse() {
        if (this.isCollapsed) return this;
        return this.toggle();
    }

    /**
     * Toggle group expanded/collapsed
     */
    toggleGroup(itemKey) {
        if (this.expandedGroups.has(itemKey)) {
            this.expandedGroups.delete(itemKey);
        } else {
            this.expandedGroups.add(itemKey);
        }

        const sidebarElement = document.getElementById(this.id);
        const item = sidebarElement.querySelector(`[data-item-key="${itemKey}"]`);
        const submenu = item?.querySelector('.sidebar-submenu');
        const arrow = item?.querySelector('.sidebar-arrow');

        submenu?.classList.toggle('sidebar-submenu-expanded');
        arrow?.classList.toggle('sidebar-arrow-expanded');
    }

    /**
     * Set active item
     */
    setActive(itemKey) {
        this.activeItem = itemKey;

        const sidebarElement = document.getElementById(this.id);
        sidebarElement.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('sidebar-item-active', item.dataset.itemKey === itemKey);
        });

        // Expand parent groups
        const menuItem = this.findItemByKey(itemKey);
        if (menuItem) {
            this.expandParentGroups(itemKey);
        }
    }

    /**
     * Expand parent groups for an item
     */
    expandParentGroups(itemKey, items = this.items, parents = []) {
        for (const item of items) {
            if (item.key === itemKey) {
                parents.forEach(parent => this.expandedGroups.add(parent));
                return true;
            }
            if (item.items) {
                const found = this.expandParentGroups(itemKey, item.items, [...parents, item.key]);
                if (found) return true;
            }
        }
        return false;
    }

    /**
     * Filter items by search query
     */
    filterItems(query) {
        const sidebarElement = document.getElementById(this.id);
        const items = sidebarElement.querySelectorAll('.sidebar-item');

        query = query.toLowerCase().trim();

        items.forEach(item => {
            const label = item.querySelector('.sidebar-label')?.textContent.toLowerCase();
            const matches = !query || label?.includes(query);
            item.style.display = matches ? '' : 'none';
        });
    }

    /**
     * Update active item from current URL
     */
    updateActiveFromUrl() {
        const currentPath = window.location.pathname;
        const matchingItem = this.findItemByHref(currentPath);
        if (matchingItem) {
            this.setActive(matchingItem.key);
        }
    }

    /**
     * Find item by key
     */
    findItemByKey(key, items = this.items) {
        for (const item of items) {
            if (item.key === key) return item;
            if (item.items) {
                const found = this.findItemByKey(key, item.items);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Find item by href
     */
    findItemByHref(href, items = this.items) {
        for (const item of items) {
            if (item.href === href) return item;
            if (item.items) {
                const found = this.findItemByHref(href, item.items);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Update badge for item
     */
    updateBadge(itemKey, badge) {
        const sidebarElement = document.getElementById(this.id);
        const item = sidebarElement.querySelector(`[data-item-key="${itemKey}"]`);
        const link = item?.querySelector('.sidebar-link');
        const badgeEl = link?.querySelector('.sidebar-badge');

        if (badge) {
            if (badgeEl) {
                badgeEl.textContent = badge;
            } else {
                link?.insertAdjacentHTML('beforeend', `<span class="sidebar-badge">${badge}</span>`);
            }
        } else {
            badgeEl?.remove();
        }
    }

    /**
     * Destroy sidebar
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

export default SidebarBuilder;
