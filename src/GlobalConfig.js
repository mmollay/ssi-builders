/**
 * GlobalConfig - Zentrale Konfiguration für alle SSI Builders
 *
 * Einmal beim App-Start konfigurieren, überall nutzen:
 * - Language/i18n (de, en, fr)
 * - Icon System (Emoji, Lucide, Heroicons, Material, FontAwesome)
 * - Theme/Colors (via ThemeBuilder M3 System)
 * - Default-Einstellungen für alle Builder
 *
 * @example
 * import { GlobalConfig } from '/vendor/ssi-builders/src/index.js';
 *
 * GlobalConfig.configure({
 *     language: 'de',        // German (default), 'en', 'fr'
 *     iconPreset: 'lucide',
 *     theme: {
 *         seedColor: '#1a73e8',  // M3 seed color
 *         darkMode: false
 *     }
 * });
 *
 * // Or use preset themes:
 * GlobalConfig.setTheme('teal');  // 'google-blue', 'material-purple', 'teal', 'orange', etc.
 *
 * @version 2.6.0
 */

import { IconManager } from './IconManager.js';
import { deepMerge } from './utils.js';
import { i18n } from './i18n.js';
import { ThemeBuilder } from './ThemeBuilder.js';

export class GlobalConfig {
    static config = {
        // Language/i18n
        language: 'de',  // 'de' (German - default) | 'en' (English) | 'fr' (French)

        // Icon System
        iconPreset: 'lucide',
        iconWeight: 'regular',  // 'thin' (1.5, ultra-minimalistisch) | 'regular' (2, default) | 'bold' (2.5, kräftig)

        // Theme (Material Design 3 via ThemeBuilder)
        theme: {
            seedColor: '#1a73e8',    // M3 seed color - generates full palette
            darkMode: false,          // Light/Dark mode
            preset: null              // Optional preset name: 'google-blue', 'teal', 'material-purple', etc.
        },

        // Button Defaults
        buttons: {
            defaultSize: 'medium',      // 'sm' | 'medium' | 'lg'
            defaultType: 'outlined',    // 'primary' | 'outlined' | 'text' | 'danger' | 'success'
            iconSize: 18                // px
        },

        // Modal Defaults
        modals: {
            defaultSize: 'medium',      // 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'fullscreen' | 'side-left' | 'side-right' | 'bottom'
            closeOnBackdrop: true,
            closeOnEsc: true,
            animation: 'fade',          // 'fade' | 'slide' | 'zoom'
            showCloseButton: true
        },

        // Form Defaults (labels use i18n automatically)
        forms: {
            autoSave: false,
            autoSaveInterval: 2000,     // ms
            // Labels are now dynamic via i18n - use GlobalConfig.getLabel('form.submit')
            showCancelButton: false,
            showResetButton: false
        },

        // List Defaults
        lists: {
            itemsPerPage: 20,
            showSearch: true,
            showPagination: true,
            actionDisplayType: 'icon',  // 'icon' | 'emoji' | 'button' | 'button-icon'
            actionButtonType: 'secondary' // 'primary' | 'secondary' | 'danger' | 'success'
        },

        // Chart Defaults
        charts: {
            responsive: true,
            showLegend: true,
            colors: ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#4285f4', '#9334e6', '#e6710a']
        },

        // Tab Defaults
        tabs: {
            style: 'underline',         // 'underline' | 'pill' | 'contained'
            orientation: 'horizontal'   // 'horizontal' | 'vertical'
        },

        // Sidebar Defaults
        sidebar: {
            width: 280,
            collapsible: true,
            persistent: true            // Save state to localStorage
        },

        // Toast Defaults
        toasts: {
            duration: 3000,
            position: 'top-right'       // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
        },

        // Tooltip Defaults
        tooltips: {
            position: 'top',            // 'top' | 'bottom' | 'left' | 'right' | 'auto'
            trigger: 'hover',           // 'hover' | 'click' | 'manual'
            delay: 200,                 // Show delay in ms (hover mode)
            hideDelay: 0,               // Hide delay in ms
            offset: 8,                  // Distance from target element
            arrow: true,                // Show arrow/pointer
            maxWidth: 300               // Maximum width in pixels
        },

        // CodeSnippet Defaults
        codeSnippets: {
            theme: 'dark',              // 'dark' | 'light'
            showLineNumbers: false,     // Show line numbers by default
            copyButton: true,           // Show copy button
            syntaxHighlighting: true,   // Enable syntax highlighting
            size: 'medium',             // 'small' | 'medium' | 'large'
            maxHeight: null             // Max height (null = no limit)
        }
    };

    // ThemeBuilder instance (lazy initialized)
    static _themeBuilder = null;

