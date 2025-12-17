/**
 * TimelineBuilder.js - Timeline Component for Activity Feeds
 * Material Design 3 | Production-Ready
 *
 * Perfect for: Git History, Activity Logs, Audit Trails, Change History, News Feeds
 *
 * @version 2.12.0
 * @author SSI Solutions
 *
 * @example
 * // Simple Timeline
 * const timeline = new TimelineBuilder({
 *     containerId: 'activity-timeline',
 *     items: [
 *         {
 *             date: '2025-12-17T10:30:00',
 *             title: 'Dashboard Migration Complete',
 *             description: 'Migrated to SSI-Builders v2.12.0',
 *             icon: 'check'
 *         }
 *     ]
 * });
 *
 * @example
 * // Advanced: Git Activity Timeline
 * const timeline = new TimelineBuilder({
 *     containerId: 'git-timeline',
 *     items: [
 *         {
 *             date: '2025-12-17T10:30:00',
 *             icon: 'git-commit',
 *             iconColor: 'success',
 *             title: 'feat(dashboard): complete migration',
 *             description: 'Migrated all components to ssi-builders',
 *             user: 'Martin Mollay',
 *             badge: 'feat',
 *             metadata: '3 files changed, +250 -1200'
 *         }
 *     ],
 *     options: {
 *         showTime: true,
 *         groupByDate: true,
 *         iconStyle: 'circle',
 *         lineStyle: 'solid',
 *         compact: false
 *     }
 * });
 *
 * @example
 * // Loading State
 * const timeline = new TimelineBuilder({
 *     containerId: 'timeline',
 *     items: [],
 *     options: { loading: true }
 * });
 *
 * // Update with data
 * timeline.updateItems(newItems);
 */

import { IconManager } from './IconManager.js';

