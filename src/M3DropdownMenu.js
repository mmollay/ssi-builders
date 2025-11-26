/**
 * M3DropdownMenu - Material Design 3 Exposed Dropdown Menu
 * SSI Builders v2.4.0
 *
 * Framework-agnostic, Vanilla JavaScript implementation
 * Following M3 spec: https://m3.material.io/components/menus/overview
 *
 * Features:
 * - Filled and Outlined variants
 * - Searchable dropdown with filter input
 * - Async data loading via dataSource callback
 * - Keyboard navigation
 * - Loading and empty states
 *
 * @example
 * // Basic usage
 * const dropdown = new M3DropdownMenu({
 *     containerId: 'country-dropdown',
 *     label: 'Country',
 *     options: [
 *         { value: 'at', label: 'Austria' },
 *         { value: 'de', label: 'Germany' }
 *     ],
 *     onChange: (value, label) => console.log(value, label)
 * });
 *
 * @example
 * // Searchable with async data
 * const asyncDropdown = new M3DropdownMenu({
 *     containerId: 'user-search',
 *     label: 'Search User',
 *     searchable: true,
 *     searchPlaceholder: 'Type to search...',
 *     minSearchLength: 2,
 *     dataSource: async (query) => {
 *         const response = await fetch(`/api/users?q=${query}`);
 *         const data = await response.json();
 *         return data.map(u => ({ value: u.id, label: u.name }));
 *     },
 *     onChange: (value, label) => console.log(value, label)
 * });
 */

export class M3DropdownMenu {
    static instanceCount = 0;

    constructor(config) {
        this.config = {
            containerId: null,
            label: 'Select',
            placeholder: 'Choose an option',
            options: [],
            value: null,
            disabled: false,
            required: false,
            error: null,
            supportingText: null,
            variant: 'filled', // 'filled' or 'outlined'
            size: 'md', // 'sm', 'md', 'lg'
            leadingIcon: null,
            onChange: null,
            // NEW: Searchable options
            searchable: false,
            searchPlaceholder: 'Search...',
            minSearchLength: 0,
            debounceMs: 300,
            // NEW: Async data source
            dataSource: null, // async (query) => [{ value, label }]
            // NEW: Empty/Loading states
            emptyText: 'No results found',
            loadingText: 'Loading...',
            ...config
        };

        this.instanceId = `m3-dropdown-${++M3DropdownMenu.instanceCount}`;
        this.isOpen = false;
        this.focusedIndex = -1;
        this.selectedIndex = -1;
        this.searchQuery = '';
        this.isLoading = false;
        this.debounceTimer = null;

        // Store original options for filtering
        this.originalOptions = [];
        this.filteredOptions = [];

        // Normalize options to always have { value, label } format
        this.setOptions(this.config.options);

        // Find initial selected index
        if (this.config.value !== null) {
            this.selectedIndex = this.options.findIndex(opt => opt.value === this.config.value);
        }

        this.init();
    }

