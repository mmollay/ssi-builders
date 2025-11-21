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
 * @version 1.2.1
 */

import { GlobalConfig } from './GlobalConfig.js';
import { IconManager } from './IconManager.js';
import { SidebarBuilder } from './SidebarBuilder.js';

export class SiteBuilder {
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
                width: GlobalConfig.get('sidebar.width') || 280,
                collapsible: GlobalConfig.get('sidebar.collapsible') || true,
                navigation: [],     // [{ label, icon, href, onClick, badge }]
                footer: null        // Optional footer content
            },

            // Content Config
            content: {
                maxWidth: 1400,     // px oder 'full'
                padding: 40,        // px
                background: GlobalConfig.get('theme.background') || '#ffffff'
            },

            // Footer Config
            footer: {
                show: false,
                copyright: `© ${new Date().getFullYear()} SSI Solutions`,
                links: [],          // [{ label, href }]
                content: null       // Custom HTML
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
        this.sidebarCollapsed = false;

        this._init();
    }

    /**
     * Template anwenden
     * @private
     */
    _applyTemplate(templateName) {
        const template = SiteBuilder.templates[templateName];

        this.config.header.show = template.header;
        this.config.sidebar.show = template.sidebar;
        this.config.footer.show = template.footer;
        this.config.content.maxWidth = template.maxWidth;
        this.config.sidebar.collapsible = template.sidebarCollapsible;
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

        this.container.innerHTML = `
            <div class="site-builder ${hasFixedHeader ? 'has-fixed-header' : ''} ${hasSidebar ? 'has-sidebar' : ''}">
                ${this.config.header.show ? this._renderHeader() : ''}

                <div class="site-main ${hasSidebar ? 'with-sidebar' : ''}">
                    ${hasSidebar ? this._renderSidebarContainer() : ''}

                    <div class="site-content" id="${this.config.containerId}_content">
                        <div class="site-content-inner" style="
                            max-width: ${this.config.content.maxWidth === 'full' ? '100%' : this.config.content.maxWidth + 'px'};
                            padding: ${this.config.content.padding}px;
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

        // Sidebar Builder initialisieren wenn vorhanden
        if (hasSidebar) {
            this._initSidebar();
        }
    }

    /**
     * Header rendern
     * @private
     */
    _renderHeader() {
        const { logo, title, subtitle, menu, actions, fixed } = this.config.header;

        return `
            <header class="site-header ${fixed ? 'fixed' : ''}">
                <div class="site-header-left">
                    ${this.config.sidebar.show ? `
                        <button class="site-sidebar-toggle ssi-btn ssi-btn-icon ssi-btn-text" data-action="toggle-sidebar">
                            ${IconManager.getIcon('menu')}
                        </button>
                    ` : ''}

                    ${logo ? `<img src="${logo}" alt="${title}" class="site-logo">` : ''}

                    <div class="site-header-title">
                        <h1>${title}</h1>
                        ${subtitle ? `<span class="site-header-subtitle">${subtitle}</span>` : ''}
                    </div>
                </div>

                ${menu.length > 0 ? `
                    <nav class="site-header-menu">
                        ${menu.map(item => `
                            <a href="${item.href || '#'}" class="site-menu-item" data-href="${item.href || '#'}">
                                ${item.icon ? IconManager.getIcon(item.icon) : ''}
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </nav>
                ` : ''}

                ${actions.length > 0 ? `
                    <div class="site-header-actions">
                        ${actions.map((action, idx) => `
                            <button class="ssi-btn ${action.type ? `ssi-btn-${action.type}` : 'ssi-btn-text'} ssi-btn-icon" data-action-idx="${idx}">
                                ${action.icon ? IconManager.getIcon(action.icon) : ''}
                                ${action.label ? `<span>${action.label}</span>` : ''}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </header>
        `;
    }

    /**
     * Sidebar Container rendern
     * @private
     */
    _renderSidebarContainer() {
        return `<div id="${this.config.containerId}_sidebar" class="site-sidebar-container"></div>`;
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
            width: this.config.sidebar.width,
            collapsible: this.config.sidebar.collapsible,
            items: this.config.sidebar.navigation,
            onNavigate: (item) => {
                if (this.config.onNavigate) {
                    this.config.onNavigate(item.href);
                }
            }
        });
    }

    /**
     * Footer rendern
     * @private
     */
    _renderFooter() {
        const { copyright, links, content } = this.config.footer;

        if (content) {
            return `<footer class="site-footer">${content}</footer>`;
        }

        return `
            <footer class="site-footer">
                <div class="site-footer-content">
                    <div class="site-footer-copyright">${copyright}</div>
                    ${links.length > 0 ? `
                        <div class="site-footer-links">
                            ${links.map(link => `
                                <a href="${link.href}" class="site-footer-link">${link.label}</a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </footer>
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
        const titleEl = this.container.querySelector('.site-header-title h1');
        const subtitleEl = this.container.querySelector('.site-header-subtitle');
        const logoEl = this.container.querySelector('.site-logo');

        if (title && titleEl) titleEl.textContent = title;
        if (subtitle && subtitleEl) subtitleEl.textContent = subtitle;
        if (logo && logoEl) logoEl.src = logo;
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
        if (this.sidebarInstance) {
            this.sidebarInstance.destroy();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
