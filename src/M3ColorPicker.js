/**
 * M3ColorPicker - Material Design 3 Color Picker
 * SSI Builders v2.4.0
 *
 * Framework-agnostic, Vanilla JavaScript implementation
 * Features: HSV color area, Hue slider, Alpha slider, Presets
 *
 * @example
 * const picker = new M3ColorPicker({
 *     containerId: 'color-picker',
 *     label: 'Primary Color',
 *     value: '#1a73e8',
 *     onChange: (color) => console.log(color)
 * });
 */

export class M3ColorPicker {
    static instanceCount = 0;

    // Default preset colors (Material Design palette)
    static defaultPresets = [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7',
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
        '#009688', '#4caf50', '#8bc34a', '#cddc39',
        '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
        '#795548', '#9e9e9e', '#607d8b', '#000000'
    ];

    constructor(config) {
        this.config = {
            containerId: null,
            label: '',
            value: '#1a73e8',
            showAlpha: false,
            presets: M3ColorPicker.defaultPresets,
            disabled: false,
            error: null,
            supportingText: null,
            name: null,
            onChange: null,
            ...config
        };

        this.instanceId = `m3-color-picker-${++M3ColorPicker.instanceCount}`;
        this.isOpen = false;
        this.isDraggingArea = false;
        this.isDraggingHue = false;
        this.isDraggingAlpha = false;

        // Parse initial color
        this.hsva = this.hexToHsva(this.config.value);

        this.init();
    }

