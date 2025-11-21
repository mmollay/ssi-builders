/**
 * MenuBuilder.js - Modern Menu/Dropdown Component
 * Material Design 3 - Production-Ready
 *
 * Features:
 * - Context menus
 * - Dropdown menus
 * - Nested submenus
 * - Icon support
 * - Keyboard navigation
 * - Click outside to close
 * - Position smart positioning (auto-adjust)
 * - Dividers
 * - Disabled items
 * - Checkboxes & radio groups
 *
 * @version 1.0.0
 */

import { createVersionBadge } from './version.js';

export class MenuBuilder {
    static activeMenus = [];
    static menuCounter = 0;

    /**
     * @param {Object} config - Configuration object
     * @param {Array} config.items - Menu items
     * @param {string|HTMLElement} config.trigger - Trigger element (selector or element)
     * @param {string} config.triggerEvent - Event type: 'click', 'contextmenu', 'hover'
     * @param {Function} config.onSelect - Callback when item is selected
     * @param {Object} config.options - Additional options
     */
    constructor(config) {
        this.id = `menu_${++MenuBuilder.menuCounter}`;
        this.items = config.items || [];
        this.onSelectCallback = config.onSelect || null;
        this.options = {
            position: config.options?.position || 'bottom-left', // bottom-left, bottom-right, top-left, top-right, right, left
            width: config.options?.width || 'auto',
            maxHeight: config.options?.maxHeight || 400,
            closeOnSelect: config.options?.closeOnSelect !== false,
            trigger: config.triggerEvent || config.options?.trigger || 'click', // click, hover, contextmenu, manual
            offset: config.options?.offset || { x: 0, y: 4 },
            ...config.options
        };

        this.isOpen = false;
        this.menuElement = null;
        this.triggerElement = null;

        // Auto-attach if trigger is provided
        if (config.trigger) {
            this.attachTo(config.trigger);
        }
    }

