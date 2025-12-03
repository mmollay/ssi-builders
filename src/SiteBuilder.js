/**
 * SiteBuilder - Komplettes Layout-Gerippe für SSI Apps
 *
 * Bietet:
 * - Header mit Logo, Navigation, Actions
 * - Optional: Sidebar mit Navigation
 * - Main Content Area
 * - Optional: Footer
 * - Pre-configured Layout Templates (admin, website, dashboard)
 *
 * @example
 * import { SiteBuilder } from '/vendor/ssi-builders/src/index.js';
 *
 * const site = new SiteBuilder({
 *     containerId: 'app',
 *     layout: 'admin',
 *     header: {
 *         logo: '/logo.svg',
 *         title: 'My App',
 *         menu: [...]
 *     }
 * });
 *
 * site.renderContent('<div>Content here</div>');
 *
 * @version 2.3.0
 */

import { GlobalConfig } from './GlobalConfig.js';
import { IconManager } from './IconManager.js';
import { SidebarBuilder } from './SidebarBuilder.js';
import { HeaderBuilder } from './HeaderBuilder.js';
import { deepMerge } from './utils.js';

export class SiteBuilder {
    /**
     * Spacing Presets für Content Padding
     */
    static spacingPresets = {
        compact: 16,    // Minimaler Abstand
        normal: 40,     // Standard Abstand (default)
        spacious: 64    // Großzügiger Abstand
    };

    /**
     * Pre-configured Layout Templates
     */
    static templates = {
        admin: {
            header: true,
            sidebar: true,
            footer: false,
            maxWidth: 'full',
            sidebarCollapsible: true
        },
        website: {
            header: true,
            sidebar: false,
            footer: true,
            maxWidth: 1200,
            sidebarCollapsible: false
        },
        dashboard: {
            header: true,
            sidebar: true,
            footer: false,
            maxWidth: 'full',
            sidebarCollapsible: true
        },
        landing: {
            header: true,
            sidebar: false,
            footer: true,
            maxWidth: 1400,
            sidebarCollapsible: false
        }
    };

    constructor(config) {
        // Store user config for template application
        this.userConfig = config || {};

        this.config = {
            containerId: 'app',
            layout: 'admin',        // 'admin' | 'website' | 'dashboard' | 'landing' | 'custom'

            // Header Config
            header: {
                show: true,
                logo: null,         // URL oder HTML
                title: 'App',
                subtitle: null,
                menu: [],           // [{ label, href, icon, onClick }]
                actions: [],        // [{ label, icon, onClick, type }]
                fixed: true         // Sticky header
            },

            // Sidebar Config
            sidebar: {
                show: false,
                position: 'left',   // 'left' | 'right'
                width: GlobalConfig.get('sidebar.width') || 280,
                collapsible: GlobalConfig.get('sidebar.collapsible') || true,
                navigation: [],     // [{ label, icon, href, onClick, badge }]
                footer: null        // Optional footer content
            },

            // Content Config
            content: {
                maxWidth: 1400,     // px oder 'full'
                padding: 'normal',  // 'compact' | 'normal' | 'spacious' | number (px)
                background: GlobalConfig.get('theme.background') || '#ffffff'
            },

            // Footer Config
            footer: {
                show: false,
                layout: 'simple',   // 'simple' | 'columns' | 'centered'
                copyright: `© ${new Date().getFullYear()} SSI Solutions`,
                links: [],          // [{ label, href }]
                columns: [],        // [{ title, links: [{ label, href }] }] - for 'columns' layout
                social: [],         // [{ icon, href, label }] - social media links
                logo: null,         // Footer logo URL
                tagline: null,      // Company tagline
                background: null,   // 'light' | 'dark' | custom color
                content: null       // Custom HTML (overrides all)
            },

            // Callbacks
            onNavigate: null,       // (href) => void
            onSidebarToggle: null,  // (collapsed) => void

            ...config
        };

        // Apply template if specified
        if (config.layout && SiteBuilder.templates[config.layout]) {
            this._applyTemplate(config.layout);
        }

        this.container = null;
        this.contentContainer = null;
        this.sidebarInstance = null;
        this.headerInstance = null;
        this.sidebarCollapsed = false;

        this._init();
    }

