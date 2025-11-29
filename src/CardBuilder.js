/**
 * CardBuilder - Material Design 3 Card/Segment Component
 *
 * Universal container for grouping related content.
 * Modern equivalent to Fomantic-UI Segment with M3 design.
 *
 * @example
 * // Simple card
 * new CardBuilder({
 *     containerId: 'my-container',
 *     content: 'Card content here'
 * });
 *
 * @example
 * // Full featured card
 * new CardBuilder({
 *     containerId: 'my-container',
 *     variant: 'elevated',
 *     header: {
 *         title: 'Card Title',
 *         subtitle: 'Subtitle text',
 *         avatar: { text: 'AB', color: '#1a73e8' },
 *         actions: [{ icon: 'more', handler: () => {} }]
 *     },
 *     media: {
 *         src: 'image.jpg',
 *         alt: 'Image description',
 *         height: '200px'
 *     },
 *     content: 'Main content area',
 *     footer: {
 *         actions: [
 *             { label: 'Action 1', handler: () => {} },
 *             { label: 'Action 2', variant: 'text' }
 *         ]
 *     }
 * });
 *
 * @version 1.0.0
 */

import { IconManager } from './IconManager.js';
import { i18n } from './i18n.js';

export class CardBuilder {
    static cardCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID or selector
     * @param {string} config.variant - 'elevated' | 'filled' | 'outlined' (default: 'elevated')
     * @param {Object} config.header - Header configuration
     * @param {string} config.header.title - Header title
     * @param {string} config.header.subtitle - Header subtitle
     * @param {Object} config.header.avatar - Avatar config { src, text, color }
     * @param {Array} config.header.actions - Header action buttons
     * @param {Object} config.media - Media configuration { src, alt, height, position }
     * @param {string|HTMLElement} config.content - Main content (string or HTML)
     * @param {Object} config.footer - Footer configuration { actions, align }
     * @param {boolean} config.loading - Show loading state
     * @param {boolean} config.disabled - Disabled state
     * @param {boolean} config.collapsible - Can be collapsed
     * @param {boolean} config.collapsed - Initial collapsed state
     * @param {boolean} config.clickable - Card is clickable
     * @param {Function} config.onClick - Click handler
     * @param {string} config.padding - 'none' | 'compact' | 'normal' | 'relaxed'
     * @param {string} config.className - Additional CSS classes
     */
    constructor(config) {
        this.id = `card_${++CardBuilder.cardCounter}`;
        this.config = {
            containerId: config.containerId,
            variant: config.variant || 'elevated',
            header: config.header || null,
            media: config.media || null,
            content: config.content || '',
            footer: config.footer || null,
            loading: config.loading || false,
            disabled: config.disabled || false,
            collapsible: config.collapsible || false,
            collapsed: config.collapsed || false,
            clickable: config.clickable || false,
            onClick: config.onClick || null,
            padding: config.padding || 'normal',
            className: config.className || ''
        };

        this.element = null;
        this.container = null;
        this.isCollapsed = this.config.collapsed;

        if (this.config.containerId) {
            this.render();
        }
    }

