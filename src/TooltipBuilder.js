/**
 * TooltipBuilder.js - Reusable Tooltip Component
 * Provides accessible, positioned tooltips with Material Design 3 styling
 * 
 * @version 2.3.0
 */

export class TooltipBuilder {
    /**
     * Create a new tooltip
     * @param {Object} options - Tooltip configuration
     * @param {HTMLElement} options.target - Element to attach tooltip to
     * @param {string|HTMLElement} options.content - Tooltip content (text or HTML)
     * @param {string} [options.position='top'] - Position: 'top', 'bottom', 'left', 'right', 'auto'
     * @param {string} [options.trigger='hover'] - Trigger mode: 'hover', 'click', 'manual'
     * @param {number} [options.delay=200] - Show delay in ms (for hover mode)
     * @param {number} [options.hideDelay=0] - Hide delay in ms
     * @param {number} [options.offset=8] - Distance from target element
     * @param {string} [options.className=''] - Additional CSS class
     * @param {boolean} [options.arrow=true] - Show arrow/pointer
     * @param {number} [options.maxWidth=300] - Maximum width in pixels
     */
    constructor(options = {}) {
        // Validate required target
        if (!options.target || !(options.target instanceof HTMLElement)) {
            throw new Error('TooltipBuilder requires a valid target HTMLElement');
        }

        this.target = options.target;
        this.content = options.content || '';
        this.position = options.position || 'top';
        this.trigger = options.trigger || 'hover';
        this.delay = options.delay !== undefined ? options.delay : 200;
        this.hideDelay = options.hideDelay || 0;
        this.offset = options.offset !== undefined ? options.offset : 8;
        this.className = options.className || '';
        this.arrow = options.arrow !== undefined ? options.arrow : true;
        this.maxWidth = options.maxWidth || 300;

        // State
        this.tooltipElement = null;
        this.isVisible = false;
        this.showTimeout = null;
        this.hideTimeout = null;

        // Bind methods
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.updatePosition = this.updatePosition.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize tooltip
     */
    init() {
        // Create tooltip element
        this.createTooltip();

        // Set up event listeners based on trigger mode
        if (this.trigger === 'hover') {
            this.target.addEventListener('mouseenter', this.handleMouseEnter);
            this.target.addEventListener('mouseleave', this.handleMouseLeave);
            this.target.addEventListener('focus', this.handleMouseEnter);
            this.target.addEventListener('blur', this.handleMouseLeave);
        } else if (this.trigger === 'click') {
            this.target.addEventListener('click', this.handleClick);
        }

        // Keyboard support
        this.target.addEventListener('keydown', this.handleKeyDown);

        // ARIA attributes
        this.target.setAttribute('aria-describedby', this.tooltipElement.id);
    }

    /**
     * Create tooltip DOM element
     */
    createTooltip() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = `ssi-tooltip ${this.className}`.trim();
        this.tooltipElement.id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.tooltipElement.setAttribute('role', 'tooltip');
        this.tooltipElement.style.maxWidth = `${this.maxWidth}px`;

        // Set content
        if (typeof this.content === 'string') {
            this.tooltipElement.textContent = this.content;
        } else if (this.content instanceof HTMLElement) {
            this.tooltipElement.appendChild(this.content.cloneNode(true));
        }

        // Add arrow if enabled
        if (this.arrow) {
            const arrow = document.createElement('div');
            arrow.className = 'ssi-tooltip-arrow';
            this.tooltipElement.appendChild(arrow);
        }

        // Add to body (hidden initially)
        this.tooltipElement.style.visibility = 'hidden';
        this.tooltipElement.style.opacity = '0';
        document.body.appendChild(this.tooltipElement);
    }

    /**
     * Handle mouse enter (hover trigger)
     */
    handleMouseEnter() {
        clearTimeout(this.hideTimeout);
        
        if (this.delay > 0) {
            this.showTimeout = setTimeout(() => {
                this.show();
            }, this.delay);
        } else {
            this.show();
        }
    }

