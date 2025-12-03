/**
 * ThemeBuilder.js - Material Design 3 Dynamic Theming System
 * SSI Builders v2.6.0
 *
 * Generates complete M3 color palettes from a single seed color
 * and applies them as CSS custom properties across all SSI Builders.
 *
 * Features:
 * - Seed color to full palette generation (HCT color space)
 * - Light and Dark theme variants
 * - Real-time CSS variable updates
 * - Integration with GlobalConfig (via GlobalConfig importing ThemeBuilder)
 * - Preset themes (Google Blue, Material Purple, etc.)
 *
 * NOTE: This module does NOT import GlobalConfig to avoid circular imports.
 * GlobalConfig imports ThemeBuilder and manages the integration.
 *
 * @version 2.6.0
 */

/**
 * Color utility functions for M3 color generation
 * Based on Material Color Utilities algorithm (simplified)
 */
class ColorUtils {
    /**
     * Convert hex to RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex
     */
    static rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Convert RGB to HSL
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    /**
     * Convert HSL to RGB
     */
    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Adjust lightness of a color
     */
    static adjustLightness(hex, amount) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.l = Math.max(0, Math.min(100, hsl.l + amount));

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Set specific lightness
     */
    static setLightness(hex, lightness) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.l = lightness;

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Adjust saturation of a color
     */
    static adjustSaturation(hex, amount) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.s = Math.max(0, Math.min(100, hsl.s + amount));

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Shift hue by degrees
     */
    static shiftHue(hex, degrees) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.h = (hsl.h + degrees + 360) % 360;

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Get contrasting text color (black or white)
     */
    static getContrastColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return '#ffffff';

        // Calculate relative luminance
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#1c1b1f' : '#ffffff';
    }

    /**
     * Blend two colors
     */
    static blend(hex1, hex2, amount = 0.5) {
        const rgb1 = this.hexToRgb(hex1);
        const rgb2 = this.hexToRgb(hex2);
        if (!rgb1 || !rgb2) return hex1;

        return this.rgbToHex(
            Math.round(rgb1.r + (rgb2.r - rgb1.r) * amount),
            Math.round(rgb1.g + (rgb2.g - rgb1.g) * amount),
            Math.round(rgb1.b + (rgb2.b - rgb1.b) * amount)
        );
    }
}

/**
 * ThemeBuilder - Main class for dynamic theming
 */
export class ThemeBuilder {
    static instance = null;
    static presets = {
        // Google Blue (Default)
        'google-blue': {
            seed: '#1a73e8',
            name: 'Google Blue'
        },
        // Material Purple
        'material-purple': {
            seed: '#6750A4',
            name: 'Material Purple'
        },
        // Teal
        'teal': {
            seed: '#009688',
            name: 'Teal'
        },
        // Orange
        'orange': {
            seed: '#ff5722',
            name: 'Deep Orange'
        },
        // Green
        'green': {
            seed: '#4caf50',
            name: 'Green'
        },
        // Pink
        'pink': {
            seed: '#e91e63',
            name: 'Pink'
        },
        // Indigo
        'indigo': {
            seed: '#3f51b5',
            name: 'Indigo'
        },
        // Cyan
        'cyan': {
            seed: '#00bcd4',
            name: 'Cyan'
        }
    };

    /**
     * @param {Object} config - Configuration object
     * @param {string} config.seedColor - Primary seed color (hex)
     * @param {boolean} config.darkMode - Start in dark mode
     * @param {boolean} config.autoApply - Apply theme immediately
     * @param {Object} config.customColors - Override specific colors
     */
    constructor(config = {}) {
        this.seedColor = config.seedColor || '#1a73e8';
        // Check if dark mode classes were already applied by inline script in <head>
        // This ensures persistence across page loads
        const domHasDarkMode = document.documentElement.classList.contains('dark-mode') ||
                               document.documentElement.classList.contains('m3-dark');
        // IMPORTANT: Only use DOM state if config.darkMode is NOT explicitly provided
        // Using `!== undefined` because `false` should be respected as an explicit value
        this.darkMode = config.darkMode !== undefined ? config.darkMode : (domHasDarkMode || false);
        this.customColors = config.customColors || {};
        this.palette = {};
        this.callbacks = [];

        // Generate initial palette
        this.generatePalette();

        // Auto-apply if requested
        if (config.autoApply !== false) {
            this.apply();
        }

        // Store as singleton for global access
        ThemeBuilder.instance = this;
    }