    /**
     * Render the card
     */
    render() {
        // Get container
        if (typeof this.config.containerId === 'string') {
            this.container = document.getElementById(this.config.containerId) ||
                             document.querySelector(this.config.containerId);
        } else {
            this.container = this.config.containerId;
        }

        if (!this.container) {
            console.error(`CardBuilder: Container "${this.config.containerId}" not found`);
            return this;
        }

        // Build card classes
        const classes = [
            'card-builder',
            `card-${this.config.variant}`,
            `card-padding-${this.config.padding}`,
            this.config.clickable ? 'card-clickable' : '',
            this.config.disabled ? 'card-disabled' : '',
            this.config.loading ? 'card-loading' : '',
            this.isCollapsed ? 'card-collapsed' : '',
            this.config.className
        ].filter(Boolean).join(' ');

        // Build HTML
        const cardHtml = `
            <div class="${classes}" id="${this.id}" ${this.config.clickable ? 'tabindex="0" role="button"' : ''}>
                ${this.config.loading ? this._renderLoading() : ''}
                ${this.config.media && this.config.media.position === 'top' ? this._renderMedia() : ''}
                ${this.config.header ? this._renderHeader() : ''}
                ${this.config.media && this.config.media.position !== 'top' ? this._renderMedia() : ''}
                <div class="card-content ${this.isCollapsed ? 'card-content-collapsed' : ''}">
                    ${typeof this.config.content === 'string' ? this.config.content : ''}
                </div>
                ${this.config.footer ? this._renderFooter() : ''}
            </div>
        `;

        // Insert into container
        this.container.insertAdjacentHTML('beforeend', cardHtml);
        this.element = document.getElementById(this.id);

        // If content is HTMLElement, append it
        if (this.config.content instanceof HTMLElement) {
            const contentEl = this.element.querySelector('.card-content');
            contentEl.innerHTML = '';
            contentEl.appendChild(this.config.content);
        }

        // Attach event listeners
        this._attachEventListeners();

        return this;
    }

    /**
     * Render loading overlay
     * @private
     */
    _renderLoading() {
        return `
            <div class="card-loading-overlay">
                <div class="card-spinner"></div>
            </div>
        `;
    }