    /**
     * Handle mouse leave (hover trigger)
     */
    handleMouseLeave() {
        clearTimeout(this.showTimeout);
        
        if (this.hideDelay > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, this.hideDelay);
        } else {
            this.hide();
        }
    }

    /**
     * Handle click (click trigger)
     */
    handleClick(e) {
        e.stopPropagation();
        this.toggle();

        if (this.isVisible) {
            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', this.handleDocumentClick);
            }, 0);
        }
    }

    /**
     * Handle document click (for click trigger)
     */
    handleDocumentClick() {
        this.hide();
        document.removeEventListener('click', this.handleDocumentClick);
    }

    /**
     * Handle keyboard (ESC to close, Enter/Space to toggle)
     */
    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isVisible) {
            this.hide();
            e.preventDefault();
        } else if ((e.key === 'Enter' || e.key === ' ') && this.trigger === 'click') {
            this.toggle();
            e.preventDefault();
        }
    }

    /**
     * Show tooltip
     */
    show() {
        if (this.isVisible) return;

        this.isVisible = true;
        this.position = this.calculatePosition();
        this.updatePosition();

        // Make visible with animation
        this.tooltipElement.style.visibility = 'visible';
        requestAnimationFrame(() => {
            this.tooltipElement.classList.add('ssi-tooltip-visible');
            this.tooltipElement.style.opacity = '1';
        });

        // Add listeners to reposition on scroll/resize
        window.addEventListener('scroll', this.updatePosition, true);
        window.addEventListener('resize', this.updatePosition, true);

        // Fire custom event
        this.target.dispatchEvent(new CustomEvent('tooltip:show', { 
            detail: { tooltip: this } 
        }));
    }

    /**
     * Hide tooltip
     */
    hide() {
        if (!this.isVisible) return;

        this.isVisible = false;
        this.tooltipElement.classList.remove('ssi-tooltip-visible');
        this.tooltipElement.style.opacity = '0';

        // Remove listeners
        window.removeEventListener('scroll', this.updatePosition, true);
        window.removeEventListener('resize', this.updatePosition, true);

        // Hide after animation
        setTimeout(() => {
            if (!this.isVisible) {
                this.tooltipElement.style.visibility = 'hidden';
            }
        }, 200);

        // Fire custom event
        this.target.dispatchEvent(new CustomEvent('tooltip:hide', { 
            detail: { tooltip: this } 
        }));
    }

    /**
     * Toggle tooltip visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Calculate best position (handles 'auto' and checks viewport bounds)
     */
    calculatePosition() {
        if (this.position !== 'auto') {
            return this.position;
        }

        const targetRect = this.target.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // Check space in each direction
        const space = {
            top: targetRect.top,
            bottom: viewport.height - targetRect.bottom,
            left: targetRect.left,
            right: viewport.width - targetRect.right
        };

        // Prefer top, then bottom, then left, then right
        if (space.top >= tooltipRect.height + this.offset) {
            return 'top';
        } else if (space.bottom >= tooltipRect.height + this.offset) {
            return 'bottom';
        } else if (space.left >= tooltipRect.width + this.offset) {
            return 'left';
        } else {
            return 'right';
        }
    }

    /**
     * Update tooltip position
     */
    updatePosition() {
        const targetRect = this.target.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        let top, left;

        // Reset transform
        this.tooltipElement.style.transform = '';
        
        // Remove previous position classes
        this.tooltipElement.classList.remove('ssi-tooltip-top', 'ssi-tooltip-bottom', 'ssi-tooltip-left', 'ssi-tooltip-right');
        
        // Add current position class
        this.tooltipElement.classList.add(`ssi-tooltip-${this.position}`);

        switch (this.position) {
            case 'top':
                top = targetRect.top + window.scrollY - tooltipRect.height - this.offset;
                left = targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;

            case 'bottom':
                top = targetRect.bottom + window.scrollY + this.offset;
                left = targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;

            case 'left':
                top = targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left + window.scrollX - tooltipRect.width - this.offset;
                break;

            case 'right':
                top = targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + window.scrollX + this.offset;
                break;
        }

        // Apply position
        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left}px`;

        // Adjust if out of viewport bounds
        this.adjustViewportBounds();
    }

    /**
     * Adjust position if tooltip is outside viewport
     */
    adjustViewportBounds() {
        const rect = this.tooltipElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        let adjustX = 0;
        let adjustY = 0;

        // Horizontal adjustment
        if (rect.left < 0) {
            adjustX = -rect.left + 10;
        } else if (rect.right > viewport.width) {
            adjustX = viewport.width - rect.right - 10;
        }

        // Vertical adjustment
        if (rect.top < 0) {
            adjustY = -rect.top + 10;
        } else if (rect.bottom > viewport.height) {
            adjustY = viewport.height - rect.bottom - 10;
        }

        if (adjustX !== 0 || adjustY !== 0) {
            const currentLeft = parseFloat(this.tooltipElement.style.left);
            const currentTop = parseFloat(this.tooltipElement.style.top);
            this.tooltipElement.style.left = `${currentLeft + adjustX}px`;
            this.tooltipElement.style.top = `${currentTop + adjustY}px`;
        }
    }

    /**
     * Update tooltip content
     * @param {string|HTMLElement} content - New content
     */
    setContent(content) {
        this.content = content;
        
        // Clear existing content
        while (this.tooltipElement.firstChild && this.tooltipElement.firstChild.className !== 'ssi-tooltip-arrow') {
            this.tooltipElement.removeChild(this.tooltipElement.firstChild);
        }

        // Set new content
        if (typeof content === 'string') {
            const textNode = document.createTextNode(content);
            this.tooltipElement.insertBefore(textNode, this.tooltipElement.firstChild);
        } else if (content instanceof HTMLElement) {
            this.tooltipElement.insertBefore(content.cloneNode(true), this.tooltipElement.firstChild);
        }

        // Recalculate position if visible
        if (this.isVisible) {
            this.updatePosition();
        }
    }

    /**
     * Destroy tooltip and clean up
     */
    destroy() {
        // Clear timeouts
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);

        // Remove event listeners
        this.target.removeEventListener('mouseenter', this.handleMouseEnter);
        this.target.removeEventListener('mouseleave', this.handleMouseLeave);
        this.target.removeEventListener('focus', this.handleMouseEnter);
        this.target.removeEventListener('blur', this.handleMouseLeave);
        this.target.removeEventListener('click', this.handleClick);
        this.target.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('click', this.handleDocumentClick);
        window.removeEventListener('scroll', this.updatePosition, true);
        window.removeEventListener('resize', this.updatePosition, true);

        // Remove ARIA attribute
        this.target.removeAttribute('aria-describedby');

        // Remove tooltip element
        if (this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
        }

        this.tooltipElement = null;
    }

    /**
     * Static helper: Create and show tooltip in one call
     * @param {Object} options - Tooltip configuration
     * @returns {TooltipBuilder} Tooltip instance
     */
    static create(options) {
        const tooltip = new TooltipBuilder(options);
        if (options.trigger === 'manual') {
            tooltip.show();
        }
        return tooltip;
    }
}

export default TooltipBuilder;