    /**
     * Konfiguration setzen oder updaten
     * @param {Object} userConfig - Partial config object (wird gemerged mit defaults)
     */
    static configure(userConfig) {
        // Deep merge
        this.config = deepMerge(this.config, userConfig);

        // Language an i18n weitergeben
        if (userConfig.language) {
            i18n.setLanguage(userConfig.language);
        }

        // Icon Preset an IconManager weitergeben
        if (userConfig.iconPreset) {
            IconManager.setPreset(userConfig.iconPreset);
        }

        // Icon Weight an IconManager weitergeben
        if (userConfig.iconWeight) {
            IconManager.setIconWeight(userConfig.iconWeight);
        }

        // Theme via ThemeBuilder updaten
        if (userConfig.theme) {
            if (userConfig.theme.preset) {
                // Use preset theme
                this.setTheme(userConfig.theme.preset, userConfig.theme.darkMode);
            } else if (userConfig.theme.seedColor) {
                // Use custom seed color
                this.setThemeFromSeed(userConfig.theme.seedColor, userConfig.theme.darkMode);
            }
        }

        // Only log in development mode
        if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.log('[GlobalConfig] Configuration updated:', this.config);
        }
    }

    // ============================================
    // Language/i18n Methods
    // ============================================

    /**
     * Set the current language
     * @param {string} lang - Language code ('de', 'en', 'fr')
     */
    static setLanguage(lang) {
        this.config.language = lang;
        i18n.setLanguage(lang);
    }

    /**
     * Get the current language
     * @returns {string} Current language code
     */
    static getLanguage() {
        return this.config.language;
    }

    /**
     * Get available languages
     * @returns {Array} List of available language codes
     */
    static getAvailableLanguages() {
        return i18n.getLanguages();
    }

    /**
     * Get language display names
     * @returns {Object} Language codes mapped to display names
     */
    static getLanguageNames() {
        return i18n.getLanguageNames();
    }

    /**
     * Get a translated label
     * @param {string} key - Translation key (e.g., 'form.submit')
     * @param {Object} params - Interpolation parameters
     * @returns {string} Translated string
     */
    static t(key, params = {}) {
        return i18n.t(key, params);
    }

    /**
     * Listen for language changes
     * @param {Function} callback - Function(newLang, oldLang)
     * @returns {Function} Unsubscribe function
     */
    static onLanguageChange(callback) {
        return i18n.onLanguageChange(callback);
    }

    // ============================================
    // Theme Methods (via ThemeBuilder)
    // ============================================

    /**
     * Set theme from preset name
     * @param {string} presetName - Preset name: 'google-blue', 'material-purple', 'teal', 'orange', 'green', 'pink', 'indigo', 'cyan'
     * @param {boolean} darkMode - Enable dark mode
     * @returns {ThemeBuilder} ThemeBuilder instance
     */
    static setTheme(presetName, darkMode = false) {
        this._themeBuilder = ThemeBuilder.applyPreset(presetName, darkMode);
        this.config.theme.preset = presetName;
        this.config.theme.darkMode = darkMode;
        if (this._themeBuilder) {
            this.config.theme.seedColor = this._themeBuilder.seedColor;
        }
        return this._themeBuilder;
    }

    /**
     * Set theme from custom seed color
     * @param {string} seedColor - Hex color code (e.g., '#1a73e8')
     * @param {boolean} darkMode - Enable dark mode
     * @returns {ThemeBuilder} ThemeBuilder instance
     */
    static setThemeFromSeed(seedColor, darkMode = false) {
        this._themeBuilder = new ThemeBuilder({
            seedColor,
            darkMode,
            autoApply: true
        });
        this.config.theme.seedColor = seedColor;
        this.config.theme.darkMode = darkMode;
        this.config.theme.preset = null;
        return this._themeBuilder;
    }

    /**
     * Toggle dark mode
     * @returns {boolean} New dark mode state
     */
    static toggleDarkMode() {
        if (this._themeBuilder) {
            this._themeBuilder.toggleDarkMode();
            this.config.theme.darkMode = this._themeBuilder.darkMode;
        } else {
            // Initialize with current seed color and toggle
            this.setThemeFromSeed(this.config.theme.seedColor, !this.config.theme.darkMode);
        }
        return this.config.theme.darkMode;
    }

    /**
     * Set dark mode explicitly
     * @param {boolean} enabled - Dark mode enabled
     */
    static setDarkMode(enabled) {
        if (this._themeBuilder) {
            this._themeBuilder.setDarkMode(enabled);
        } else {
            this.setThemeFromSeed(this.config.theme.seedColor, enabled);
        }
        this.config.theme.darkMode = enabled;
    }

    /**
     * Get current theme info
     * @returns {Object} Theme information including seedColor, darkMode, scheme, palette
     */
    static getThemeInfo() {
        if (this._themeBuilder) {
            return this._themeBuilder.getThemeInfo();
        }
        return {
            seedColor: this.config.theme.seedColor,
            darkMode: this.config.theme.darkMode,
            scheme: null,
            palette: null
        };
    }

    /**
     * Get available theme presets
     * @returns {Object} Map of preset names to their info
     */
    static getThemePresets() {
        return ThemeBuilder.presets;
    }

    /**
     * Get ThemeBuilder instance
     * @returns {ThemeBuilder|null}
     */
    static getThemeBuilder() {
        return this._themeBuilder;
    }

    /**
     * Listen for theme changes
     * @param {Function} callback - Called when theme changes
     * @returns {ThemeBuilder} For chaining
     */
    static onThemeChange(callback) {
        if (!this._themeBuilder) {
            // Initialize with default
            this.setThemeFromSeed(this.config.theme.seedColor, this.config.theme.darkMode);
        }
        return this._themeBuilder.onChange(callback);
    }

    /**
     * Einzelnen Config-Wert abrufen
     * @param {string} path - Dot-notation path (z.B. 'buttons.defaultSize')
     * @returns {any}
     */
    static get(path) {
        const keys = path.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Einzelnen Config-Wert setzen
     * @param {string} path - Dot-notation path
     * @param {any} value - Neuer Wert
     */
    static set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let obj = this.config;

        for (const key of keys) {
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }

        obj[lastKey] = value;

        // Special handling
        if (path === 'language') {
            i18n.setLanguage(value);
        }

        if (path === 'iconPreset') {
            IconManager.setPreset(value);
        }

        // Theme changes via ThemeBuilder
        if (path === 'theme.seedColor') {
            this.setThemeFromSeed(value, this.config.theme.darkMode);
        } else if (path === 'theme.darkMode') {
            this.setDarkMode(value);
        } else if (path === 'theme.preset') {
            this.setTheme(value, this.config.theme.darkMode);
        }
    }

    /**
     * Komplette Config zurückgeben
     * @returns {Object}
     */
    static getAll() {
        return { ...this.config };
    }

    /**
     * Config auf Defaults zurücksetzen
     */
    static reset() {
        const defaultConfig = {
            language: 'de',  // German as default
            iconPreset: 'lucide',
            iconWeight: 'regular',
            theme: {
                seedColor: '#1a73e8',
                darkMode: false,
                preset: null
            },
            buttons: {
                defaultSize: 'medium',
                defaultType: 'outlined',
                iconSize: 18
            },
            modals: {
                defaultSize: 'medium',
                closeOnBackdrop: true,
                closeOnEsc: true,
                animation: 'fade',
                showCloseButton: true
            },
            forms: {
                autoSave: false,
                autoSaveInterval: 2000,
                // Labels use i18n automatically
                showCancelButton: false,
                showResetButton: false
            },
            lists: {
                itemsPerPage: 20,
                showSearch: true,
                showPagination: true,
                actionDisplayType: 'icon',
                actionButtonType: 'secondary'
            },
            charts: {
                responsive: true,
                showLegend: true,
                colors: ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#4285f4', '#9334e6', '#e6710a']
            },
            tabs: {
                style: 'underline',
                orientation: 'horizontal'
            },
            sidebar: {
                width: 280,
                collapsible: true,
                persistent: true
            },
            toasts: {
                duration: 3000,
                position: 'top-right'
            },
            tooltips: {
                position: 'top',
                trigger: 'hover',
                delay: 200,
                hideDelay: 0,
                offset: 8,
                arrow: true,
                maxWidth: 300
            },
            codeSnippets: {
                theme: 'dark',
                showLineNumbers: false,
                copyButton: true,
                syntaxHighlighting: true,
                size: 'medium',
                maxHeight: null
            }
        };

        this.config = defaultConfig;
        i18n.setLanguage('de');  // Reset to German
        IconManager.setPreset('lucide');

        // Reset theme via ThemeBuilder
        this.setThemeFromSeed('#1a73e8', false);
    }

}

// Auto-initialize ThemeBuilder with default theme on load
// Use setTimeout to ensure all modules are loaded first
if (typeof document !== 'undefined') {
    // Delay initialization to avoid circular import issues
    setTimeout(() => {
        if (!GlobalConfig._themeBuilder) {
            GlobalConfig.setThemeFromSeed(GlobalConfig.config.theme.seedColor, GlobalConfig.config.theme.darkMode);
        }
    }, 0);
}