    /**
     * Render header
     * @private
     */
    _renderHeader() {
        const { header } = this.config;

        // Avatar
        let avatarHtml = '';
        if (header.avatar) {
            if (header.avatar.src) {
                avatarHtml = `<img class="card-avatar" src="${header.avatar.src}" alt="${header.avatar.alt || ''}">`;
            } else if (header.avatar.text) {
                const bgColor = header.avatar.color || 'var(--m3-primary, #1a73e8)';
                avatarHtml = `<div class="card-avatar card-avatar-text" style="background: ${bgColor}">${header.avatar.text}</div>`;
            }
        }

        // Actions
        let actionsHtml = '';
        if (header.actions?.length) {
            actionsHtml = `
                <div class="card-header-actions">
                    ${header.actions.map((action, idx) => `
                        <button class="card-header-action" data-action-idx="${idx}" aria-label="${action.label || i18n.t('card.action')}">
                            ${action.icon ? IconManager.getIcon(action.icon) : action.label || ''}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        // Collapse toggle
        let collapseToggle = '';
        if (this.config.collapsible) {
            collapseToggle = `
                <button class="card-collapse-toggle" aria-label="${i18n.t('card.toggleCollapse')}">
                    ${IconManager.getIcon('chevron-down')}
                </button>
            `;
        }

        return `
            <div class="card-header">
                ${avatarHtml}
                <div class="card-header-text">
                    ${header.title ? `<div class="card-title">${header.title}</div>` : ''}
                    ${header.subtitle ? `<div class="card-subtitle">${header.subtitle}</div>` : ''}
                </div>
                ${actionsHtml}
                ${collapseToggle}
            </div>
        `;
    }

    /**
     * Render media
     * @private
     */
    _renderMedia() {
        const { media } = this.config;
        const height = media.height || '200px';

        if (media.type === 'video') {
            return `
                <div class="card-media" style="height: ${height}">
                    <video src="${media.src}" ${media.controls ? 'controls' : ''} ${media.autoplay ? 'autoplay muted' : ''}></video>
                </div>
            `;
        }

        return `
            <div class="card-media" style="height: ${height}">
                <img src="${media.src}" alt="${media.alt || ''}" loading="lazy">
            </div>
        `;
    }

    /**
     * Render footer
     * @private
     */
    _renderFooter() {
        const { footer } = this.config;
        const align = footer.align || 'end';

        let actionsHtml = '';
        if (footer.actions?.length) {
            actionsHtml = footer.actions.map((action, idx) => {
                const variant = action.variant || 'text';
                return `
                    <button class="card-footer-action card-action-${variant}" data-footer-action-idx="${idx}">
                        ${action.icon ? IconManager.getIcon(action.icon) : ''}
                        ${action.label || ''}
                    </button>
                `;
            }).join('');
        }

        return `
            <div class="card-footer card-footer-${align}">
                ${footer.content || actionsHtml}
            </div>
        `;
    }

    /**
     * Attach event listeners
     * @private
     */
    _attachEventListeners() {
        if (!this.element) return;

        // Clickable card
        if (this.config.clickable && this.config.onClick) {
            this.element.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.config.onClick(this);
                }
            });
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.config.onClick(this);
                }
            });
        }

        // Header actions
        const headerActions = this.element.querySelectorAll('.card-header-action');
        headerActions.forEach(btn => {
            const idx = parseInt(btn.dataset.actionIdx);
            const action = this.config.header?.actions?.[idx];
            if (action?.handler) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    action.handler(this);
                });
            }
        });

        // Footer actions
        const footerActions = this.element.querySelectorAll('.card-footer-action');
        footerActions.forEach(btn => {
            const idx = parseInt(btn.dataset.footerActionIdx);
            const action = this.config.footer?.actions?.[idx];
            if (action?.handler) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    action.handler(this);
                });
            }
        });

        // Collapse toggle
        const collapseToggle = this.element.querySelector('.card-collapse-toggle');
        if (collapseToggle) {
            collapseToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCollapse();
            });
        }
    }

    /**
     * Toggle collapsed state
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.element?.classList.toggle('card-collapsed', this.isCollapsed);

        const content = this.element?.querySelector('.card-content');
        content?.classList.toggle('card-content-collapsed', this.isCollapsed);

        return this;
    }

    /**
     * Expand card
     */
    expand() {
        this.isCollapsed = false;
        this.element?.classList.remove('card-collapsed');
        this.element?.querySelector('.card-content')?.classList.remove('card-content-collapsed');
        return this;
    }

    /**
     * Collapse card
     */
    collapse() {
        this.isCollapsed = true;
        this.element?.classList.add('card-collapsed');
        this.element?.querySelector('.card-content')?.classList.add('card-content-collapsed');
        return this;
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.config.loading = loading;
        this.element?.classList.toggle('card-loading', loading);

        if (loading && !this.element?.querySelector('.card-loading-overlay')) {
            this.element?.insertAdjacentHTML('afterbegin', this._renderLoading());
        } else if (!loading) {
            this.element?.querySelector('.card-loading-overlay')?.remove();
        }

        return this;
    }

    /**
     * Update content
     */
    setContent(content) {
        this.config.content = content;
        const contentEl = this.element?.querySelector('.card-content');
        if (contentEl) {
            if (typeof content === 'string') {
                contentEl.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentEl.innerHTML = '';
                contentEl.appendChild(content);
            }
        }
        return this;
    }

    /**
     * Update title
     */
    setTitle(title) {
        if (this.config.header) {
            this.config.header.title = title;
        }
        const titleEl = this.element?.querySelector('.card-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
        return this;
    }

    /**
     * Destroy the card
     */
    destroy() {
        this.element?.remove();
        this.element = null;
        return this;
    }

    // ========== Static convenience methods ==========

    /**
     * Create a simple card
     */
    static simple(container, content, options = {}) {
        return new CardBuilder({
            containerId: container,
            content,
            ...options
        });
    }

    /**
     * Create a card with title
     */
    static withTitle(container, title, content, options = {}) {
        return new CardBuilder({
            containerId: container,
            header: { title },
            content,
            ...options
        });
    }

    /**
     * Create a card group container
     */
    static group(container, cards, options = {}) {
        const containerEl = typeof container === 'string'
            ? document.getElementById(container) || document.querySelector(container)
            : container;

        if (!containerEl) return null;

        const direction = options.direction || 'vertical';
        const gap = options.gap || '16px';

        const groupEl = document.createElement('div');
        groupEl.className = `card-group card-group-${direction}`;
        groupEl.style.gap = gap;
        containerEl.appendChild(groupEl);

        // Create cards inside group
        const instances = cards.map(cardConfig => {
            return new CardBuilder({
                ...cardConfig,
                containerId: groupEl
            });
        });

        return { element: groupEl, cards: instances };
    }
}

export default CardBuilder;