export class TimelineBuilder {
    /**
     * Create a TimelineBuilder
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {Array} config.items - Timeline items
     * @param {string} config.items[].date - ISO date string or timestamp
     * @param {string} config.items[].title - Item title
     * @param {string} [config.items[].description] - Item description/details
     * @param {string} [config.items[].icon] - Icon name (from IconManager)
     * @param {string} [config.items[].iconColor] - Icon color: 'primary', 'success', 'warning', 'error'
     * @param {string} [config.items[].user] - User/author name
     * @param {string} [config.items[].avatar] - Avatar URL
     * @param {string} [config.items[].badge] - Badge text (e.g., 'feat', 'fix', 'NEW')
     * @param {string} [config.items[].badgeColor] - Badge color variant
     * @param {string} [config.items[].metadata] - Additional metadata text
     * @param {string} [config.items[].href] - Link URL
     * @param {Function} [config.items[].onClick] - Click handler
     * @param {Object} [config.options] - Timeline options
     * @param {boolean} [config.options.showTime=true] - Show time in addition to date
     * @param {boolean} [config.options.groupByDate=false] - Group items by date
     * @param {string} [config.options.iconStyle='circle'] - Icon container style: 'circle', 'square', 'avatar'
     * @param {string} [config.options.lineStyle='solid'] - Timeline line style: 'solid', 'dashed', 'dotted'
     * @param {boolean} [config.options.compact=false] - Compact mode with smaller spacing
     * @param {boolean} [config.options.loading=false] - Show loading state
     * @param {string} [config.options.emptyMessage='No timeline items'] - Message when items empty
     * @param {Function} [config.onItemClick] - Global click handler for all items
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.items = config.items || [];
        this.options = {
            showTime: config.options?.showTime !== false,
            groupByDate: config.options?.groupByDate || false,
            iconStyle: config.options?.iconStyle || 'circle',
            lineStyle: config.options?.lineStyle || 'solid',
            compact: config.options?.compact || false,
            loading: config.options?.loading || false,
            emptyMessage: config.options?.emptyMessage || 'No timeline items'
        };
        this.onItemClick = config.onItemClick;

        this.container = null;
        this.render();
    }

    /**
     * Render the timeline
     */
    render() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`TimelineBuilder: Container #${this.containerId} not found`);
            return;
        }

        this.container.innerHTML = '';
        this.container.classList.add('ssi-timeline');

        if (this.options.compact) {
            this.container.classList.add('ssi-timeline--compact');
        }

        // Loading State
        if (this.options.loading) {
            this.renderLoading();
            return;
        }

        // Empty State
        if (!this.items || this.items.length === 0) {
            this.renderEmpty();
            return;
        }

        // Render Items
        if (this.options.groupByDate) {
            this.renderGrouped();
        } else {
            this.renderSimple();
        }
    }

    /**
     * Render loading state
     * @private
     */
    renderLoading() {
        const loading = document.createElement('div');
        loading.className = 'ssi-timeline__loading';

        const spinner = document.createElement('div');
        spinner.className = 'ssi-timeline__loading-spinner';

        const text = document.createElement('p');
        text.textContent = 'Loading timeline...';

        loading.appendChild(spinner);
        loading.appendChild(text);
        this.container.appendChild(loading);
    }

    /**
     * Render empty state
     * @private
     */
    renderEmpty() {
        const empty = document.createElement('div');
        empty.className = 'ssi-timeline__empty';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'ssi-timeline__empty-icon';
        // SAFE: IconManager.getIcon() returns safe, pre-defined icon strings (not user input)
        iconDiv.innerHTML = IconManager.getIcon('list');

        const text = document.createElement('p');
        text.textContent = this.options.emptyMessage;

        empty.appendChild(iconDiv);
        empty.appendChild(text);
        this.container.appendChild(empty);
    }

    /**
     * Render simple timeline (no grouping)
     * @private
     */
    renderSimple() {
        const list = document.createElement('div');
        list.className = 'ssi-timeline__list';
        list.setAttribute('data-line-style', this.options.lineStyle);

        this.items.forEach((item, index) => {
            const itemEl = this.renderItem(item, index === this.items.length - 1);
            list.appendChild(itemEl);
        });

        this.container.appendChild(list);
    }

    /**
     * Render grouped timeline (by date)
     * @private
     */
    renderGrouped() {
        const groups = this.groupItemsByDate(this.items);

        Object.keys(groups).forEach(dateKey => {
            // Date Header
            const dateHeader = document.createElement('div');
            dateHeader.className = 'ssi-timeline__date-header';
            dateHeader.textContent = this.formatDateHeader(dateKey);
            this.container.appendChild(dateHeader);

            // Items for this date
            const list = document.createElement('div');
            list.className = 'ssi-timeline__list';
            list.setAttribute('data-line-style', this.options.lineStyle);

            const groupItems = groups[dateKey];
            groupItems.forEach((item, index) => {
                const itemEl = this.renderItem(item, index === groupItems.length - 1);
                list.appendChild(itemEl);
            });

            this.container.appendChild(list);
        });
    }

    /**
     * Render a single timeline item
     * @private
     */
    renderItem(item, isLast) {
        const itemEl = document.createElement('div');
        itemEl.className = 'ssi-timeline__item';
        if (isLast) itemEl.classList.add('ssi-timeline__item--last');

        // Icon Container
        const iconContainer = document.createElement('div');
        iconContainer.className = `ssi-timeline__icon ssi-timeline__icon--${this.options.iconStyle}`;
        if (item.iconColor) {
            iconContainer.setAttribute('data-color', item.iconColor);
        }

        // Icon or Avatar
        if (item.avatar) {
            const avatar = document.createElement('img');
            avatar.src = item.avatar;
            avatar.alt = item.user || 'User';
            avatar.className = 'ssi-timeline__avatar';
            iconContainer.appendChild(avatar);
        } else if (item.icon) {
            const icon = document.createElement('span');
            icon.className = 'ssi-timeline__icon-inner';
            // SAFE: IconManager.getIcon() returns safe, pre-defined icon strings (not user input)
            icon.innerHTML = IconManager.getIcon(item.icon);
            iconContainer.appendChild(icon);
        } else {
            // Default icon
            const icon = document.createElement('span');
            icon.className = 'ssi-timeline__icon-inner';
            // SAFE: IconManager.getIcon() returns safe, pre-defined icon strings (not user input)
            icon.innerHTML = IconManager.getIcon('bell');
            iconContainer.appendChild(icon);
        }

        // Content Container
        const content = document.createElement('div');
        content.className = 'ssi-timeline__content';

        // Header (Title + Time)
        const header = document.createElement('div');
        header.className = 'ssi-timeline__header';

        // Title
        const title = document.createElement('div');
        title.className = 'ssi-timeline__title';
        if (item.href || item.onClick || this.onItemClick) {
            const link = document.createElement('a');
            link.href = item.href || '#';
            link.className = 'ssi-timeline__title-link';
            link.textContent = item.title;
            if (item.onClick || this.onItemClick) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick(item);
                    if (this.onItemClick) this.onItemClick(item);
                });
            }
            title.appendChild(link);
        } else {
            title.textContent = item.title;
        }

        // Badge
        if (item.badge) {
            const badge = document.createElement('span');
            badge.className = 'ssi-timeline__badge';
            if (item.badgeColor) {
                badge.setAttribute('data-color', item.badgeColor);
            }
            badge.textContent = item.badge;
            title.appendChild(badge);
        }

        header.appendChild(title);

        // Time
        const time = document.createElement('div');
        time.className = 'ssi-timeline__time';
        time.textContent = this.formatTime(item.date);
        header.appendChild(time);

        content.appendChild(header);

        // Description
        if (item.description) {
            const description = document.createElement('div');
            description.className = 'ssi-timeline__description';
            description.textContent = item.description;
            content.appendChild(description);
        }

        // User
        if (item.user && !item.avatar) {
            const user = document.createElement('div');
            user.className = 'ssi-timeline__user';

            const userIcon = document.createElement('span');
            // SAFE: IconManager.getIcon() returns safe, pre-defined icon strings (not user input)
            userIcon.innerHTML = IconManager.getIcon('user');

            const userName = document.createElement('span');
            userName.textContent = item.user;

            user.appendChild(userIcon);
            user.appendChild(document.createTextNode(' '));
            user.appendChild(userName);
            content.appendChild(user);
        }

        // Metadata
        if (item.metadata) {
            const metadata = document.createElement('div');
            metadata.className = 'ssi-timeline__metadata';
            metadata.textContent = item.metadata;
            content.appendChild(metadata);
        }

        // Assemble Item
        itemEl.appendChild(iconContainer);
        itemEl.appendChild(content);

        return itemEl;
    }

    /**
     * Group items by date
     * @private
     */
    groupItemsByDate(items) {
        const groups = {};
        items.forEach(item => {
            const dateKey = this.getDateKey(item.date);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    }

    /**
     * Get date key for grouping (YYYY-MM-DD)
     * @private
     */
    getDateKey(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    }

    /**
     * Format date header for groups
     * @private
     */
    formatDateHeader(dateKey) {
        const date = new Date(dateKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateKeyToday = today.toISOString().split('T')[0];
        const dateKeyYesterday = yesterday.toISOString().split('T')[0];

        if (dateKey === dateKeyToday) {
            return 'Today';
        } else if (dateKey === dateKeyYesterday) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    /**
     * Format time for display
     * @private
     */
    formatTime(dateStr) {
        const date = new Date(dateStr);

        if (this.options.showTime) {
            return date.toLocaleString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } else {
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }

    /**
     * Update timeline items
     * @param {Array} newItems - New timeline items
     */
    updateItems(newItems) {
        this.items = newItems;
        this.options.loading = false;
        this.render();
    }

    /**
     * Add new item to timeline (prepend)
     * @param {Object} item - Timeline item
     */
    addItem(item) {
        this.items.unshift(item);
        this.render();
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.options.loading = loading;
        this.render();
    }

    /**
     * Destroy the timeline
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('ssi-timeline', 'ssi-timeline--compact');
        }
    }
}