    /**
     * Get current ThemeBuilder instance
     */
    static getInstance() {
        if (!ThemeBuilder.instance) {
            ThemeBuilder.instance = new ThemeBuilder();
        }
        return ThemeBuilder.instance;
    }

    /**
     * Quick apply from preset
     */
    static applyPreset(presetName, darkMode = false) {
        const preset = ThemeBuilder.presets[presetName];
        if (!preset) {
            console.error(`Unknown preset: ${presetName}`);
            return null;
        }

        return new ThemeBuilder({
            seedColor: preset.seed,
            darkMode,
            autoApply: true
        });
    }

    /**
     * Generate complete M3 color palette from seed color
     */
    generatePalette() {
        const seed = this.seedColor;

        // === Primary Tones ===
        // M3 uses specific lightness values for different roles
        const primaryTones = {
            0: ColorUtils.setLightness(seed, 0),
            10: ColorUtils.setLightness(seed, 10),
            20: ColorUtils.setLightness(seed, 20),
            30: ColorUtils.setLightness(seed, 30),
            40: ColorUtils.setLightness(seed, 40),
            50: ColorUtils.setLightness(seed, 50),
            60: ColorUtils.setLightness(seed, 60),
            70: ColorUtils.setLightness(seed, 70),
            80: ColorUtils.setLightness(seed, 80),
            90: ColorUtils.setLightness(seed, 90),
            95: ColorUtils.setLightness(seed, 95),
            99: ColorUtils.setLightness(seed, 99),
            100: '#ffffff'
        };

        // === Secondary (desaturated primary, shifted hue slightly) ===
        const secondarySeed = ColorUtils.adjustSaturation(ColorUtils.shiftHue(seed, 15), -30);
        const secondaryTones = {
            0: '#000000',
            10: ColorUtils.setLightness(secondarySeed, 10),
            20: ColorUtils.setLightness(secondarySeed, 20),
            30: ColorUtils.setLightness(secondarySeed, 30),
            40: ColorUtils.setLightness(secondarySeed, 40),
            50: ColorUtils.setLightness(secondarySeed, 50),
            60: ColorUtils.setLightness(secondarySeed, 60),
            70: ColorUtils.setLightness(secondarySeed, 70),
            80: ColorUtils.setLightness(secondarySeed, 80),
            90: ColorUtils.setLightness(secondarySeed, 90),
            95: ColorUtils.setLightness(secondarySeed, 95),
            100: '#ffffff'
        };

        // === Tertiary (complementary-ish, 60 degree shift) ===
        const tertiarySeed = ColorUtils.shiftHue(seed, 60);
        const tertiaryTones = {
            0: '#000000',
            10: ColorUtils.setLightness(tertiarySeed, 10),
            20: ColorUtils.setLightness(tertiarySeed, 20),
            30: ColorUtils.setLightness(tertiarySeed, 30),
            40: ColorUtils.setLightness(tertiarySeed, 40),
            50: ColorUtils.setLightness(tertiarySeed, 50),
            60: ColorUtils.setLightness(tertiarySeed, 60),
            70: ColorUtils.setLightness(tertiarySeed, 70),
            80: ColorUtils.setLightness(tertiarySeed, 80),
            90: ColorUtils.setLightness(tertiarySeed, 90),
            95: ColorUtils.setLightness(tertiarySeed, 95),
            100: '#ffffff'
        };

        // === Error (fixed red palette) ===
        const errorSeed = '#b3261e';
        const errorTones = {
            10: '#410e0b',
            20: '#601410',
            30: '#8c1d18',
            40: '#b3261e',
            80: '#f2b8b5',
            90: '#f9dedc'
        };

        // === Neutral (for surfaces, based on seed but very desaturated) ===
        const neutralSeed = ColorUtils.adjustSaturation(seed, -90);
        const neutralTones = {
            0: '#000000',
            4: ColorUtils.setLightness(neutralSeed, 4),
            6: ColorUtils.setLightness(neutralSeed, 6),
            10: ColorUtils.setLightness(neutralSeed, 10),
            12: ColorUtils.setLightness(neutralSeed, 12),
            17: ColorUtils.setLightness(neutralSeed, 17),
            20: ColorUtils.setLightness(neutralSeed, 20),
            22: ColorUtils.setLightness(neutralSeed, 22),
            24: ColorUtils.setLightness(neutralSeed, 24),
            30: ColorUtils.setLightness(neutralSeed, 30),
            40: ColorUtils.setLightness(neutralSeed, 40),
            50: ColorUtils.setLightness(neutralSeed, 50),
            60: ColorUtils.setLightness(neutralSeed, 60),
            70: ColorUtils.setLightness(neutralSeed, 70),
            80: ColorUtils.setLightness(neutralSeed, 80),
            87: ColorUtils.setLightness(neutralSeed, 87),
            90: ColorUtils.setLightness(neutralSeed, 90),
            92: ColorUtils.setLightness(neutralSeed, 92),
            94: ColorUtils.setLightness(neutralSeed, 94),
            95: ColorUtils.setLightness(neutralSeed, 95),
            96: ColorUtils.setLightness(neutralSeed, 96),
            98: ColorUtils.setLightness(neutralSeed, 98),
            99: ColorUtils.setLightness(neutralSeed, 99),
            100: '#ffffff'
        };

        // === Neutral Variant (for outlines, slightly more saturated) ===
        const neutralVariantSeed = ColorUtils.adjustSaturation(seed, -70);
        const neutralVariantTones = {
            30: ColorUtils.setLightness(neutralVariantSeed, 30),
            50: ColorUtils.setLightness(neutralVariantSeed, 50),
            60: ColorUtils.setLightness(neutralVariantSeed, 60),
            80: ColorUtils.setLightness(neutralVariantSeed, 80),
            90: ColorUtils.setLightness(neutralVariantSeed, 90)
        };

        // Store palette
        this.palette = {
            primary: primaryTones,
            secondary: secondaryTones,
            tertiary: tertiaryTones,
            error: errorTones,
            neutral: neutralTones,
            neutralVariant: neutralVariantTones
        };

        return this.palette;
    }

