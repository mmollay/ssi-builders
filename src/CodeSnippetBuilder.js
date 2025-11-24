/**
 * CodeSnippetBuilder - Professional Code Display with Copy Functionality
 * Part of SSI Builders - Material Design 3
 */

import { IconManager } from './IconManager.js';
import { GlobalConfig } from './GlobalConfig.js';

export class CodeSnippetBuilder {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.code - The code to display
     * @param {string} [config.language='javascript'] - Programming language (javascript, html, css, python, etc.)
     * @param {boolean} [config.showLineNumbers] - Show line numbers (defaults to GlobalConfig)
     * @param {boolean} [config.copyButton] - Show copy button (defaults to GlobalConfig)
     * @param {boolean} [config.syntaxHighlighting] - Enable syntax highlighting (defaults to GlobalConfig)
     * @param {string} [config.theme] - Theme: 'dark' | 'light' (defaults to GlobalConfig)
     * @param {string} [config.size] - Size: 'small' | 'medium' | 'large' (defaults to GlobalConfig)
     * @param {string|number} [config.maxHeight] - Max height with scrollbar (defaults to GlobalConfig)
     * @param {string} [config.containerId] - Container element ID (alternative to render target)
     */
    constructor(config = {}) {
        // Get global defaults
        const globalDefaults = GlobalConfig.get('codeSnippets') || {};

        this.config = {
            code: config.code || '',
            language: config.language || 'javascript',
            showLineNumbers: config.showLineNumbers !== undefined ? config.showLineNumbers : globalDefaults.showLineNumbers,
            copyButton: config.copyButton !== undefined ? config.copyButton : globalDefaults.copyButton,
            syntaxHighlighting: config.syntaxHighlighting !== undefined ? config.syntaxHighlighting : globalDefaults.syntaxHighlighting,
            theme: config.theme || globalDefaults.theme || 'dark',
            size: config.size || globalDefaults.size || 'medium',
            maxHeight: config.maxHeight !== undefined ? config.maxHeight : globalDefaults.maxHeight,
            containerId: config.containerId || null
        };

        this.container = null;
        this.codeElement = null;
        this.highlightJsLoaded = false;

        // Auto-render if containerId provided
        if (this.config.containerId) {
            this.render(`#${this.config.containerId}`);
        }
    }

    /**
     * Render the code snippet
     * @param {string} selector - CSS selector for container
     */
    async render(selector) {
        const container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!container) {
            console.error('CodeSnippetBuilder: Container not found', selector);
            return;
        }

        this.container = container;
        this.container.innerHTML = ''; // Clear existing content

        // Load highlight.js if syntax highlighting is enabled
        if (this.config.syntaxHighlighting && !this.highlightJsLoaded) {
            await this.loadHighlightJs();
        }

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = `code-snippet-wrapper code-snippet-${this.config.theme} code-snippet-${this.config.size}`;

        // Create pre/code elements
        const pre = document.createElement('pre');
        pre.className = 'code-snippet-block';

        // Apply maxHeight if specified
        if (this.config.maxHeight) {
            const height = typeof this.config.maxHeight === 'number'
                ? `${this.config.maxHeight}px`
                : this.config.maxHeight;
            pre.style.maxHeight = height;
            pre.style.overflowY = 'auto';
        }

        const code = document.createElement('code');
        code.className = `language-${this.config.language}`;

        if (this.config.showLineNumbers) {
            code.textContent = this.addLineNumbers(this.config.code);
        } else {
            code.textContent = this.config.code;
        }

        this.codeElement = code;
        pre.appendChild(code);
        wrapper.appendChild(pre);

        // Add copy button
        if (this.config.copyButton) {
            const copyBtn = this.createCopyButton();
            wrapper.appendChild(copyBtn);
        }

        this.container.appendChild(wrapper);

        // Apply syntax highlighting
        if (this.config.syntaxHighlighting && window.hljs) {
            window.hljs.highlightElement(code);
        }
    }

    /**
     * Create copy button
     * @returns {HTMLElement}
     */
    createCopyButton() {
        const button = document.createElement('button');
        button.className = 'code-copy-btn';
        button.setAttribute('aria-label', 'Copy code');

        const copyIcon = IconManager.getIcon('copy');
        const checkIcon = IconManager.getIcon('check');

        button.innerHTML = `
            <span class="copy-icon">${copyIcon}</span>
            <span class="copy-text">Copy</span>
        `;

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(this.config.code);

                // Show success feedback
                button.innerHTML = `
                    <span class="copy-icon">${checkIcon}</span>
                    <span class="copy-text">Copied!</span>
                `;
                button.classList.add('copied');

                // Reset after 2 seconds
                setTimeout(() => {
                    button.innerHTML = `
                        <span class="copy-icon">${copyIcon}</span>
                        <span class="copy-text">Copy</span>
                    `;
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        });

        return button;
    }

    /**
     * Add line numbers to code
     * @param {string} code - Code string
     * @returns {string} Code with line numbers
     */
    addLineNumbers(code) {
        const lines = code.split('\n');
        const maxDigits = lines.length.toString().length;

        return lines.map((line, index) => {
            const lineNum = (index + 1).toString().padStart(maxDigits, ' ');
            return `${lineNum} | ${line}`;
        }).join('\n');
    }

    /**
     * Update code content
     * @param {string} newCode - New code content
     */
    updateCode(newCode) {
        this.config.code = newCode;
        if (this.codeElement) {
            if (this.config.showLineNumbers) {
                this.codeElement.textContent = this.addLineNumbers(newCode);
            } else {
                this.codeElement.textContent = newCode;
            }

            // Re-apply syntax highlighting
            if (this.config.syntaxHighlighting && window.hljs) {
                // Remove old highlighting classes
                this.codeElement.removeAttribute('data-highlighted');
                this.codeElement.className = `language-${this.config.language}`;
                // Re-highlight
                window.hljs.highlightElement(this.codeElement);
            }
        }
    }

    /**
     * Get current code content
     * @returns {string}
     */
    getCode() {
        return this.config.code;
    }

    /**
     * Toggle line numbers
     */
    toggleLineNumbers() {
        this.config.showLineNumbers = !this.config.showLineNumbers;
        this.render(this.container);
    }

    /**
     * Change theme
     * @param {string} theme - Theme name (dark, light)
     */
    setTheme(theme) {
        this.config.theme = theme;
        this.render(this.container);
    }

    /**
     * Load highlight.js library dynamically
     * @returns {Promise}
     */
    loadHighlightJs() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.hljs) {
                this.highlightJsLoaded = true;
                resolve();
                return;
            }

            // Load CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = this.config.theme === 'dark'
                ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
            document.head.appendChild(cssLink);

            // Load JS
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            script.onload = () => {
                this.highlightJsLoaded = true;
                resolve();
            };
            script.onerror = () => {
                console.warn('CodeSnippetBuilder: Failed to load highlight.js, falling back to plain code');
                this.config.syntaxHighlighting = false;
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Destroy the code snippet
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