    setOptions(options) {
        this.originalOptions = options.map(opt =>
            typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
        this.filteredOptions = [...this.originalOptions];
        this.options = this.filteredOptions;
    }

    init() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`M3DropdownMenu: Container #${this.config.containerId} not found`);
            return;
        }

        container.innerHTML = this.render();
        this.container = container;
        this.bindEvents();
    }

    render() {
        const { label, placeholder, disabled, required, error, supportingText, variant, size, leadingIcon, searchable } = this.config;
        const selectedOption = this.selectedIndex >= 0 ? this.options[this.selectedIndex] : null;
        const displayValue = selectedOption ? selectedOption.label : '';
        const hasValue = displayValue.length > 0;

        const sizeClass = `m3-dropdown--${size}`;
        const variantClass = `m3-dropdown--${variant}`;
        const stateClasses = [
            disabled ? 'm3-dropdown--disabled' : '',
            error ? 'm3-dropdown--error' : '',
            hasValue ? 'm3-dropdown--has-value' : '',
            searchable ? 'm3-dropdown--searchable' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="m3-dropdown ${variantClass} ${sizeClass} ${stateClasses}"
                 id="${this.instanceId}"
                 role="combobox"
                 aria-haspopup="listbox"
                 aria-expanded="false"
                 aria-labelledby="${this.instanceId}-label"
                 aria-controls="${this.instanceId}-menu"
                 ${disabled ? 'aria-disabled="true"' : ''}
                 tabindex="${disabled ? -1 : 0}">

                <!-- Text Field (Trigger) -->
                <div class="m3-dropdown__field">
                    ${leadingIcon ? `
                        <span class="m3-dropdown__leading-icon" aria-hidden="true">
                            ${leadingIcon}
                        </span>
                    ` : ''}

                    <div class="m3-dropdown__content">
                        <span class="m3-dropdown__label ${hasValue ? 'm3-dropdown__label--float' : ''}"
                              id="${this.instanceId}-label">
                            ${label}${required ? ' *' : ''}
                        </span>
                        <span class="m3-dropdown__value" aria-hidden="true">
                            ${displayValue || ''}
                        </span>
                        <input type="hidden"
                               name="${this.config.name || this.config.containerId}"
                               value="${selectedOption?.value || ''}"
                               ${required ? 'required' : ''}>
                    </div>

                    <span class="m3-dropdown__trailing-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M7 10l5 5 5-5H7z"/>
                        </svg>
                    </span>

                    <!-- State Layer for ripple effect -->
                    <div class="m3-dropdown__state-layer"></div>

                    <!-- Active Indicator (for filled variant) -->
                    <div class="m3-dropdown__active-indicator"></div>
                </div>

                <!-- Dropdown Menu -->
                <div class="m3-dropdown__menu"
                     id="${this.instanceId}-menu"
                     role="listbox"
                     aria-labelledby="${this.instanceId}-label"
                     tabindex="-1">

                    ${searchable ? this.renderSearchInput() : ''}

                    <div class="m3-dropdown__options-container">
                        ${this.renderOptions()}
                    </div>
                </div>

                <!-- Supporting Text / Error -->
                ${supportingText || error ? `
                    <div class="m3-dropdown__supporting-text ${error ? 'm3-dropdown__supporting-text--error' : ''}">
                        ${error || supportingText}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderSearchInput() {
        return `
            <div class="m3-dropdown__search">
                <svg class="m3-dropdown__search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text"
                       class="m3-dropdown__search-input"
                       placeholder="${this.config.searchPlaceholder}"
                       value="${this.searchQuery}"
                       autocomplete="off"
                       aria-label="Search options">
                ${this.searchQuery ? `
                    <button class="m3-dropdown__search-clear" type="button" aria-label="Clear search">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderOptions() {
        if (this.isLoading) {
            return `
                <div class="m3-dropdown__loading">
                    <div class="m3-dropdown__spinner"></div>
                    <span>${this.config.loadingText}</span>
                </div>
            `;
        }

        if (this.options.length === 0) {
            return `
                <div class="m3-dropdown__empty">
                    ${this.config.emptyText}
                </div>
            `;
        }

        return this.options.map((option, index) => `
            <div class="m3-dropdown__option ${index === this.selectedIndex ? 'm3-dropdown__option--selected' : ''}"
                 role="option"
                 data-index="${index}"
                 data-value="${this.escapeHtml(String(option.value))}"
                 aria-selected="${index === this.selectedIndex}"
                 tabindex="-1">
                ${option.icon ? `<span class="m3-dropdown__option-icon">${this.escapeHtml(option.icon)}</span>` : ''}
                <span class="m3-dropdown__option-label">${this.highlightMatch(option.label)}</span>
                ${option.description ? `<span class="m3-dropdown__option-description">${this.escapeHtml(option.description)}</span>` : ''}
                ${index === this.selectedIndex ? `
                    <span class="m3-dropdown__option-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    </span>
                ` : ''}
                <div class="m3-dropdown__option-state-layer"></div>
            </div>
        `).join('');
    }

    highlightMatch(text) {
        // First escape HTML to prevent XSS
        const escaped = this.escapeHtml(text);

        if (!this.searchQuery || !this.config.searchable) return escaped;

        const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
        return escaped.replace(regex, '<mark class="m3-dropdown__highlight">$1</mark>');
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    bindEvents() {
        const dropdown = document.getElementById(this.instanceId);
        if (!dropdown) return;

        this.dropdown = dropdown;
        this.field = dropdown.querySelector('.m3-dropdown__field');
        this.menu = dropdown.querySelector('.m3-dropdown__menu');
        this.optionsContainer = dropdown.querySelector('.m3-dropdown__options-container');
        this.searchInput = dropdown.querySelector('.m3-dropdown__search-input');
        this.searchClear = dropdown.querySelector('.m3-dropdown__search-clear');

        this.cacheOptionElements();

        // Click handler for toggle
        this.field.addEventListener('click', (e) => {
            if (this.config.disabled) return;
            this.toggle();
        });

        // Keyboard navigation
        dropdown.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Search input handlers
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
            this.searchInput.addEventListener('click', (e) => e.stopPropagation());
        }

        // Search clear button
        if (this.searchClear) {
            this.searchClear.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearSearch();
            });
        }

        // Option click handlers
        this.bindOptionEvents();

        // Store bound handlers for cleanup (prevent memory leaks)
        this.boundHandleOutsideClick = (e) => {
            if (!dropdown.contains(e.target) && this.isOpen) {
                this.close();
            }
        };
        this.boundHandleEscapeKey = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.dropdown.focus();
            }
        };

        // Close on outside click
        document.addEventListener('click', this.boundHandleOutsideClick);

        // Close on escape
        document.addEventListener('keydown', this.boundHandleEscapeKey);
    }

    cacheOptionElements() {
        this.optionElements = this.dropdown.querySelectorAll('.m3-dropdown__option');
    }

    bindOptionEvents() {
        this.optionElements.forEach((option, index) => {
            option.addEventListener('click', () => this.selectOption(index));
            option.addEventListener('mouseenter', () => this.setFocusedIndex(index));
        });
    }

    handleSearchInput(e) {
        const query = e.target.value;
        this.searchQuery = query;

        // Clear any existing debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce the search
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, this.config.debounceMs);
    }

    handleSearchKeydown(e) {
        // Allow arrow keys to navigate options while in search input
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.moveFocus(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.moveFocus(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.focusedIndex >= 0) {
                this.selectOption(this.focusedIndex);
            }
        }
    }

    async performSearch(query) {
        // Check minimum search length
        if (query.length < this.config.minSearchLength) {
            if (this.config.dataSource) {
                // For async, show empty until min length
                this.options = [];
                this.updateOptionsDisplay();
            } else {
                // For static, show all options
                this.options = [...this.originalOptions];
                this.updateOptionsDisplay();
            }
            return;
        }

        // If we have a dataSource, use async loading
        if (this.config.dataSource) {
            await this.loadDataAsync(query);
        } else {
            // Filter local options
            this.filterLocalOptions(query);
        }
    }

    async loadDataAsync(query) {
        this.isLoading = true;
        this.updateOptionsDisplay();

        try {
            const results = await this.config.dataSource(query);
            this.options = results.map(opt =>
                typeof opt === 'string' ? { value: opt, label: opt } : opt
            );
        } catch (error) {
            console.error('M3DropdownMenu: Error loading data', error);
            this.options = [];
        } finally {
            this.isLoading = false;
            this.updateOptionsDisplay();
        }
    }

    filterLocalOptions(query) {
        const lowerQuery = query.toLowerCase();
        this.options = this.originalOptions.filter(opt =>
            opt.label.toLowerCase().includes(lowerQuery) ||
            (opt.description && opt.description.toLowerCase().includes(lowerQuery))
        );
        this.updateOptionsDisplay();
    }

    updateOptionsDisplay() {
        if (!this.optionsContainer) return;

        this.optionsContainer.innerHTML = this.renderOptions();
        this.cacheOptionElements();
        this.bindOptionEvents();

        // Reset focus
        this.focusedIndex = this.options.length > 0 ? 0 : -1;
        this.updateFocusedOption();
    }

    clearSearch() {
        this.searchQuery = '';
        if (this.searchInput) {
            this.searchInput.value = '';
        }

        // Reset to original options or clear for async
        if (this.config.dataSource) {
            this.options = [];
        } else {
            this.options = [...this.originalOptions];
        }

        this.updateOptionsDisplay();

        // Update search input UI (remove clear button)
        const searchContainer = this.dropdown.querySelector('.m3-dropdown__search');
        if (searchContainer) {
            searchContainer.innerHTML = this.renderSearchInput().replace(/<div class="m3-dropdown__search">|<\/div>$/g, '');
            this.searchInput = this.dropdown.querySelector('.m3-dropdown__search-input');
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
                this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
                this.searchInput.addEventListener('click', (e) => e.stopPropagation());
                this.searchInput.focus();
            }
        }
    }

    handleKeydown(e) {
        if (this.config.disabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                // Don't toggle when typing in search
                if (this.searchInput && document.activeElement === this.searchInput) {
                    if (e.key === 'Enter' && this.focusedIndex >= 0) {
                        e.preventDefault();
                        this.selectOption(this.focusedIndex);
                    }
                    return;
                }
                e.preventDefault();
                if (this.isOpen && this.focusedIndex >= 0) {
                    this.selectOption(this.focusedIndex);
                } else {
                    this.toggle();
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) {
                    this.open();
                } else {
                    this.moveFocus(1);
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (!this.isOpen) {
                    this.open();
                } else {
                    this.moveFocus(-1);
                }
                break;

            case 'Home':
                e.preventDefault();
                if (this.isOpen) {
                    this.setFocusedIndex(0);
                }
                break;

            case 'End':
                e.preventDefault();
                if (this.isOpen) {
                    this.setFocusedIndex(this.options.length - 1);
                }
                break;

            case 'Tab':
                if (this.isOpen) {
                    this.close();
                }
                break;

            default:
                // Type-ahead: jump to option starting with pressed letter
                // Skip if searchable and search input has focus
                if (this.searchInput && document.activeElement === this.searchInput) {
                    return;
                }
                if (e.key.length === 1 && this.isOpen) {
                    const char = e.key.toLowerCase();
                    const startIndex = this.focusedIndex >= 0 ? this.focusedIndex + 1 : 0;

                    for (let i = 0; i < this.options.length; i++) {
                        const index = (startIndex + i) % this.options.length;
                        if (this.options[index].label.toLowerCase().startsWith(char)) {
                            this.setFocusedIndex(index);
                            break;
                        }
                    }
                }
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen || this.config.disabled) return;

        this.isOpen = true;
        this.dropdown.setAttribute('aria-expanded', 'true');
        this.dropdown.classList.add('m3-dropdown--open');

        // Position menu
        this.positionMenu();

        // Reset search if searchable
        if (this.config.searchable && !this.config.dataSource) {
            this.options = [...this.originalOptions];
            this.updateOptionsDisplay();
        }

        // Focus on search input if searchable, otherwise on selected option
        if (this.config.searchable && this.searchInput) {
            setTimeout(() => this.searchInput.focus(), 10);
            this.focusedIndex = this.options.length > 0 ? 0 : -1;
        } else {
            this.focusedIndex = this.selectedIndex >= 0 ? this.selectedIndex : 0;
        }

        this.updateFocusedOption();

        // Scroll selected option into view
        if (this.selectedIndex >= 0 && !this.config.searchable) {
            this.scrollOptionIntoView(this.selectedIndex);
        }
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.dropdown.setAttribute('aria-expanded', 'false');
        this.dropdown.classList.remove('m3-dropdown--open');
        this.focusedIndex = -1;
        this.updateFocusedOption();

        // Clear search on close
        if (this.config.searchable) {
            this.searchQuery = '';
            if (this.searchInput) {
                this.searchInput.value = '';
            }
        }
    }

    positionMenu() {
        const fieldRect = this.field.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate available space above and below
        const spaceBelow = viewportHeight - fieldRect.bottom;
        const spaceAbove = fieldRect.top;

        // Position above if not enough space below
        if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
            this.menu.classList.add('m3-dropdown__menu--above');
        } else {
            this.menu.classList.remove('m3-dropdown__menu--above');
        }
    }

    moveFocus(direction) {
        if (this.options.length === 0) return;

        let newIndex = this.focusedIndex + direction;

        if (newIndex < 0) {
            newIndex = this.options.length - 1;
        } else if (newIndex >= this.options.length) {
            newIndex = 0;
        }

        this.setFocusedIndex(newIndex);
    }

    setFocusedIndex(index) {
        this.focusedIndex = index;
        this.updateFocusedOption();
        this.scrollOptionIntoView(index);
    }

    updateFocusedOption() {
        this.optionElements.forEach((option, index) => {
            if (index === this.focusedIndex) {
                option.classList.add('m3-dropdown__option--focused');
                option.setAttribute('aria-activedescendant', option.id);
            } else {
                option.classList.remove('m3-dropdown__option--focused');
            }
        });
    }

    scrollOptionIntoView(index) {
        const option = this.optionElements[index];
        if (option) {
            option.scrollIntoView({ block: 'nearest' });
        }
    }

    selectOption(index) {
        const option = this.options[index];
        if (!option) return;

        // Find the actual index in originalOptions for consistency
        const originalIndex = this.originalOptions.findIndex(opt => opt.value === option.value);

        const previousValue = this.getValue();
        this.selectedIndex = originalIndex >= 0 ? originalIndex : index;

        // Update hidden input
        const hiddenInput = this.dropdown.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.value = option.value;
        }

        // Update display value
        const valueElement = this.dropdown.querySelector('.m3-dropdown__value');
        if (valueElement) {
            valueElement.textContent = option.label;
        }

        // Update label state
        const labelElement = this.dropdown.querySelector('.m3-dropdown__label');
        if (labelElement) {
            labelElement.classList.add('m3-dropdown__label--float');
        }

        // Update container state
        this.dropdown.classList.add('m3-dropdown--has-value');

        // Close menu
        this.close();
        this.dropdown.focus();

        // Trigger onChange callback
        if (this.config.onChange && previousValue !== option.value) {
            this.config.onChange(option.value, option.label, option);
        }
    }

    // Public API methods
    getValue() {
        if (this.selectedIndex >= 0 && this.originalOptions[this.selectedIndex]) {
            return this.originalOptions[this.selectedIndex].value;
        }
        return null;
    }

    getLabel() {
        if (this.selectedIndex >= 0 && this.originalOptions[this.selectedIndex]) {
            return this.originalOptions[this.selectedIndex].label;
        }
        return null;
    }

    getSelectedOption() {
        if (this.selectedIndex >= 0) {
            return this.originalOptions[this.selectedIndex];
        }
        return null;
    }

    setValue(value) {
        const index = this.originalOptions.findIndex(opt => opt.value === value);
        if (index >= 0) {
            this.selectedIndex = index;
            const option = this.originalOptions[index];

            // Update hidden input
            const hiddenInput = this.dropdown.querySelector('input[type="hidden"]');
            if (hiddenInput) {
                hiddenInput.value = option.value;
            }

            // Update display value
            const valueElement = this.dropdown.querySelector('.m3-dropdown__value');
            if (valueElement) {
                valueElement.textContent = option.label;
            }

            // Update label state
            const labelElement = this.dropdown.querySelector('.m3-dropdown__label');
            if (labelElement) {
                labelElement.classList.add('m3-dropdown__label--float');
            }

            this.dropdown.classList.add('m3-dropdown--has-value');
        }
    }

    setOptions(options, keepSelection = false) {
        const previousValue = this.getValue();

        this.originalOptions = options.map(opt =>
            typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
        this.options = [...this.originalOptions];

        // Restore selection if requested
        if (keepSelection && previousValue !== null) {
            this.selectedIndex = this.originalOptions.findIndex(opt => opt.value === previousValue);
        } else {
            this.selectedIndex = -1;
        }

        // Re-render options
        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = this.renderOptions();
            this.cacheOptionElements();
            this.bindOptionEvents();
        }
    }

    setError(message) {
        this.config.error = message;
        const supportingText = this.dropdown.querySelector('.m3-dropdown__supporting-text');

        if (message) {
            this.dropdown.classList.add('m3-dropdown--error');
            if (supportingText) {
                supportingText.textContent = message;
                supportingText.classList.add('m3-dropdown__supporting-text--error');
            }
        } else {
            this.dropdown.classList.remove('m3-dropdown--error');
            if (supportingText) {
                supportingText.textContent = this.config.supportingText || '';
                supportingText.classList.remove('m3-dropdown__supporting-text--error');
            }
        }
    }

    clearError() {
        this.setError(null);
    }

    setDisabled(disabled) {
        this.config.disabled = disabled;
        this.dropdown.classList.toggle('m3-dropdown--disabled', disabled);
        this.dropdown.setAttribute('aria-disabled', disabled);
        this.dropdown.tabIndex = disabled ? -1 : 0;
    }

    clear() {
        this.selectedIndex = -1;

        // Update hidden input
        const hiddenInput = this.dropdown.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.value = '';
        }

        // Update display value
        const valueElement = this.dropdown.querySelector('.m3-dropdown__value');
        if (valueElement) {
            valueElement.textContent = '';
        }

        // Update label state
        const labelElement = this.dropdown.querySelector('.m3-dropdown__label');
        if (labelElement) {
            labelElement.classList.remove('m3-dropdown__label--float');
        }

        this.dropdown.classList.remove('m3-dropdown--has-value');
    }

    refresh() {
        this.init();
    }

    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Remove document event listeners to prevent memory leaks
        if (this.boundHandleOutsideClick) {
            document.removeEventListener('click', this.boundHandleOutsideClick);
        }
        if (this.boundHandleEscapeKey) {
            document.removeEventListener('keydown', this.boundHandleEscapeKey);
        }

        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default M3DropdownMenu;