    /**
     * Get color scheme for light mode
     */
    getLightScheme() {
        const p = this.palette;
        return {
            // Primary
            primary: p.primary[40],
            onPrimary: p.primary[100],
            primaryContainer: p.primary[90],
            onPrimaryContainer: p.primary[10],

            // Secondary
            secondary: p.secondary[40],
            onSecondary: '#ffffff',
            secondaryContainer: p.secondary[90],
            onSecondaryContainer: p.secondary[10],

            // Tertiary
            tertiary: p.tertiary[40],
            onTertiary: '#ffffff',
            tertiaryContainer: p.tertiary[90],
            onTertiaryContainer: p.tertiary[10],

            // Error
            error: p.error[40],
            onError: '#ffffff',
            errorContainer: p.error[90],
            onErrorContainer: p.error[10],

            // Surface
            surface: p.neutral[98],
            surfaceDim: p.neutral[87],
            surfaceBright: p.neutral[98],
            surfaceContainerLowest: p.neutral[100],
            surfaceContainerLow: p.neutral[96],
            surfaceContainer: p.neutral[94],
            surfaceContainerHigh: p.neutral[92],
            surfaceContainerHighest: p.neutral[90],

            // On Surface
            onSurface: p.neutral[10],
            onSurfaceVariant: p.neutralVariant[30],

            // Outline
            outline: p.neutralVariant[50],
            outlineVariant: p.neutralVariant[80],

            // Background
            background: p.neutral[98],
            onBackground: p.neutral[10],

            // Inverse
            inverseSurface: p.neutral[20],
            inverseOnSurface: p.neutral[95],
            inversePrimary: p.primary[80],

            // Scrim
            scrim: 'rgba(0, 0, 0, 0.32)',
            shadow: 'rgba(0, 0, 0, 0.15)'
        };
    }