    /**
     * Konvertiert Spacing-Preset zu px-Wert
     * @private
     */
    _resolvePadding(padding) {
        if (typeof padding === 'number') {
            return padding;
        }
        if (typeof padding === 'string' && SiteBuilder.spacingPresets[padding]) {
            return SiteBuilder.spacingPresets[padding];
        }
        return SiteBuilder.spacingPresets.normal; // fallback
    }

    /**
     * Template anwenden
     * @private
     */
    _applyTemplate(templateName) {
        const template = SiteBuilder.templates[templateName];

        // Only apply template defaults if user didn't specify them
        if (this.userConfig.header?.show === undefined) this.config.header.show = template.header;
        if (this.userConfig.sidebar?.show === undefined) this.config.sidebar.show = template.sidebar;
        if (this.userConfig.footer?.show === undefined) this.config.footer.show = template.footer;
        if (this.userConfig.content?.maxWidth === undefined) this.config.content.maxWidth = template.maxWidth;
        if (this.userConfig.sidebar?.collapsible === undefined) this.config.sidebar.collapsible = template.sidebarCollapsible;
    }

    /**
     * Initialisierung
     * @private
     */
    _init() {
        this.container = document.getElementById(this.config.containerId);
        if (!this.container) {
            console.error(`[SiteBuilder] Container #${this.config.containerId} not found`);
            return;
        }

        this._render();
        this._attachEventListeners();
    }

    /**
     * Komplettes Layout rendern
     * @private
     */
    _render() {
        const hasFixedHeader = this.config.header.show && this.config.header.fixed;
        const hasSidebar = this.config.sidebar.show;
        const sidebarPosition = this.config.sidebar.position || 'left';
        const sidebarRightClass = hasSidebar && sidebarPosition === 'right' ? 'sidebar-right' : '';
        const headerHeight = this.config.header.height || 64;

        this.container.innerHTML = `
            <div class="site-builder ${hasFixedHeader ? 'has-fixed-header' : ''} ${hasSidebar ? 'has-sidebar' : ''} ${sidebarRightClass}">
                ${this.config.header.show ? `<div id="${this.config.containerId}_header" class="site-header-container"></div>` : ''}

                ${hasSidebar ? this._renderSidebarContainer() : ''}

                <div class="site-main ${hasSidebar ? 'with-sidebar' : ''} ${sidebarRightClass}" style="${hasFixedHeader ? `padding-top: ${headerHeight}px;` : ''}">
                    <div class="site-content" id="${this.config.containerId}_content">
                        <div class="site-content-inner" style="
                            max-width: ${this.config.content.maxWidth === 'full' ? '100%' : this.config.content.maxWidth + 'px'};
                            padding: ${this._resolvePadding(this.config.content.padding)}px;
                            background: ${this.config.content.background};
                        ">
                            <!-- Content will be injected here -->
                        </div>
                    </div>
                </div>

                ${this.config.footer.show ? this._renderFooter() : ''}
            </div>
        `;

        this.contentContainer = this.container.querySelector('.site-content-inner');

        // Header Builder initialisieren
        if (this.config.header.show) {
            this._initHeader();
        }

        // Sidebar Builder initialisieren wenn vorhanden
        if (hasSidebar) {
            this._initSidebar();
        }
    }