    /**
     * Attach menu to trigger element
     */
    attachTo(triggerElement) {
        if (typeof triggerElement === 'string') {
            this.triggerElement = document.querySelector(triggerElement);
        } else {
            this.triggerElement = triggerElement;
        }

        if (!this.triggerElement) {
            console.error('Trigger element not found');
            return this;
        }

        // Setup trigger events
        if (this.options.trigger === 'click') {
            this.triggerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        } else if (this.options.trigger === 'hover') {
            this.triggerElement.addEventListener('mouseenter', () => this.open());
            this.triggerElement.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!this.menuElement?.matches(':hover')) {
                        this.close();
                    }
                }, 100);
            });
        }

        return this;
    }

    /**
     * Open menu
     */
    open() {
        if (this.isOpen) return this;

        this.render();
        this.isOpen = true;
        MenuBuilder.activeMenus.push(this);

        // Position menu
        this.positionMenu();

        // Show with animation
        setTimeout(() => {
            this.menuElement.classList.add('menu-show');
        }, 10);

        // Attach event listeners
        this.attachEventListeners();

        return this;
    }

    /**
     * Close menu
     */
    close() {
        if (!this.isOpen) return this;

        this.menuElement?.classList.remove('menu-show');

        setTimeout(() => {
            this.menuElement?.remove();
            this.isOpen = false;

            const index = MenuBuilder.activeMenus.indexOf(this);
            if (index > -1) {
                MenuBuilder.activeMenus.splice(index, 1);
            }
        }, 200);

        return this;
    }

    /**
     * Toggle menu
     */
    toggle() {
        return this.isOpen ? this.close() : this.open();
    }

    /**
     * Render menu
     */
    render() {
        const menuHtml = `
            <div class="menu-overlay" id="${this.id}">
                <div class="menu-container" style="width: ${this.options.width}; max-height: ${this.options.maxHeight}px">
                    ${this.renderItems(this.items)}
                </div>
                ${createVersionBadge()}
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHtml);
        this.menuElement = document.getElementById(this.id);
    }

    /**
     * Render menu items
     */
    renderItems(items, level = 0) {
        return `
            <div class="menu-list" data-level="${level}">
                ${items.map(item => this.renderItem(item, level)).join('')}
            </div>
        `;
    }

    /**
     * Render single item
     */
    renderItem(item, level) {
        if (item.type === 'divider') {
            return '<div class="menu-divider"></div>';
        }

        // Support both 'submenu' and 'items' properties
        const submenuItems = item.submenu || item.items;
        const hasSubmenu = submenuItems && submenuItems.length > 0;
        const isDisabled = item.disabled;
        // Support both 'id' and 'key' properties
        const itemId = item.id || item.key || '';

        return `
            <div class="menu-item ${isDisabled ? 'menu-item-disabled' : ''} ${hasSubmenu ? 'menu-item-has-submenu' : ''}" data-item-key="${itemId}">
                ${item.checkbox !== undefined ? `
                    <span class="menu-checkbox ${item.checkbox ? 'menu-checkbox-checked' : ''}">
                        ${item.checkbox ? '✓' : ''}
                    </span>
                ` : ''}
                ${item.icon ? `<span class="menu-icon">${item.icon}</span>` : ''}
                <span class="menu-label">${item.label}</span>
                ${item.shortcut ? `<span class="menu-shortcut">${item.shortcut}</span>` : ''}
                ${hasSubmenu ? '<span class="menu-arrow">›</span>' : ''}
                ${hasSubmenu ? `<div class="menu-submenu">${this.renderItems(submenuItems, level + 1)}</div>` : ''}
            </div>
        `;
    }

    /**
     * Position menu relative to trigger
     */
    positionMenu() {
        if (!this.triggerElement || !this.menuElement) return;

        const triggerRect = this.triggerElement.getBoundingClientRect();
        const menuContainer = this.menuElement.querySelector('.menu-container');
        const menuRect = menuContainer.getBoundingClientRect();

        let top = 0;
        let left = 0;

        // Calculate position based on options
        switch (this.options.position) {
            case 'bottom-left':
                top = triggerRect.bottom + this.options.offset.y;
                left = triggerRect.left + this.options.offset.x;
                break;
            case 'bottom-right':
                top = triggerRect.bottom + this.options.offset.y;
                left = triggerRect.right - menuRect.width + this.options.offset.x;
                break;
            case 'top-left':
                top = triggerRect.top - menuRect.height - this.options.offset.y;
                left = triggerRect.left + this.options.offset.x;
                break;
            case 'top-right':
                top = triggerRect.top - menuRect.height - this.options.offset.y;
                left = triggerRect.right - menuRect.width + this.options.offset.x;
                break;
            case 'right':
                top = triggerRect.top + this.options.offset.y;
                left = triggerRect.right + this.options.offset.x;
                break;
            case 'left':
                top = triggerRect.top + this.options.offset.y;
                left = triggerRect.left - menuRect.width - this.options.offset.x;
                break;
        }

        // Adjust if menu goes off screen
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left + menuRect.width > viewportWidth) {
            left = viewportWidth - menuRect.width - 8;
        }
        if (left < 8) {
            left = 8;
        }
        if (top + menuRect.height > viewportHeight) {
            top = viewportHeight - menuRect.height - 8;
        }
        if (top < 8) {
            top = 8;
        }

        menuContainer.style.top = `${top}px`;
        menuContainer.style.left = `${left}px`;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Click outside to close
        setTimeout(() => {
            document.addEventListener('click', this.outsideClickHandler = () => {
                this.close();
            }, { once: true });
        }, 0);

        // Menu item clicks
        const menuItems = this.menuElement.querySelectorAll('.menu-item:not(.menu-item-disabled)');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const itemKey = item.dataset.itemKey;
                const menuItem = this.findItemByKey(itemKey);

                // Call onSelect callback
                if (this.onSelectCallback && itemKey) {
                    this.onSelectCallback(itemKey);
                }

                if (menuItem?.handler) {
                    menuItem.handler(menuItem);
                }

                // Toggle checkbox
                if (menuItem?.checkbox !== undefined) {
                    menuItem.checkbox = !menuItem.checkbox;
                    const checkbox = item.querySelector('.menu-checkbox');
                    checkbox.classList.toggle('menu-checkbox-checked');
                    checkbox.textContent = menuItem.checkbox ? '✓' : '';
                }

                // Close on select
                if (this.options.closeOnSelect && !item.classList.contains('menu-item-has-submenu')) {
                    this.close();
                }
            });
        });

        // Submenu hover
        const itemsWithSubmenu = this.menuElement.querySelectorAll('.menu-item-has-submenu');
        itemsWithSubmenu.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const submenu = item.querySelector('.menu-submenu');
                submenu?.classList.add('menu-submenu-show');
            });
            item.addEventListener('mouseleave', () => {
                const submenu = item.querySelector('.menu-submenu');
                submenu?.classList.remove('menu-submenu-show');
            });
        });

        // Keyboard navigation
        this.menuElement.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });

        // Keep menu open on hover (if hover trigger)
        if (this.options.trigger === 'hover') {
            this.menuElement.addEventListener('mouseleave', () => {
                this.close();
            });
        }
    }

    /**
     * Find menu item by key
     */
    findItemByKey(key, items = this.items) {
        for (const item of items) {
            // Support both 'id' and 'key' properties
            if (item.id === key || item.key === key) return item;
            // Support both 'submenu' and 'items' properties
            const submenuItems = item.submenu || item.items;
            if (submenuItems) {
                const found = this.findItemByKey(key, submenuItems);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Static method: Create context menu
     */
    static contextMenu(event, items) {
        event.preventDefault();

        const menu = new MenuBuilder({
            items,
            options: {
                position: 'bottom-left',
                trigger: 'manual'
            }
        });

        // Create invisible trigger at cursor position
        const fakeTrigger = document.createElement('div');
        fakeTrigger.style.position = 'fixed';
        fakeTrigger.style.top = `${event.clientY}px`;
        fakeTrigger.style.left = `${event.clientX}px`;
        fakeTrigger.style.width = '0';
        fakeTrigger.style.height = '0';
        document.body.appendChild(fakeTrigger);

        menu.triggerElement = fakeTrigger;
        menu.open();

        // Clean up fake trigger when menu closes
        const originalClose = menu.close.bind(menu);
        menu.close = function() {
            originalClose();
            fakeTrigger.remove();
        };

        return menu;
    }

    /**
     * Static method: Close all menus
     */
    static closeAll() {
        [...MenuBuilder.activeMenus].forEach(menu => menu.close());
    }
}

export default MenuBuilder;