    /**
     * Get color scheme for dark mode
     */
    getDarkScheme() {
        const p = this.palette;
        return {
            // Primary
            primary: p.primary[80],
            onPrimary: p.primary[20],
            primaryContainer: p.primary[30],
            onPrimaryContainer: p.primary[90],

            // Secondary
            secondary: p.secondary[80],
            onSecondary: p.secondary[20],
            secondaryContainer: p.secondary[30],
            onSecondaryContainer: p.secondary[90],

            // Tertiary
            tertiary: p.tertiary[80],
            onTertiary: p.tertiary[20],
            tertiaryContainer: p.tertiary[30],
            onTertiaryContainer: p.tertiary[90],

            // Error
            error: p.error[80],
            onError: p.error[20],
            errorContainer: p.error[30],
            onErrorContainer: p.error[90],

            // Surface
            surface: p.neutral[6],
            surfaceDim: p.neutral[6],
            surfaceBright: p.neutral[24],
            surfaceContainerLowest: p.neutral[4],
            surfaceContainerLow: p.neutral[10],
            surfaceContainer: p.neutral[12],
            surfaceContainerHigh: p.neutral[17],
            surfaceContainerHighest: p.neutral[22],

            // On Surface
            onSurface: p.neutral[90],
            onSurfaceVariant: p.neutralVariant[80],

            // Outline
            outline: p.neutralVariant[60],
            outlineVariant: p.neutralVariant[30],

            // Background
            background: p.neutral[6],
            onBackground: p.neutral[90],

            // Inverse
            inverseSurface: p.neutral[90],
            inverseOnSurface: p.neutral[20],
            inversePrimary: p.primary[40],

            // Scrim
            scrim: 'rgba(0, 0, 0, 0.32)',
            shadow: 'rgba(0, 0, 0, 0.3)'
        };
    }