    init() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`M3ColorPicker: Container #${this.config.containerId} not found`);
            return;
        }

        container.innerHTML = this.render();
        this.container = container;
        this.bindEvents();
        this.updateUI();
    }

    // Color conversion utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    }

    hsvToRgb(h, s, v) {
        h /= 360; s /= 100; v /= 100;
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    hexToHsva(hex) {
        const rgb = this.hexToRgb(hex);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        return { ...hsv, a: 1 };
    }

    hsvaToHex() {
        const rgb = this.hsvToRgb(this.hsva.h, this.hsva.s, this.hsva.v);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    hsvaToRgba() {
        const rgb = this.hsvToRgb(this.hsva.h, this.hsva.s, this.hsva.v);
        return { ...rgb, a: this.hsva.a };
    }

    getColorString() {
        if (this.config.showAlpha && this.hsva.a < 1) {
            const rgba = this.hsvaToRgba();
            return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a.toFixed(2)})`;
        }
        return this.hsvaToHex();
    }

    render() {
        const { label, disabled, error, supportingText, showAlpha, presets, name } = this.config;
        const hex = this.hsvaToHex();
        const rgba = this.hsvaToRgba();

        const disabledClass = disabled ? 'm3-color-picker--disabled' : '';
        const errorClass = error ? 'm3-color-picker--error' : '';

        return `
            <div class="m3-color-picker ${disabledClass} ${errorClass}"
                 id="${this.instanceId}">

                ${label ? `<div class="m3-color-picker__label">${this.escapeHtml(label)}</div>` : ''}

                <div class="m3-color-picker__container">
                    <!-- Trigger Button -->
                    <button type="button"
                            class="m3-color-picker__trigger"
                            ${disabled ? 'disabled' : ''}
                            aria-haspopup="dialog"
                            aria-expanded="false">
                        <div class="m3-color-picker__swatch">
                            <div class="m3-color-picker__swatch-color" style="background: ${hex}"></div>
                        </div>
                        <span class="m3-color-picker__value">${hex}</span>
                        <span class="m3-color-picker__icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M7 10l5 5 5-5H7z"/>
                            </svg>
                        </span>
                    </button>

                    <!-- Dropdown Panel -->
                    <div class="m3-color-picker__panel" role="dialog" aria-label="Color picker">
                        <!-- Color Area (Saturation/Brightness) -->
                        <div class="m3-color-picker__area" style="background: hsl(${this.hsva.h}, 100%, 50%)">
                            <div class="m3-color-picker__area-gradient m3-color-picker__area-gradient--white"></div>
                            <div class="m3-color-picker__area-gradient m3-color-picker__area-gradient--black"></div>
                            <div class="m3-color-picker__area-handle"></div>
                        </div>

                        <!-- Hue Slider -->
                        <div class="m3-color-picker__hue">
                            <div class="m3-color-picker__hue-handle"></div>
                        </div>

                        ${showAlpha ? `
                            <!-- Alpha Slider -->
                            <div class="m3-color-picker__alpha">
                                <div class="m3-color-picker__alpha-gradient"></div>
                                <div class="m3-color-picker__alpha-handle"></div>
                            </div>
                        ` : ''}

                        <!-- Hex Input -->
                        <div class="m3-color-picker__hex-row">
                            <input type="text"
                                   class="m3-color-picker__hex-input"
                                   value="${hex}"
                                   maxlength="7"
                                   aria-label="Hex color value">
                        </div>

                        <!-- RGBA Inputs -->
                        <div class="m3-color-picker__inputs">
                            <div class="m3-color-picker__input-group">
                                <input type="number" class="m3-color-picker__input" data-channel="r"
                                       value="${rgba.r}" min="0" max="255" aria-label="Red">
                                <span class="m3-color-picker__input-label">R</span>
                            </div>
                            <div class="m3-color-picker__input-group">
                                <input type="number" class="m3-color-picker__input" data-channel="g"
                                       value="${rgba.g}" min="0" max="255" aria-label="Green">
                                <span class="m3-color-picker__input-label">G</span>
                            </div>
                            <div class="m3-color-picker__input-group">
                                <input type="number" class="m3-color-picker__input" data-channel="b"
                                       value="${rgba.b}" min="0" max="255" aria-label="Blue">
                                <span class="m3-color-picker__input-label">B</span>
                            </div>
                            ${showAlpha ? `
                                <div class="m3-color-picker__input-group">
                                    <input type="number" class="m3-color-picker__input" data-channel="a"
                                           value="${Math.round(rgba.a * 100)}" min="0" max="100" aria-label="Alpha">
                                    <span class="m3-color-picker__input-label">A</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Preset Colors -->
                        ${presets && presets.length > 0 ? `
                            <div class="m3-color-picker__presets">
                                ${presets.map(color => `
                                    <button type="button"
                                            class="m3-color-picker__preset ${color.toLowerCase() === hex.toLowerCase() ? 'm3-color-picker__preset--selected' : ''}"
                                            style="background: ${color}"
                                            data-color="${color}"
                                            aria-label="Select ${color}"></button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Hidden Input -->
                <input type="hidden" name="${name || this.config.containerId}" value="${hex}">

                ${supportingText || error ? `
                    <div class="m3-color-picker__supporting-text">
                        ${error || supportingText}
                    </div>
                ` : ''}
            </div>
        `;
    }

    bindEvents() {
        const picker = document.getElementById(this.instanceId);
        if (!picker) return;

        this.picker = picker;
        this.trigger = picker.querySelector('.m3-color-picker__trigger');
        this.panel = picker.querySelector('.m3-color-picker__panel');
        this.area = picker.querySelector('.m3-color-picker__area');
        this.areaHandle = picker.querySelector('.m3-color-picker__area-handle');
        this.hueSlider = picker.querySelector('.m3-color-picker__hue');
        this.hueHandle = picker.querySelector('.m3-color-picker__hue-handle');
        this.alphaSlider = picker.querySelector('.m3-color-picker__alpha');
        this.alphaHandle = picker.querySelector('.m3-color-picker__alpha-handle');
        this.hexInput = picker.querySelector('.m3-color-picker__hex-input');
        this.swatchColor = picker.querySelector('.m3-color-picker__swatch-color');
        this.valueDisplay = picker.querySelector('.m3-color-picker__value');
        this.hiddenInput = picker.querySelector('input[type="hidden"]');

        // Toggle panel
        this.trigger.addEventListener('click', () => this.toggle());

        // Color area events
        this.area.addEventListener('mousedown', (e) => this.startAreaDrag(e));
        this.area.addEventListener('touchstart', (e) => this.startAreaDrag(e), { passive: false });

        // Hue slider events
        this.hueSlider.addEventListener('mousedown', (e) => this.startHueDrag(e));
        this.hueSlider.addEventListener('touchstart', (e) => this.startHueDrag(e), { passive: false });

        // Alpha slider events (if enabled)
        if (this.alphaSlider) {
            this.alphaSlider.addEventListener('mousedown', (e) => this.startAlphaDrag(e));
            this.alphaSlider.addEventListener('touchstart', (e) => this.startAlphaDrag(e), { passive: false });
        }

        // Store bound handlers for cleanup (prevent memory leaks)
        this.boundHandleDrag = (e) => this.handleDrag(e);
        this.boundEndDrag = () => this.endDrag();
        this.boundHandleOutsideClick = (e) => {
            if (!picker.contains(e.target) && this.isOpen) {
                this.close();
            }
        };

        // Global drag events
        document.addEventListener('mousemove', this.boundHandleDrag);
        document.addEventListener('mouseup', this.boundEndDrag);
        document.addEventListener('touchmove', this.boundHandleDrag, { passive: false });
        document.addEventListener('touchend', this.boundEndDrag);

        // Hex input
        this.hexInput.addEventListener('change', (e) => this.handleHexInput(e.target.value));

        // RGB inputs
        picker.querySelectorAll('.m3-color-picker__input').forEach(input => {
            input.addEventListener('change', (e) => this.handleRgbInput(e.target));
        });

        // Preset colors
        picker.querySelectorAll('.m3-color-picker__preset').forEach(preset => {
            preset.addEventListener('click', () => {
                this.setValue(preset.dataset.color);
            });
        });

        // Close on outside click
        document.addEventListener('click', this.boundHandleOutsideClick);

        // Keyboard handling
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.config.disabled) return;
        this.isOpen = true;
        this.picker.classList.add('m3-color-picker--open');
        this.trigger.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.isOpen = false;
        this.picker.classList.remove('m3-color-picker--open');
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    startAreaDrag(e) {
        e.preventDefault();
        this.isDraggingArea = true;
        this.handleAreaDrag(e);
    }

    startHueDrag(e) {
        e.preventDefault();
        this.isDraggingHue = true;
        this.handleHueDrag(e);
    }

    startAlphaDrag(e) {
        e.preventDefault();
        this.isDraggingAlpha = true;
        this.handleAlphaDrag(e);
    }

    handleDrag(e) {
        if (this.isDraggingArea) this.handleAreaDrag(e);
        if (this.isDraggingHue) this.handleHueDrag(e);
        if (this.isDraggingAlpha) this.handleAlphaDrag(e);
    }

    endDrag() {
        this.isDraggingArea = false;
        this.isDraggingHue = false;
        this.isDraggingAlpha = false;
    }

    handleAreaDrag(e) {
        const rect = this.area.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

        this.hsva.s = x * 100;
        this.hsva.v = (1 - y) * 100;

        this.updateUI();
        this.emitChange();
    }

    handleHueDrag(e) {
        const rect = this.hueSlider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this.hsva.h = x * 360;

        this.updateUI();
        this.emitChange();
    }

    handleAlphaDrag(e) {
        if (!this.alphaSlider) return;

        const rect = this.alphaSlider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this.hsva.a = x;

        this.updateUI();
        this.emitChange();
    }

    handleHexInput(value) {
        let hex = value.trim();
        if (!hex.startsWith('#')) hex = '#' + hex;

        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            this.hsva = this.hexToHsva(hex);
            this.updateUI();
            this.emitChange();
        }
    }

    handleRgbInput(input) {
        const channel = input.dataset.channel;
        let value = parseInt(input.value, 10);

        if (channel === 'a') {
            value = Math.max(0, Math.min(100, value)) / 100;
            this.hsva.a = value;
        } else {
            value = Math.max(0, Math.min(255, value));
            const rgba = this.hsvaToRgba();
            rgba[channel] = value;
            const hsv = this.rgbToHsv(rgba.r, rgba.g, rgba.b);
            this.hsva = { ...hsv, a: this.hsva.a };
        }

        this.updateUI();
        this.emitChange();
    }

    updateUI() {
        const hex = this.hsvaToHex();
        const rgba = this.hsvaToRgba();

        // Update color area
        this.area.style.background = `hsl(${this.hsva.h}, 100%, 50%)`;
        this.areaHandle.style.left = `${this.hsva.s}%`;
        this.areaHandle.style.top = `${100 - this.hsva.v}%`;
        this.areaHandle.style.background = hex;

        // Update hue handle
        this.hueHandle.style.left = `${(this.hsva.h / 360) * 100}%`;

        // Update alpha slider (if enabled)
        if (this.alphaSlider && this.alphaHandle) {
            const alphaGradient = this.picker.querySelector('.m3-color-picker__alpha-gradient');
            alphaGradient.style.background = `linear-gradient(to right, transparent, ${hex})`;
            this.alphaHandle.style.left = `${this.hsva.a * 100}%`;
        }

        // Update swatch
        this.swatchColor.style.background = this.getColorString();

        // Update value display
        this.valueDisplay.textContent = hex;

        // Update hex input
        this.hexInput.value = hex;

        // Update RGB inputs
        this.picker.querySelector('[data-channel="r"]').value = rgba.r;
        this.picker.querySelector('[data-channel="g"]').value = rgba.g;
        this.picker.querySelector('[data-channel="b"]').value = rgba.b;

        const alphaInput = this.picker.querySelector('[data-channel="a"]');
        if (alphaInput) {
            alphaInput.value = Math.round(this.hsva.a * 100);
        }

        // Update hidden input
        this.hiddenInput.value = hex;

        // Update preset selection
        this.picker.querySelectorAll('.m3-color-picker__preset').forEach(preset => {
            preset.classList.toggle(
                'm3-color-picker__preset--selected',
                preset.dataset.color.toLowerCase() === hex.toLowerCase()
            );
        });
    }

    emitChange() {
        if (this.config.onChange) {
            const hex = this.hsvaToHex();
            const rgba = this.hsvaToRgba();
            this.config.onChange({
                hex,
                rgb: { r: rgba.r, g: rgba.g, b: rgba.b },
                rgba,
                hsv: { h: this.hsva.h, s: this.hsva.s, v: this.hsva.v },
                hsva: { ...this.hsva }
            });
        }
    }

    // Public API
    getValue() {
        return this.hsvaToHex();
    }

    setValue(value) {
        this.hsva = this.hexToHsva(value);
        this.updateUI();
        this.emitChange();
    }

    setDisabled(disabled) {
        this.config.disabled = disabled;
        this.picker.classList.toggle('m3-color-picker--disabled', disabled);
        this.trigger.disabled = disabled;
        if (disabled && this.isOpen) {
            this.close();
        }
    }

    setError(message) {
        this.config.error = message;
        this.picker.classList.toggle('m3-color-picker--error', !!message);
        const supportingText = this.picker.querySelector('.m3-color-picker__supporting-text');
        if (supportingText) {
            supportingText.textContent = message || this.config.supportingText || '';
        }
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    destroy() {
        // Remove document event listeners to prevent memory leaks
        if (this.boundHandleDrag) {
            document.removeEventListener('mousemove', this.boundHandleDrag);
            document.removeEventListener('mouseup', this.boundEndDrag);
            document.removeEventListener('touchmove', this.boundHandleDrag);
            document.removeEventListener('touchend', this.boundEndDrag);
        }
        if (this.boundHandleOutsideClick) {
            document.removeEventListener('click', this.boundHandleOutsideClick);
        }

        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default M3ColorPicker;