    /**
     * Header initialisieren mit HeaderBuilder
     * @private
     */
    _initHeader() {
        const { logo, title, subtitle, menu = [], actions = [], fixed, height, search, user } = this.config.header;

        // Convert menu items to HeaderBuilder tabs format
        const tabs = menu.map(item => ({
            label: item.label,
            href: item.href || '#',
            icon: item.icon || null,
            active: item.active || false,
            badge: item.badge || null
        }));

        // Convert actions to HeaderBuilder format
        const headerActions = actions.map(action => ({
            icon: action.icon || null,
            label: action.label || null,
            type: action.type || null,
            tooltip: action.tooltip || action.label || null,
            onClick: action.onClick || null,
            iconOnly: !action.label
        }));

        this.headerInstance = new HeaderBuilder({
            containerId: `${this.config.containerId}_header`,
            options: {
                logo: logo,
                title: title,
                subtitle: subtitle,
                tabs: tabs,
                actions: headerActions,
                position: fixed ? 'fixed' : 'static',
                height: height || 64,
                showSidebarToggle: this.config.sidebar.show,
                onSidebarToggle: () => this.toggleSidebar(),
                onNavigate: (href) => {
                    if (this.config.onNavigate) {
                        this.config.onNavigate(href);
                    }
                },
                search: search || null,
                user: user || null
            }
        });

        this.headerInstance.render();
    }

    /**
     * Sidebar Container rendern
     * @private
     */
    _renderSidebarContainer() {
        const positionClass = this.config.sidebar.position === 'right' ? 'site-sidebar-right' : '';
        return `<div id="${this.config.containerId}_sidebar" class="site-sidebar-container ${positionClass}"></div>`;
    }

    /**
     * Sidebar initialisieren
     * @private
     */
    _initSidebar() {
        if (!this.config.sidebar.navigation || this.config.sidebar.navigation.length === 0) {
            return;
        }

        this.sidebarInstance = new SidebarBuilder({
            containerId: `${this.config.containerId}_sidebar`,
            items: this.config.sidebar.navigation,
            options: {
                width: this.config.sidebar.width || 280,
                collapsible: this.config.sidebar.collapsible,
                position: this.config.sidebar.position || 'left',
                onNavigate: (item) => {
                    if (this.config.onNavigate) {
                        this.config.onNavigate(item.href);
                    }
                }
            }
        });

        // CRITICAL: Must call render() to actually display the sidebar!
        this.sidebarInstance.render();
    }

    /**
     * Footer rendern
     * @private
     */
    _renderFooter() {
        const {
            layout = 'simple',
            copyright,
            links = [],
            columns = [],
            social = [],
            logo,
            tagline,
            background,
            content
        } = this.config.footer;

        // Custom HTML overrides everything
        if (content) {
            return `<footer class="site-footer">${content}</footer>`;
        }

        // Background class/style
        const bgClass = background === 'dark' ? 'site-footer--dark' : background === 'light' ? '' : '';
        const bgStyle = background && background !== 'dark' && background !== 'light'
            ? `background: ${background};`
            : '';

        // Render based on layout
        switch (layout) {
            case 'columns':
                return this._renderColumnsFooter({ copyright, columns, social, logo, tagline, bgClass, bgStyle });
            case 'centered':
                return this._renderCenteredFooter({ copyright, links, social, logo, tagline, bgClass, bgStyle });
            default:
                return this._renderSimpleFooter({ copyright, links, social, bgClass, bgStyle });
        }
    }