    /**
     * Apply theme to document as CSS custom properties
     */
    apply() {
        const scheme = this.darkMode ? this.getDarkScheme() : this.getLightScheme();
        const root = document.documentElement;

        // Apply M3 tokens
        const cssVars = {
            // Primary
            '--m3-primary': scheme.primary,
            '--m3-on-primary': scheme.onPrimary,
            '--m3-primary-container': scheme.primaryContainer,
            '--m3-on-primary-container': scheme.onPrimaryContainer,

            // Secondary
            '--m3-secondary': scheme.secondary,
            '--m3-on-secondary': scheme.onSecondary,
            '--m3-secondary-container': scheme.secondaryContainer,
            '--m3-on-secondary-container': scheme.onSecondaryContainer,

            // Tertiary
            '--m3-tertiary': scheme.tertiary,
            '--m3-on-tertiary': scheme.onTertiary,
            '--m3-tertiary-container': scheme.tertiaryContainer,
            '--m3-on-tertiary-container': scheme.onTertiaryContainer,

            // Error
            '--m3-error': scheme.error,
            '--m3-on-error': scheme.onError,
            '--m3-error-container': scheme.errorContainer,
            '--m3-on-error-container': scheme.onErrorContainer,

            // Surface
            '--m3-surface': scheme.surface,
            '--m3-surface-dim': scheme.surfaceDim,
            '--m3-surface-bright': scheme.surfaceBright,
            '--m3-surface-container-lowest': scheme.surfaceContainerLowest,
            '--m3-surface-container-low': scheme.surfaceContainerLow,
            '--m3-surface-container': scheme.surfaceContainer,
            '--m3-surface-container-high': scheme.surfaceContainerHigh,
            '--m3-surface-container-highest': scheme.surfaceContainerHighest,

            // On Surface
            '--m3-on-surface': scheme.onSurface,
            '--m3-on-surface-variant': scheme.onSurfaceVariant,

            // Outline
            '--m3-outline': scheme.outline,
            '--m3-outline-variant': scheme.outlineVariant,

            // Background
            '--m3-background': scheme.background,
            '--m3-on-background': scheme.onBackground,

            // Inverse
            '--m3-inverse-surface': scheme.inverseSurface,
            '--m3-inverse-on-surface': scheme.inverseOnSurface,
            '--m3-inverse-primary': scheme.inversePrimary,

            // Scrim & Shadow
            '--m3-scrim': scheme.scrim,
            '--m3-shadow': scheme.shadow,

            // === Additional M3 tokens for SSI compatibility ===
            '--m3-surface-variant': scheme.surfaceContainerHigh,
            '--m3-primary-dark': this.darkMode ? this.palette.primary[90] : this.palette.primary[30],
            '--m3-primary-darker': this.darkMode ? this.palette.primary[95] : this.palette.primary[20],

            // Semantic colors (fixed, not from seed)
            '--m3-success': '#2e7d32',
            '--m3-warning': '#ed6c02',
            '--m3-info': '#0288d1',

            // === SSI Builder Legacy Tokens (for backwards compatibility) ===
            '--ssi-primary': scheme.primary,
            '--ssi-primary-hover': this.darkMode ? this.palette.primary[90] : this.palette.primary[30],
            '--ssi-primary-light': scheme.primaryContainer,
            '--ssi-secondary': scheme.secondary,
            '--ssi-text-primary': scheme.onSurface,
            '--ssi-text-secondary': scheme.onSurfaceVariant,
            '--ssi-text-muted': scheme.outline,
            '--ssi-border': scheme.outlineVariant,
            '--ssi-bg-page': scheme.background,
            '--ssi-bg-card': scheme.surface,
            '--ssi-bg-hover': scheme.surfaceContainerHigh,
            '--ssi-bg-selected': scheme.primaryContainer,
            '--ssi-background': scheme.surface,
            '--ssi-surface': scheme.surfaceContainer,
            '--ssi-error': scheme.error,
            '--ssi-success': '#2e7d32',
            '--ssi-warning': '#ed6c02',
            '--ssi-info': '#0288d1'
        };

        // Apply all CSS variables
        Object.entries(cssVars).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Toggle dark mode class
        if (this.darkMode) {
            root.classList.add('m3-dark', 'dark-mode');
        } else {
            root.classList.remove('m3-dark', 'dark-mode');
        }

        // Notify callbacks
        this.callbacks.forEach(cb => cb(this.getThemeInfo()));

        return this;
    }

    /**
     * Set new seed color and regenerate
     */
    setSeedColor(hex) {
        this.seedColor = hex;
        this.generatePalette();
        this.apply();
        return this;
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.apply();
        return this;
    }

    /**
     * Set dark mode explicitly
     */
    setDarkMode(enabled) {
        this.darkMode = enabled;
        this.apply();
        return this;
    }

    /**
     * Register callback for theme changes
     */
    onChange(callback) {
        this.callbacks.push(callback);
        return this;
    }

    /**
     * Get current theme info
     */
    getThemeInfo() {
        return {
            seedColor: this.seedColor,
            darkMode: this.darkMode,
            scheme: this.darkMode ? this.getDarkScheme() : this.getLightScheme(),
            palette: this.palette
        };
    }

    /**
     * Export theme as CSS
     */
    exportCSS() {
        const lightScheme = this.getLightScheme();
        const darkScheme = this.getDarkScheme();

        let css = `/* Generated M3 Theme from seed: ${this.seedColor} */\n\n`;
        css += `:root {\n`;

        // Light mode variables
        Object.entries(lightScheme).forEach(([key, value]) => {
            const cssVar = '--m3-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `    ${cssVar}: ${value};\n`;
        });

        css += `}\n\n`;
        css += `.m3-dark {\n`;

        // Dark mode variables
        Object.entries(darkScheme).forEach(([key, value]) => {
            const cssVar = '--m3-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `    ${cssVar}: ${value};\n`;
        });

        css += `}\n`;

        return css;
    }

    /**
     * Destroy instance
     */
    destroy() {
        this.callbacks = [];
        if (ThemeBuilder.instance === this) {
            ThemeBuilder.instance = null;
        }
    }
}

// Export utilities for advanced usage
export { ColorUtils };
