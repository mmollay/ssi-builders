/**
 * M3Slider - Material Design 3 Slider Component
 * SSI Builders v2.4.0
 *
 * Framework-agnostic, Vanilla JavaScript implementation
 * Following M3 spec: https://m3.material.io/components/sliders/overview
 *
 * @example
 * const slider = new M3Slider({
 *     containerId: 'volume-slider',
 *     label: 'Volume',
 *     min: 0,
 *     max: 100,
 *     value: 50,
 *     onChange: (value) => console.log(value)
 * });
 */

export class M3Slider {
    static instanceCount = 0;

    constructor(config) {
        this.config = {
            containerId: null,
            label: '',
            min: 0,
            max: 100,
            value: 50,
            step: 1,
            discrete: false, // Discrete vs continuous
            showTicks: false, // Show tick marks (discrete only)
            showValueIndicator: true, // Show value tooltip on drag
            disabled: false,
            size: 'md', // 'sm', 'md', 'lg'
            name: null,
            onChange: null,
            onChangeEnd: null, // Fired when drag ends
            ...config
        };

        this.instanceId = `m3-slider-${++M3Slider.instanceCount}`;
        this.isDragging = false;
        this.currentValue = this.clampValue(this.config.value);

        this.init();
    }

    init() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`M3Slider: Container #${this.config.containerId} not found`);
            return;
        }

        container.innerHTML = this.render();
        this.container = container;
        this.bindEvents();
    }

    clampValue(value) {
        const { min, max, step } = this.config;
        // Clamp to min/max
        let clamped = Math.min(max, Math.max(min, value));
        // Snap to step
        if (step > 0) {
            clamped = Math.round((clamped - min) / step) * step + min;
            // Ensure we don't exceed max due to rounding
            clamped = Math.min(max, clamped);
        }
        return clamped;
    }

    getPercentage(value) {
        const { min, max } = this.config;
        return ((value - min) / (max - min)) * 100;
    }

    render() {
        const { label, min, max, discrete, showTicks, showValueIndicator, disabled, size, name } = this.config;
        const percentage = this.getPercentage(this.currentValue);

        const sizeClass = size !== 'md' ? `m3-slider--${size}` : '';
        const discreteClass = discrete ? 'm3-slider--discrete' : '';
        const disabledClass = disabled ? 'm3-slider--disabled' : '';

        return `
            <div class="m3-slider ${sizeClass} ${discreteClass} ${disabledClass}"
                 id="${this.instanceId}"
                 role="slider"
                 aria-valuemin="${min}"
                 aria-valuemax="${max}"
                 aria-valuenow="${this.currentValue}"
                 aria-label="${label || 'Slider'}"
                 ${disabled ? 'aria-disabled="true"' : ''}
                 tabindex="${disabled ? -1 : 0}">

                ${label ? `
                    <div class="m3-slider__label">
                        <span>${label}</span>
                        <span class="m3-slider__value">${this.formatValue(this.currentValue)}</span>
                    </div>
                ` : ''}

                <div class="m3-slider__track-container">
                    <div class="m3-slider__track">
                        <div class="m3-slider__track-active" style="width: ${percentage}%"></div>
                        ${showTicks && discrete ? this.renderTicks() : ''}
                    </div>

                    <div class="m3-slider__thumb" style="left: ${percentage}%">
                        ${showValueIndicator ? `
                            <div class="m3-slider__indicator">${this.formatValue(this.currentValue)}</div>
                        ` : ''}
                    </div>
                </div>

                <input type="hidden"
                       name="${name || this.config.containerId}"
                       value="${this.currentValue}">
            </div>
        `;
    }

    renderTicks() {
        const { min, max, step } = this.config;
        const tickCount = Math.floor((max - min) / step) + 1;
        let ticks = '';

        for (let i = 0; i < tickCount; i++) {
            const value = min + (i * step);
            const percentage = this.getPercentage(value);
            const isActive = value <= this.currentValue;
            ticks += `<div class="m3-slider__tick ${isActive ? 'm3-slider__tick--active' : ''}"
                          style="left: ${percentage}%"
                          data-value="${value}"></div>`;
        }

        return `<div class="m3-slider__ticks">${ticks}</div>`;
    }

    formatValue(value) {
        // Round to avoid floating point issues
        return Number(value.toFixed(2)).toString();
    }

    bindEvents() {
        const slider = document.getElementById(this.instanceId);
        if (!slider) return;

        this.slider = slider;
        this.track = slider.querySelector('.m3-slider__track');
        this.thumb = slider.querySelector('.m3-slider__thumb');
        this.trackActive = slider.querySelector('.m3-slider__track-active');
        this.valueIndicator = slider.querySelector('.m3-slider__indicator');
        this.valueDisplay = slider.querySelector('.m3-slider__value');
        this.hiddenInput = slider.querySelector('input[type="hidden"]');

        // Mouse events
        this.thumb.addEventListener('mousedown', (e) => this.startDrag(e));
        this.track.addEventListener('click', (e) => this.handleTrackClick(e));

        // Touch events
        this.thumb.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

        // Keyboard events
        slider.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Global mouse/touch move and up
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
        document.addEventListener('touchmove', (e) => this.handleDrag(e), { passive: false });
        document.addEventListener('touchend', (e) => this.endDrag(e));
    }

    startDrag(e) {
        if (this.config.disabled) return;
        e.preventDefault();

        this.isDragging = true;
        this.slider.classList.add('m3-slider--dragging');
        this.thumb.classList.add('m3-slider__thumb--active');
    }

    handleDrag(e) {
        if (!this.isDragging || this.config.disabled) return;
        e.preventDefault();

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        this.updateValueFromPosition(clientX);
    }

    endDrag(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.slider.classList.remove('m3-slider--dragging');
        this.thumb.classList.remove('m3-slider__thumb--active');

        if (this.config.onChangeEnd) {
            this.config.onChangeEnd(this.currentValue);
        }
    }

    handleTrackClick(e) {
        if (this.config.disabled) return;
        this.updateValueFromPosition(e.clientX);

        if (this.config.onChangeEnd) {
            this.config.onChangeEnd(this.currentValue);
        }
    }

    updateValueFromPosition(clientX) {
        const trackRect = this.track.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((clientX - trackRect.left) / trackRect.width) * 100));
        const { min, max } = this.config;
        const rawValue = min + (percentage / 100) * (max - min);
        const newValue = this.clampValue(rawValue);

        if (newValue !== this.currentValue) {
            this.setValue(newValue, true);
        }
    }

    handleKeydown(e) {
        if (this.config.disabled) return;

        const { min, max, step } = this.config;
        let newValue = this.currentValue;
        const bigStep = step * 10;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                e.preventDefault();
                newValue = this.clampValue(this.currentValue + step);
                break;

            case 'ArrowLeft':
            case 'ArrowDown':
                e.preventDefault();
                newValue = this.clampValue(this.currentValue - step);
                break;

            case 'PageUp':
                e.preventDefault();
                newValue = this.clampValue(this.currentValue + bigStep);
                break;

            case 'PageDown':
                e.preventDefault();
                newValue = this.clampValue(this.currentValue - bigStep);
                break;

            case 'Home':
                e.preventDefault();
                newValue = min;
                break;

            case 'End':
                e.preventDefault();
                newValue = max;
                break;

            default:
                return;
        }

        if (newValue !== this.currentValue) {
            this.setValue(newValue, true);
            if (this.config.onChangeEnd) {
                this.config.onChangeEnd(newValue);
            }
        }
    }

    // Public API methods
    getValue() {
        return this.currentValue;
    }

    setValue(value, triggerCallback = false) {
        const newValue = this.clampValue(value);
        const previousValue = this.currentValue;
        this.currentValue = newValue;

        // Update UI
        const percentage = this.getPercentage(newValue);

        if (this.thumb) {
            this.thumb.style.left = `${percentage}%`;
        }

        if (this.trackActive) {
            this.trackActive.style.width = `${percentage}%`;
        }

        if (this.valueIndicator) {
            this.valueIndicator.textContent = this.formatValue(newValue);
        }

        if (this.valueDisplay) {
            this.valueDisplay.textContent = this.formatValue(newValue);
        }

        if (this.hiddenInput) {
            this.hiddenInput.value = newValue;
        }

        // Update ARIA
        if (this.slider) {
            this.slider.setAttribute('aria-valuenow', newValue);
        }

        // Update tick marks if discrete
        if (this.config.discrete && this.config.showTicks) {
            this.updateTicks();
        }

        // Trigger callback
        if (triggerCallback && this.config.onChange && previousValue !== newValue) {
            this.config.onChange(newValue);
        }
    }

    updateTicks() {
        const ticks = this.slider.querySelectorAll('.m3-slider__tick');
        ticks.forEach(tick => {
            const tickValue = parseFloat(tick.dataset.value);
            tick.classList.toggle('m3-slider__tick--active', tickValue <= this.currentValue);
        });
    }

    setDisabled(disabled) {
        this.config.disabled = disabled;
        this.slider.classList.toggle('m3-slider--disabled', disabled);
        this.slider.setAttribute('aria-disabled', disabled);
        this.slider.tabIndex = disabled ? -1 : 0;
    }

    setMin(min) {
        this.config.min = min;
        this.slider.setAttribute('aria-valuemin', min);
        // Re-clamp current value
        this.setValue(this.currentValue);
    }

    setMax(max) {
        this.config.max = max;
        this.slider.setAttribute('aria-valuemax', max);
        // Re-clamp current value
        this.setValue(this.currentValue);
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default M3Slider;
