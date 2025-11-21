/**
 * GlobalConfig - Zentrale Konfiguration für alle SSI Builders
 *
 * Einmal beim App-Start konfigurieren, überall nutzen:
 * - Icon System (Emoji, Lucide, Heroicons, Material, FontAwesome)
 * - Theme/Colors
 * - Default-Einstellungen für alle Builder
 *
 * @example
 * import { GlobalConfig } from '/vendor/ssi-builders/src/index.js';
 *
 * GlobalConfig.configure({
 *     iconPreset: 'lucide',
 *     theme: {
 *         primary: '#1a73e8',
 *         success: '#34a853'
 *     }
 * });
 *
 * @version 1.2.1
 */

import { IconManager } from './IconManager.js';

export class GlobalConfig {
    static config = {
        // Icon System
        iconPreset: 'lucide',
        iconWeight: 'regular',  // 'thin' (1.5, ultra-minimalistisch) | 'regular' (2, default) | 'bold' (2.5, kräftig)

        // Theme Colors (Material Design 3)
        theme: {
            primary: '#1a73e8',      // Blue
            secondary: '#5f6368',    // Gray
            success: '#34a853',      // Green
            danger: '#ea4335',       // Red
            warning: '#fbbc04',      // Yellow
            info: '#4285f4',         // Light Blue
            background: '#ffffff',
            surface: '#f8f9fa',
            text: '#202124',
            textSecondary: '#5f6368',
            border: '#e8eaed'
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

        // Form Defaults
        forms: {
            autoSave: false,
            autoSaveInterval: 2000,     // ms
            submitLabel: 'Speichern',
            cancelLabel: 'Abbrechen',
            resetLabel: 'Zurücksetzen',
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
        }
    };

    /**
     * Konfiguration setzen oder updaten
     * @param {Object} userConfig - Partial config object (wird gemerged mit defaults)
     */
    static configure(userConfig) {
        // Deep merge
        this.config = this._deepMerge(this.config, userConfig);

        // Icon Preset an IconManager weitergeben
        if (userConfig.iconPreset) {
            IconManager.setPreset(userConfig.iconPreset);
        }

        // Icon Weight an IconManager weitergeben
        if (userConfig.iconWeight) {
            IconManager.setIconWeight(userConfig.iconWeight);
        }

        // CSS Custom Properties updaten
        if (userConfig.theme) {
            this._updateCSSVariables(userConfig.theme);
        }

        // Only log in development mode
        if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.log('[GlobalConfig] Configuration updated:', this.config);
        }
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
        if (path === 'iconPreset') {
            IconManager.setPreset(value);
        }

        if (path.startsWith('theme.')) {
            this._updateCSSVariables(this.config.theme);
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
            iconPreset: 'lucide',
            theme: {
                primary: '#1a73e8',
                secondary: '#5f6368',
                success: '#34a853',
                danger: '#ea4335',
                warning: '#fbbc04',
                info: '#4285f4',
                background: '#ffffff',
                surface: '#f8f9fa',
                text: '#202124',
                textSecondary: '#5f6368',
                border: '#e8eaed'
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
                submitLabel: 'Speichern',
                cancelLabel: 'Abbrechen',
                resetLabel: 'Zurücksetzen',
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
            }
        };

        this.config = defaultConfig;
        IconManager.setPreset('lucide');
        this._updateCSSVariables(defaultConfig.theme);
    }

    /**
     * Deep merge von zwei Objekten
     * @private
     */
    static _deepMerge(target, source) {
        const output = { ...target };

        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this._deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }

        return output;
    }

    /**
     * Check ob Wert ein Object ist
     * @private
     */
    static _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * CSS Custom Properties updaten
     * @private
     */
    static _updateCSSVariables(theme) {
        const root = document.documentElement;

        Object.entries(theme).forEach(([key, value]) => {
            const cssVar = `--ssi-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
        });
    }
}

// Auto-initialize CSS Variables on load
if (typeof document !== 'undefined') {
    GlobalConfig._updateCSSVariables(GlobalConfig.config.theme);
}
