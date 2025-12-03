/**
 * HeaderBuilder.js - Material Design 3 App Bar Component
 * Google-Style Top Navigation Header
 *
 * Features:
 * - Material Design 3 styling (Google-like)
 * - Logo/Brand section
 * - Navigation tabs
 * - Action buttons (icon buttons, text buttons)
 * - Search bar (optional)
 * - User profile/avatar
 * - Mobile hamburger menu
 * - Fixed/Sticky/Static positioning
 * - Elevation on scroll
 * - Dark mode support
 *
 * @version 1.0.0
 */

import { IconManager } from './IconManager.js';
import { i18n } from './i18n.js';

export class HeaderBuilder {
    static headerCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Object} config.options - Header options
     */
    constructor(config) {
        this.id = `header_${++HeaderBuilder.headerCounter}`;
        this.containerId = config.containerId;
        this.container = null;

        this.options = {
            // Brand/Logo
            logo: config.options?.logo || null,        // URL or HTML
            title: config.options?.title || 'App',
            subtitle: config.options?.subtitle || null,
            titleLink: config.options?.titleLink || '/',

            // Navigation Tabs (Google-style)
            tabs: config.options?.tabs || [],          // [{ label, href, icon, active, badge }]

            // Action Buttons
            actions: config.options?.actions || [],    // [{ icon, label, onClick, type, tooltip }]

            // Search Bar
            search: config.options?.search || null,    // { placeholder, onSearch, onClear }

            // User Profile
            user: config.options?.user || null,        // { name, email, avatar, menu: [...] }

            // Layout Options
            position: config.options?.position || 'fixed',  // 'fixed' | 'sticky' | 'static'
            height: config.options?.height || 64,
            elevateOnScroll: config.options?.elevateOnScroll !== false,
            maxWidth: config.options?.maxWidth || 'full',   // 'full' | number (px)

            // Mobile
            mobileBreakpoint: config.options?.mobileBreakpoint || 768,
            hamburgerMenu: config.options?.hamburgerMenu !== false,

            // Theme
            variant: config.options?.variant || 'surface',  // 'surface' | 'primary' | 'transparent'
            darkMode: config.options?.darkMode || false,

            // Sidebar Toggle
            showSidebarToggle: config.options?.showSidebarToggle || false,
            onSidebarToggle: config.options?.onSidebarToggle || null,

            // Callbacks
            onNavigate: config.options?.onNavigate || null,
            onSearch: config.options?.onSearch || null,
            ...config.options
        };

        this.isScrolled = false;
        this.isMobileMenuOpen = false;
        this.isSearchExpanded = false;
        this.scrollHandler = null;
        this.resizeHandler = null;
    }

    /**
     * Render the header
     */
    render() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`[HeaderBuilder] Container #${this.containerId} not found`);
            return this;
        }

        const html = this._buildHTML();
        this.container.innerHTML = html;

        this._attachEventListeners();
        this._initScrollBehavior();
        this._initResponsive();

        return this;
    }

    /**
     * Build the header HTML
     * @private
     */
    _buildHTML() {
        const {
            position, height, variant, maxWidth
        } = this.options;

        const positionClass = position === 'fixed' ? 'header-fixed' :
                              position === 'sticky' ? 'header-sticky' : '';
        const variantClass = `header-${variant}`;
        const maxWidthStyle = maxWidth === 'full' ? '' : `max-width: ${maxWidth}px;`;

        return `
            <header
                class="header-builder ${positionClass} ${variantClass}"
                id="${this.id}"
                style="height: ${height}px;"
            >
                <div class="header-container" style="${maxWidthStyle}">
                    ${this._renderLeftSection()}
                    ${this._renderCenterSection()}
                    ${this._renderRightSection()}
                </div>
                ${this._renderMobileMenu()}
            </header>
        `;
    }

    /**
     * Render left section (logo, title, hamburger)
     * @private
     */
    _renderLeftSection() {
        const { logo, title, subtitle, titleLink, showSidebarToggle, hamburgerMenu } = this.options;

        return `
            <div class="header-left">
                ${showSidebarToggle ? `
                    <button class="header-icon-btn header-sidebar-toggle" data-action="toggle-sidebar" aria-label="Toggle Sidebar">
                        ${IconManager.getIcon('menu')}
                    </button>
                ` : ''}

                ${hamburgerMenu ? `
                    <button class="header-icon-btn header-hamburger" data-action="toggle-mobile-menu" aria-label="Menu">
                        ${IconManager.getIcon('menu')}
                    </button>
                ` : ''}

                <a href="${titleLink}" class="header-brand" data-navigate="${titleLink}">
                    ${logo ? (logo.startsWith('<') ? logo : `<img src="${logo}" alt="${title}" class="header-logo">`) : ''}
                    <div class="header-titles">
                        <span class="header-title">${title}</span>
                        ${subtitle ? `<span class="header-subtitle">${subtitle}</span>` : ''}
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Render center section (navigation tabs)
     * @private
     */
    _renderCenterSection() {
        const { tabs } = this.options;

        if (!tabs || tabs.length === 0) return '<div class="header-center"></div>';

        return `
            <nav class="header-center header-nav" role="navigation">
                <div class="header-tabs">
                    ${tabs.map((tab, idx) => `
                        <a
                            href="${tab.href || '#'}"
                            class="header-tab ${tab.active ? 'header-tab-active' : ''}"
                            data-tab-idx="${idx}"
                            data-navigate="${tab.href || '#'}"
                        >
                            ${tab.icon ? `<span class="header-tab-icon">${IconManager.getIcon(tab.icon)}</span>` : ''}
                            <span class="header-tab-label">${tab.label}</span>
                            ${tab.badge ? `<span class="header-badge">${tab.badge}</span>` : ''}
                        </a>
                    `).join('')}
                    <div class="header-tab-indicator"></div>
                </div>
            </nav>
        `;
    }

    /**
     * Render right section (search, actions, user)
     * @private
     */
    _renderRightSection() {
        const { search, actions, user } = this.options;

        return `
            <div class="header-right">
                ${search ? this._renderSearch() : ''}
                ${this._renderActions(actions)}
                ${user ? this._renderUser() : ''}
            </div>
        `;
    }

    /**
     * Render search bar
     * @private
     */
    _renderSearch() {
        const { search } = this.options;
        const placeholder = search.placeholder || 'Search...';

        return `
            <div class="header-search ${this.isSearchExpanded ? 'header-search-expanded' : ''}">
                <button class="header-icon-btn header-search-toggle" data-action="toggle-search" aria-label="Search">
                    ${IconManager.getIcon('search')}
                </button>
                <div class="header-search-input-wrapper">
                    <span class="header-search-icon">${IconManager.getIcon('search')}</span>
                    <input
                        type="text"
                        class="header-search-input"
                        placeholder="${placeholder}"
                        aria-label="${placeholder}"
                    >
                    <button class="header-search-clear" data-action="clear-search" aria-label="Clear">
                        ${IconManager.getIcon('close')}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render action buttons
     * @private
     */
    _renderActions(actions) {
        if (!actions || actions.length === 0) return '';

        return `
            <div class="header-actions">
                ${actions.map((action, idx) => {
                    const typeClass = action.type === 'primary' ? 'header-btn-primary' :
                                     action.type === 'filled' ? 'header-btn-filled' : '';

                    if (action.label && !action.iconOnly) {
                        return `
                            <button
                                class="header-btn ${typeClass}"
                                data-action-idx="${idx}"
                                ${action.tooltip ? `title="${action.tooltip}"` : ''}
                            >
                                ${action.icon ? IconManager.getIcon(action.icon) : ''}
                                <span>${action.label}</span>
                            </button>
                        `;
                    }

                    return `
                        <button
                            class="header-icon-btn ${typeClass}"
                            data-action-idx="${idx}"
                            ${action.tooltip ? `title="${action.tooltip}"` : ''}
                            aria-label="${action.tooltip || action.label || 'Action'}"
                        >
                            ${action.icon ? IconManager.getIcon(action.icon) : ''}
                            ${action.badge ? `<span class="header-action-badge">${action.badge}</span>` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Render user profile
     * @private
     */
    _renderUser() {
        const { user } = this.options;

        const avatar = user.avatar
            ? `<img src="${user.avatar}" alt="${user.name}" class="header-avatar-img">`
            : `<span class="header-avatar-initials">${this._getInitials(user.name)}</span>`;

        return `
            <div class="header-user">
                <button class="header-avatar-btn" data-action="toggle-user-menu" aria-label="User menu">
                    <div class="header-avatar">
                        ${avatar}
                    </div>
                </button>
                <div class="header-user-dropdown" id="${this.id}_user_menu">
                    <div class="header-user-info">
                        <div class="header-avatar header-avatar-large">
                            ${avatar}
                        </div>
                        <div class="header-user-details">
                            <span class="header-user-name">${user.name}</span>
                            ${user.email ? `<span class="header-user-email">${user.email}</span>` : ''}
                        </div>
                    </div>
                    ${user.menu && user.menu.length > 0 ? `
                        <div class="header-user-menu">
                            ${user.menu.map((item, idx) => {
                                if (item.type === 'divider') {
                                    return '<div class="header-user-divider"></div>';
                                }
                                return `
                                    <a href="${item.href || '#'}" class="header-user-menu-item" data-user-menu-idx="${idx}">
                                        ${item.icon ? IconManager.getIcon(item.icon) : ''}
                                        <span>${item.label}</span>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render mobile menu overlay
     * @private
     */
    _renderMobileMenu() {
        const { tabs, actions } = this.options;

        return `
            <div class="header-mobile-overlay ${this.isMobileMenuOpen ? 'header-mobile-open' : ''}" id="${this.id}_mobile">
                <div class="header-mobile-backdrop" data-action="close-mobile-menu"></div>
                <div class="header-mobile-drawer">
                    <div class="header-mobile-header">
                        <span class="header-mobile-title">${this.options.title}</span>
                        <button class="header-icon-btn" data-action="close-mobile-menu" aria-label="Close">
                            ${IconManager.getIcon('close')}
                        </button>
                    </div>
                    ${tabs && tabs.length > 0 ? `
                        <nav class="header-mobile-nav">
                            ${tabs.map((tab, idx) => `
                                <a
                                    href="${tab.href || '#'}"
                                    class="header-mobile-item ${tab.active ? 'header-mobile-item-active' : ''}"
                                    data-tab-idx="${idx}"
                                    data-navigate="${tab.href || '#'}"
                                >
                                    ${tab.icon ? IconManager.getIcon(tab.icon) : ''}
                                    <span>${tab.label}</span>
                                    ${tab.badge ? `<span class="header-badge">${tab.badge}</span>` : ''}
                                </a>
                            `).join('')}
                        </nav>
                    ` : ''}
                    ${actions && actions.length > 0 ? `
                        <div class="header-mobile-actions">
                            ${actions.map((action, idx) => `
                                <button class="header-mobile-action" data-action-idx="${idx}">
                                    ${action.icon ? IconManager.getIcon(action.icon) : ''}
                                    <span>${action.label || ''}</span>
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Get initials from name
     * @private
     */
    _getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    /**
     * Attach event listeners
     * @private
     */
    _attachEventListeners() {
        const header = document.getElementById(this.id);
        if (!header) return;

        // Sidebar toggle
        const sidebarToggle = header.querySelector('[data-action="toggle-sidebar"]');
        sidebarToggle?.addEventListener('click', () => {
            if (this.options.onSidebarToggle) {
                this.options.onSidebarToggle();
            }
        });

        // Mobile menu toggle
        const hamburger = header.querySelector('[data-action="toggle-mobile-menu"]');
        hamburger?.addEventListener('click', () => this._toggleMobileMenu(true));

        // Close mobile menu
        const closeMobileButtons = this.container.querySelectorAll('[data-action="close-mobile-menu"]');
        closeMobileButtons.forEach(btn => {
            btn.addEventListener('click', () => this._toggleMobileMenu(false));
        });

        // Navigation tabs
        const navLinks = header.querySelectorAll('[data-navigate]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.dataset.navigate;
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                if (this.options.onNavigate) {
                    e.preventDefault();
                    this.options.onNavigate(href);
                }
            });
        });

        // Tab clicks
        const tabLinks = header.querySelectorAll('[data-tab-idx]');
        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                const idx = parseInt(tab.dataset.tabIdx);
                this.setActiveTab(idx);
            });
        });

        // Action buttons
        const actionBtns = this.container.querySelectorAll('[data-action-idx]');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.actionIdx);
                const action = this.options.actions[idx];
                if (action?.onClick) {
                    action.onClick();
                }
            });
        });

        // Search toggle
        const searchToggle = header.querySelector('[data-action="toggle-search"]');
        searchToggle?.addEventListener('click', () => this._toggleSearch());

        // Search input
        const searchInput = header.querySelector('.header-search-input');
        searchInput?.addEventListener('input', (e) => {
            if (this.options.search?.onSearch) {
                this.options.search.onSearch(e.target.value);
            }
        });
        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._toggleSearch(false);
            }
        });

        // Search clear
        const searchClear = header.querySelector('[data-action="clear-search"]');
        searchClear?.addEventListener('click', () => {
            const input = header.querySelector('.header-search-input');
            if (input) {
                input.value = '';
                if (this.options.search?.onClear) {
                    this.options.search.onClear();
                }
            }
        });

        // User menu toggle
        const userBtn = header.querySelector('[data-action="toggle-user-menu"]');
        const userMenu = this.container.querySelector(`#${this.id}_user_menu`);
        if (userBtn && userMenu) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('header-user-dropdown-open');
            });

            // Close on outside click
            document.addEventListener('click', () => {
                userMenu.classList.remove('header-user-dropdown-open');
            });
        }

        // User menu items
        const userMenuItems = this.container.querySelectorAll('[data-user-menu-idx]');
        userMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const idx = parseInt(item.dataset.userMenuIdx);
                const menuItem = this.options.user?.menu?.[idx];
                if (menuItem?.onClick) {
                    e.preventDefault();
                    menuItem.onClick();
                }
                userMenu?.classList.remove('header-user-dropdown-open');
            });
        });
    }

    /**
     * Initialize scroll behavior (elevation on scroll)
     * @private
     */
    _initScrollBehavior() {
        if (!this.options.elevateOnScroll) return;

        this.scrollHandler = () => {
            const header = document.getElementById(this.id);
            if (!header) return;

            const shouldElevate = window.scrollY > 10;
            if (shouldElevate !== this.isScrolled) {
                this.isScrolled = shouldElevate;
                header.classList.toggle('header-elevated', shouldElevate);
            }
        };

        window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    /**
     * Initialize responsive behavior
     * @private
     */
    _initResponsive() {
        this.resizeHandler = () => {
            const header = document.getElementById(this.id);
            if (!header) return;

            const isMobile = window.innerWidth < this.options.mobileBreakpoint;
            header.classList.toggle('header-mobile', isMobile);

            // Close mobile menu on resize to desktop
            if (!isMobile && this.isMobileMenuOpen) {
                this._toggleMobileMenu(false);
            }
        };

        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler(); // Initial check
    }

    /**
     * Toggle mobile menu
     * @private
     */
    _toggleMobileMenu(open) {
        this.isMobileMenuOpen = typeof open === 'boolean' ? open : !this.isMobileMenuOpen;
        const overlay = document.getElementById(`${this.id}_mobile`);
        overlay?.classList.toggle('header-mobile-open', this.isMobileMenuOpen);
        document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }

    /**
     * Toggle search
     * @private
     */
    _toggleSearch(expanded) {
        const header = document.getElementById(this.id);
        const searchWrapper = header?.querySelector('.header-search');
        if (!searchWrapper) return;

        this.isSearchExpanded = typeof expanded === 'boolean' ? expanded : !this.isSearchExpanded;
        searchWrapper.classList.toggle('header-search-expanded', this.isSearchExpanded);

        if (this.isSearchExpanded) {
            const input = searchWrapper.querySelector('.header-search-input');
            input?.focus();
        }
    }

    /**
     * Set active tab
     * @param {number} index - Tab index
     */
    setActiveTab(index) {
        const header = document.getElementById(this.id);
        if (!header) return;

        // Update internal state
        this.options.tabs.forEach((tab, idx) => {
            tab.active = idx === index;
        });

        // Update DOM
        const tabs = header.querySelectorAll('.header-tab');
        tabs.forEach((tab, idx) => {
            tab.classList.toggle('header-tab-active', idx === index);
        });

        // Update mobile nav
        const mobileItems = this.container.querySelectorAll('.header-mobile-item');
        mobileItems.forEach((item, idx) => {
            item.classList.toggle('header-mobile-item-active', idx === index);
        });

        // Move indicator
        this._updateTabIndicator(index);
    }

    /**
     * Update tab indicator position
     * @private
     */
    _updateTabIndicator(index) {
        const header = document.getElementById(this.id);
        const indicator = header?.querySelector('.header-tab-indicator');
        const tabs = header?.querySelectorAll('.header-tab');

        if (!indicator || !tabs || !tabs[index]) return;

        const tab = tabs[index];
        const rect = tab.getBoundingClientRect();
        const containerRect = tab.parentElement.getBoundingClientRect();

        indicator.style.width = `${rect.width}px`;
        indicator.style.transform = `translateX(${rect.left - containerRect.left}px)`;
    }

    /**
     * Update header options
     * @param {Object} updates - Partial options to update
     */
    update(updates) {
        this.options = { ...this.options, ...updates };
        this.render();
    }

    /**
     * Update title
     * @param {string} title - New title
     * @param {string} subtitle - New subtitle (optional)
     */
    updateTitle(title, subtitle) {
        const header = document.getElementById(this.id);
        const titleEl = header?.querySelector('.header-title');
        const subtitleEl = header?.querySelector('.header-subtitle');

        if (title && titleEl) {
            this.options.title = title;
            titleEl.textContent = title;
        }
        if (subtitle !== undefined && subtitleEl) {
            this.options.subtitle = subtitle;
            subtitleEl.textContent = subtitle;
        }
    }

    /**
     * Update action badge
     * @param {number} index - Action index
     * @param {string|number} badge - Badge value (or null to remove)
     */
    updateActionBadge(index, badge) {
        const btn = this.container?.querySelector(`[data-action-idx="${index}"]`);
        if (!btn) return;

        let badgeEl = btn.querySelector('.header-action-badge');
        if (badge) {
            if (!badgeEl) {
                badgeEl = document.createElement('span');
                badgeEl.className = 'header-action-badge';
                btn.appendChild(badgeEl);
            }
            badgeEl.textContent = badge;
        } else {
            badgeEl?.remove();
        }
    }

    /**
     * Destroy the header
     */
    destroy() {
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default HeaderBuilder;
