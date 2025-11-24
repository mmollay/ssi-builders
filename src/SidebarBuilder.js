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
 * - Push Mode (v2.2.0): Content shifts instead of being overlaid
 *
 * @version 2.2.0
 */

import { createVersionBadge } from './version.js';
import { IconManager } from './IconManager.js';

export class SidebarBuilder {
    static sidebarCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.items - Navigation items
     * @param {Object} config.options - Additional options
     * @param {string} config.options.mode - 'overlay' (default) or 'push' - determines if content is overlaid or pushed
     * @param {string} config.options.mainContentSelector - CSS selector for main content container (required for push mode)
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
            mode: config.options?.mode || 'overlay', // 'overlay' | 'push'
            mainContentSelector: config.options?.mainContentSelector || null, // Required for push mode
            ...config.options
        };

        this.mainContentElement = null;

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
        const isPushMode = this.options.mode === 'push';

        const html = `
            <aside class="sidebar sidebar-${this.options.position} ${this.isCollapsed ? 'sidebar-collapsed' : ''} ${isPushMode ? 'sidebar-push-mode' : ''}" id="${this.id}" style="width: ${width}px;">
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

        // Initialize push mode if enabled
        if (isPushMode) {
            this.initPushMode();
        }

        // Set active item from URL
        this.updateActiveFromUrl();

        return this;
    }

    /**
     * Initialize push mode - set up main content margin
     */
    initPushMode() {
        if (!this.options.mainContentSelector) {
            console.warn('SidebarBuilder: Push mode requires mainContentSelector option');
            return;
        }

        this.mainContentElement = document.querySelector(this.options.mainContentSelector);
        if (!this.mainContentElement) {
            console.warn(`SidebarBuilder: Main content element "${this.options.mainContentSelector}" not found`);
            return;
        }

        // Add transition class to main content
        this.mainContentElement.classList.add('sidebar-push-content');

        // Set initial margin
        this.updateContentMargin();
    }

    /**
     * Update main content margin based on sidebar state (for push mode)
     */
    updateContentMargin() {
        if (this.options.mode !== 'push' || !this.mainContentElement) return;

        const margin = this.isCollapsed ? this.options.collapsedWidth : this.options.width;
        const position = this.options.position;

        if (position === 'left') {
            this.mainContentElement.style.marginLeft = `${margin}px`;
            this.mainContentElement.style.marginRight = '';
        } else {
            this.mainContentElement.style.marginRight = `${margin}px`;
            this.mainContentElement.style.marginLeft = '';
        }
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
     * Render badge
     */
    renderBadge(badge) {
        // Handle both string and object badge formats
        if (typeof badge === 'string') {
            return `<span class="sidebar-badge">${badge}</span>`;
        }
        if (typeof badge === 'object' && badge.text) {
            const style = badge.color ? `style="background-color: ${badge.color};"` : '';
            return `<span class="sidebar-badge" ${style}>${badge.text}</span>`;
        }
        return '';
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

        // Handle 'section' type - render as collapsible group with heading
        if (item.type === 'section') {
            const sectionKey = item.key || `section_${item.label}`;
            const isExpanded = this.expandedGroups.has(sectionKey);

            return `
                <li class="sidebar-item sidebar-section" data-item-key="${sectionKey}">
                    <a
                        href="#"
                        class="sidebar-link sidebar-link-has-children sidebar-section-header"
                        title="${item.label}"
                    >
                        <span class="sidebar-label">${item.label}</span>
                        <span class="sidebar-arrow ${isExpanded ? 'sidebar-arrow-expanded' : ''}">›</span>
                    </a>
                    <div class="sidebar-submenu ${isExpanded ? 'sidebar-submenu-expanded' : ''}">
                        ${this.renderItems(item.items, level + 1)}
                    </div>
                </li>
            `;
        }

        const hasChildren = item.items && item.items.length > 0;
        const itemKey = item.key || item.page || item.label;
        const isExpanded = this.expandedGroups.has(itemKey);
        const isActive = this.activeItem === itemKey;

        return `
            <li class="sidebar-item ${isActive ? 'sidebar-item-active' : ''}" data-item-key="${itemKey}">
                <a
                    href="${item.href || '#'}"
                    class="sidebar-link ${hasChildren ? 'sidebar-link-has-children' : ''}"
                    ${item.target ? `target="${item.target}"` : ''}
                    title="${item.label}"
                >
                    ${item.icon ? `<span class="sidebar-icon">${item.icon}</span>` : ''}
                    <span class="sidebar-label">${item.label}</span>
                    ${item.badge ? this.renderBadge(item.badge) : ''}
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
                    // Handle navigation - prevent default href="#" behavior
                    e.preventDefault();
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

        // Update main content margin for push mode
        this.updateContentMargin();

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
            const badgeHtml = this.renderBadge(badge);
            if (badgeEl) {
                badgeEl.outerHTML = badgeHtml;
            } else {
                link?.insertAdjacentHTML('beforeend', badgeHtml);
            }
        } else {
            badgeEl?.remove();
        }
    }

    /**
     * Destroy sidebar
     */
    destroy() {
        // Clean up push mode styles
        if (this.mainContentElement) {
            this.mainContentElement.classList.remove('sidebar-push-content');
            this.mainContentElement.style.marginLeft = '';
            this.mainContentElement.style.marginRight = '';
        }
        this.container.innerHTML = '';
    }

    /**
     * Get current mode
     * @returns {string} 'overlay' or 'push'
     */
    getMode() {
        return this.options.mode;
    }

    /**
     * Set mode dynamically
     * @param {string} mode - 'overlay' or 'push'
     * @param {string} mainContentSelector - CSS selector for push mode (optional if already set)
     */
    setMode(mode, mainContentSelector = null) {
        if (mode !== 'overlay' && mode !== 'push') {
            console.warn('SidebarBuilder: Invalid mode. Use "overlay" or "push"');
            return this;
        }

        const previousMode = this.options.mode;
        this.options.mode = mode;

        if (mainContentSelector) {
            this.options.mainContentSelector = mainContentSelector;
        }

        const sidebarElement = document.getElementById(this.id);

        if (mode === 'push') {
            sidebarElement?.classList.add('sidebar-push-mode');
            this.initPushMode();
        } else {
            sidebarElement?.classList.remove('sidebar-push-mode');
            // Clean up push mode styles
            if (this.mainContentElement) {
                this.mainContentElement.classList.remove('sidebar-push-content');
                this.mainContentElement.style.marginLeft = '';
                this.mainContentElement.style.marginRight = '';
            }
            this.mainContentElement = null;
        }

        return this;
    }
}

export default SidebarBuilder;