    /**
     * Simple Footer Layout (default)
     * @private
     */
    _renderSimpleFooter({ copyright, links, social, bgClass, bgStyle }) {
        return `
            <footer class="site-footer ${bgClass}" style="${bgStyle}">
                <div class="site-footer-content site-footer-content--simple">
                    <div class="site-footer-copyright">${copyright}</div>
                    ${links.length > 0 ? `
                        <div class="site-footer-links">
                            ${links.map(link => `
                                <a href="${link.href}" class="site-footer-link">${link.label}</a>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${social.length > 0 ? this._renderSocialLinks(social) : ''}
                </div>
            </footer>
        `;
    }

    /**
     * Columns Footer Layout
     * @private
     */
    _renderColumnsFooter({ copyright, columns, social, logo, tagline, bgClass, bgStyle }) {
        return `
            <footer class="site-footer ${bgClass}" style="${bgStyle}">
                <div class="site-footer-content site-footer-content--columns">
                    <div class="site-footer-columns">
                        ${logo || tagline ? `
                            <div class="site-footer-brand">
                                ${logo ? `<img src="${logo}" alt="Logo" class="site-footer-logo" />` : ''}
                                ${tagline ? `<p class="site-footer-tagline">${tagline}</p>` : ''}
                                ${social.length > 0 ? this._renderSocialLinks(social) : ''}
                            </div>
                        ` : ''}
                        ${columns.map(col => `
                            <div class="site-footer-column">
                                ${col.title ? `<h4 class="site-footer-column-title">${col.title}</h4>` : ''}
                                <ul class="site-footer-column-links">
                                    ${(col.links || []).map(link => `
                                        <li><a href="${link.href}" class="site-footer-link">${link.label}</a></li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                    <div class="site-footer-bottom">
                        <div class="site-footer-copyright">${copyright}</div>
                    </div>
                </div>
            </footer>
        `;
    }

    /**
     * Centered Footer Layout
     * @private
     */
    _renderCenteredFooter({ copyright, links, social, logo, tagline, bgClass, bgStyle }) {
        return `
            <footer class="site-footer ${bgClass}" style="${bgStyle}">
                <div class="site-footer-content site-footer-content--centered">
                    ${logo ? `<img src="${logo}" alt="Logo" class="site-footer-logo" />` : ''}
                    ${tagline ? `<p class="site-footer-tagline">${tagline}</p>` : ''}
                    ${links.length > 0 ? `
                        <div class="site-footer-links">
                            ${links.map(link => `
                                <a href="${link.href}" class="site-footer-link">${link.label}</a>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${social.length > 0 ? this._renderSocialLinks(social) : ''}
                    <div class="site-footer-copyright">${copyright}</div>
                </div>
            </footer>
        `;
    }

    /**
     * Render Social Media Links
     * @private
     */
    _renderSocialLinks(social) {
        return `
            <div class="site-footer-social">
                ${social.map(s => `
                    <a href="${s.href}" class="site-footer-social-link" title="${s.label || ''}" target="_blank" rel="noopener">
                        ${IconManager.getIcon(s.icon) || s.icon}
                    </a>
                `).join('')}
            </div>
        `;
    }

    /**
     * Event Listeners
     * @private
     */
    _attachEventListeners() {
        // Sidebar toggle
        const toggleBtn = this.container.querySelector('[data-action="toggle-sidebar"]');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Header menu navigation
        const menuItems = this.container.querySelectorAll('.site-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.dataset.href;
                if (this.config.onNavigate) {
                    this.config.onNavigate(href);
                } else {
                    window.location.href = href;
                }
            });
        });

        // Header actions
        const actionBtns = this.container.querySelectorAll('[data-action-idx]');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.actionIdx);
                const action = this.config.header.actions[idx];
                if (action && action.onClick) {
                    action.onClick();
                }
            });
        });
    }

    /**
     * Content in Main-Bereich rendern
     * @param {string|HTMLElement} content - HTML string oder DOM element
     */
    renderContent(content) {
        if (!this.contentContainer) {
            console.error('[SiteBuilder] Content container not initialized');
            return;
        }

        if (typeof content === 'string') {
            this.contentContainer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentContainer.innerHTML = '';
            this.contentContainer.appendChild(content);
        }
    }

    /**
     * Content anhängen (nicht ersetzen)
     * @param {string|HTMLElement} content
     */
    appendContent(content) {
        if (!this.contentContainer) return;

        if (typeof content === 'string') {
            this.contentContainer.insertAdjacentHTML('beforeend', content);
        } else if (content instanceof HTMLElement) {
            this.contentContainer.appendChild(content);
        }
    }

    /**
     * Content leeren
     */
    clearContent() {
        if (this.contentContainer) {
            this.contentContainer.innerHTML = '';
        }
    }

    /**
     * Konfiguration aktualisieren und Layout neu rendern
     * @param {Object} updates - Partial config object with updates
     * @example
     * site.update({
     *   sidebar: { show: false },
     *   footer: { show: true },
     *   content: { padding: 'spacious' }
     * });
     */
    update(updates) {
        // Store current content
        const currentContent = this.contentContainer ? this.contentContainer.innerHTML : '';

        // Deep merge updates into config
        if (updates.header) {
            this.config.header = { ...this.config.header, ...updates.header };
        }
        if (updates.sidebar) {
            this.config.sidebar = { ...this.config.sidebar, ...updates.sidebar };
        }
        if (updates.content) {
            this.config.content = { ...this.config.content, ...updates.content };
        }
        if (updates.footer) {
            this.config.footer = { ...this.config.footer, ...updates.footer };
        }

        // Destroy existing header if present
        if (this.headerInstance) {
            this.headerInstance.destroy();
            this.headerInstance = null;
        }

        // Destroy existing sidebar if present
        if (this.sidebarInstance) {
            this.sidebarInstance.destroy();
            this.sidebarInstance = null;
        }

        // Re-render layout
        this._render();
        this._attachEventListeners();

        // Restore content
        if (currentContent) {
            this.renderContent(currentContent);
        }
    }

    /**
     * Sidebar toggle
     */
    toggleSidebar() {
        if (!this.sidebarInstance) return;

        this.sidebarCollapsed = !this.sidebarCollapsed;
        this.sidebarInstance.toggle();

        if (this.config.onSidebarToggle) {
            this.config.onSidebarToggle(this.sidebarCollapsed);
        }
    }

    /**
     * Builder direkt hinzufügen
     * @param {string} type - 'list' | 'form' | 'modal' | 'chart' | 'tab'
     * @param {Object} config - Builder config
     * @returns {Object} Builder instance
     */
    addBuilder(type, config) {
        // Lazy import um circular dependencies zu vermeiden
        const builders = {
            list: () => import('./ListBuilder.js').then(m => m.ListBuilder),
            form: () => import('./FormBuilder.js').then(m => m.FormBuilder),
            chart: () => import('./ChartBuilder.js').then(m => m.ChartBuilder),
            tab: () => import('./TabBuilder.js').then(m => m.TabBuilder)
        };

        if (!builders[type]) {
            console.error(`[SiteBuilder] Unknown builder type: ${type}`);
            return null;
        }

        // Ensure container exists in content
        if (config.containerId) {
            const exists = this.contentContainer.querySelector(`#${config.containerId}`);
            if (!exists) {
                this.appendContent(`<div id="${config.containerId}"></div>`);
            }
        }

        // Dynamic import and instantiate
        return builders[type]().then(Builder => {
            return new Builder(config);
        });
    }

    /**
     * Header Titel/Logo updaten
     */
    updateHeader({ title, subtitle, logo }) {
        if (this.headerInstance) {
            this.headerInstance.updateTitle(title, subtitle);
            // For logo changes, we need to re-render
            if (logo) {
                this.config.header.logo = logo;
                this.headerInstance.update({ logo });
            }
        }
    }

    /**
     * Navigation Item als aktiv markieren
     * @param {string} href - URL to mark as active
     */
    setActiveNavigation(href) {
        if (this.sidebarInstance) {
            this.sidebarInstance.setActive(href);
        }

        // Header menu
        const menuItems = this.container.querySelectorAll('.site-menu-item');
        menuItems.forEach(item => {
            if (item.dataset.href === href) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Layout Template wechseln
     * @param {string} templateName - 'admin' | 'website' | 'dashboard' | 'landing'
     */
    changeLayout(templateName) {
        if (!SiteBuilder.templates[templateName]) {
            console.error(`[SiteBuilder] Unknown template: ${templateName}`);
            return;
        }

        this.config.layout = templateName;
        this._applyTemplate(templateName);
        this._render();
    }

    /**
     * Destroy
     */
    destroy() {
        if (this.headerInstance) {
            this.headerInstance.destroy();
        }
        if (this.sidebarInstance) {
            this.sidebarInstance.destroy();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Get header instance for direct access
     * @returns {HeaderBuilder|null}
     */
    getHeader() {
        return this.headerInstance;
    }

    /**
     * Get sidebar instance for direct access
     * @returns {SidebarBuilder|null}
     */
    getSidebar() {
        return this.sidebarInstance;
    }
}
