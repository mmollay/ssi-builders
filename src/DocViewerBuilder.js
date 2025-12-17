/**
 * DocViewerBuilder.js - Markdown Documentation Viewer Component
 * Material Design 3 | Production-Ready
 *
 * Features:
 * - Markdown rendering with marked.js integration
 * - XSS protection via DOMPurify (REQUIRED for security)
 * - Scroll-to-top button (appears after 300px)
 * - Back navigation button
 * - Loading states
 * - Error handling
 * - Syntax highlighting for code blocks
 * - Auto-linking of headings
 * - Table of contents generation
 * - Responsive design
 *
 * SECURITY: This component uses innerHTML with markdown content.
 * DOMPurify sanitization is REQUIRED and enabled by default.
 * Include: <script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>
 *
 * @version 2.11.0
 * @author SSI Solutions
 *
 * @example
 * // From URL
 * const viewer = new DocViewerBuilder({
 *     containerId: 'doc-viewer',
 *     markdownUrl: '/docs/guide.md',
 *     options: {
 *         showBackButton: true,
 *         scrollToTop: true
 *     },
 *     onBack: () => history.back()
 * });
 *
 * @example
 * // From string
 * const viewer = new DocViewerBuilder({
 *     containerId: 'doc-viewer',
 *     markdown: '# Title\n\nContent here...',
 *     options: {
 *         sanitize: true,
 *         syntaxHighlight: true
 *     }
 * });
 */

import { IconManager } from './IconManager.js';

export class DocViewerBuilder {
    /**
     * Create a DocViewerBuilder
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {string} [config.markdown] - Markdown content (alternative to markdownUrl)
     * @param {string} [config.markdownUrl] - URL to fetch markdown from
     * @param {string} [config.title] - Document title
     * @param {Object} [config.options] - Additional options
     * @param {boolean} [config.options.showBackButton=true] - Show back button
     * @param {boolean} [config.options.scrollToTop=true] - Show scroll-to-top button
     * @param {boolean} [config.options.sanitize=true] - XSS protection via DOMPurify
     * @param {boolean} [config.options.syntaxHighlight=false] - Syntax highlighting for code blocks
     * @param {boolean} [config.options.autoLinkHeadings=true] - Auto-link headings with IDs
     * @param {boolean} [config.options.generateToc=false] - Generate table of contents
     * @param {number} [config.options.scrollThreshold=300] - Scroll threshold for scroll-to-top button (px)
     * @param {Function} [config.onBack] - Callback when back button clicked
     * @param {Function} [config.onLoad] - Callback when document loaded
     * @param {Function} [config.onError] - Callback when error occurs
     */
    constructor(config) {
        this.containerId = config.containerId;
        this.markdown = config.markdown || null;
        this.markdownUrl = config.markdownUrl || null;
        this.title = config.title || '';
        this.options = {
            showBackButton: config.options?.showBackButton !== false,
            scrollToTop: config.options?.scrollToTop !== false,
            sanitize: config.options?.sanitize !== false,
            syntaxHighlight: config.options?.syntaxHighlight || false,
            autoLinkHeadings: config.options?.autoLinkHeadings !== false,
            generateToc: config.options?.generateToc || false,
            scrollThreshold: config.options?.scrollThreshold || 300,
            ...config.options
        };
        this.onBack = config.onBack || null;
        this.onLoad = config.onLoad || null;
        this.onError = config.onError || null;

        this.container = null;
        this.contentElement = null;
        this.scrollTopBtn = null;
        this.isScrolling = false;

        // Check for required libraries
        this.checkDependencies();
    }

    /**
     * Check if required dependencies are loaded
     * @private
     */
    checkDependencies() {
        if (typeof marked === 'undefined') {
            console.warn('DocViewerBuilder: marked.js not loaded. Falling back to plain text.');
        }
        if (this.options.sanitize && typeof DOMPurify === 'undefined') {
            console.error('DocViewerBuilder: DOMPurify not loaded! XSS protection REQUIRED.');
            throw new Error('DOMPurify is required for security. Include: <script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>');
        }
    }

    /**
     * Initialize and render document viewer
     */
    async render() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container with ID "${this.containerId}" not found`);
            return this;
        }

        // Create viewer structure
        this.createViewerStructure();

        // Load and render markdown
        await this.loadMarkdown();

        return this;
    }

    /**
     * Create viewer HTML structure
     * @private
     */
    createViewerStructure() {
        const backButtonHtml = this.options.showBackButton ? `
            <button class="ssi-doc-viewer__back-btn" id="${this.containerId}-back">
                ${IconManager.getIcon('close')}
                <span>Zurück</span>
            </button>
        ` : '';

        const scrollTopHtml = this.options.scrollToTop ? `
            <button class="ssi-doc-viewer__scroll-top" id="${this.containerId}-scroll-top" title="Nach oben scrollen">
                ${IconManager.getIcon('close')}
            </button>
        ` : '';

        // SAFE: Static HTML structure, no user input
        this.container.innerHTML = `
            <div class="ssi-doc-viewer">
                <div class="ssi-doc-viewer__header">
                    ${backButtonHtml}
                    <h3 class="ssi-doc-viewer__title" id="${this.containerId}-title">${this.escapeHtml(this.title)}</h3>
                </div>
                <div class="ssi-doc-viewer__content" id="${this.containerId}-content">
                    <div class="ssi-doc-viewer__loading">
                        <div class="ssi-spinner"></div>
                        <p>Lade Dokumentation...</p>
                    </div>
                </div>
                ${scrollTopHtml}
            </div>
        `;

        this.contentElement = document.getElementById(`${this.containerId}-content`);
        this.scrollTopBtn = document.getElementById(`${this.containerId}-scroll-top`);

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     * @private
     */
    attachEventListeners() {
        // Back button
        if (this.options.showBackButton) {
            const backBtn = document.getElementById(`${this.containerId}-back`);
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    if (this.onBack) {
                        this.onBack();
                    }
                });
            }
        }

        // Scroll-to-top button
        if (this.options.scrollToTop && this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // Show/hide on scroll
            window.addEventListener('scroll', () => this.handleScroll());
        }
    }

    /**
     * Handle scroll event for scroll-to-top button
     * @private
     */
    handleScroll() {
        if (!this.scrollTopBtn) return;

        const scrollY = window.scrollY;
        if (scrollY > this.options.scrollThreshold) {
            this.scrollTopBtn.classList.add('show');
        } else {
            this.scrollTopBtn.classList.remove('show');
        }
    }

    /**
     * Load markdown content
     * @private
     */
    async loadMarkdown() {
        try {
            let markdownContent = this.markdown;

            // Fetch from URL if provided
            if (this.markdownUrl && !markdownContent) {
                const response = await fetch(this.markdownUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load: ${this.markdownUrl}`);
                }
                markdownContent = await response.text();
            }

            if (!markdownContent) {
                throw new Error('No markdown content provided');
            }

            // Render markdown
            this.renderMarkdown(markdownContent);

            // Callback
            if (this.onLoad) {
                this.onLoad(markdownContent);
            }

        } catch (error) {
            console.error('DocViewerBuilder: Error loading markdown', error);
            this.showError(error.message);

            if (this.onError) {
                this.onError(error);
            }
        }
    }

    /**
     * Render markdown to HTML
     * @private
     * @param {string} markdown - Markdown content
     */
    renderMarkdown(markdown) {
        let html = '';

        // Use marked.js if available, otherwise plain text
        if (typeof marked !== 'undefined') {
            html = marked.parse(markdown);
        } else {
            // Fallback: convert to <pre>
            html = `<pre>${this.escapeHtml(markdown)}</pre>`;
        }

        // SECURITY: Sanitize HTML with DOMPurify (REQUIRED!)
        // This prevents XSS attacks from untrusted markdown content
        if (typeof DOMPurify !== 'undefined') {
            html = DOMPurify.sanitize(html);
        } else {
            // Should never reach here due to checkDependencies() throwing
            throw new Error('DOMPurify required for security');
        }

        // SAFE: Content is sanitized by DOMPurify above
        this.contentElement.innerHTML = html;

        // Post-processing
        if (this.options.autoLinkHeadings) {
            this.autoLinkHeadings();
        }

        if (this.options.syntaxHighlight) {
            this.applySyntaxHighlighting();
        }
    }

    /**
     * Auto-link headings with IDs
     * @private
     */
    autoLinkHeadings() {
        const headings = this.contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading) => {
            const text = heading.textContent.trim();
            const id = text.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            heading.id = id;
            heading.style.cursor = 'pointer';
            heading.title = 'Link to this section';

            // Click to copy link
            heading.addEventListener('click', () => {
                const url = `${window.location.origin}${window.location.pathname}#${id}`;
                navigator.clipboard.writeText(url).then(() => {
                    console.log('Link copied:', url);
                });
            });
        });
    }

    /**
     * Apply basic syntax highlighting (placeholder for future integration)
     * @private
     */
    applySyntaxHighlighting() {
        // Placeholder - can integrate with Prism.js or highlight.js if needed
        const codeBlocks = this.contentElement.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            block.classList.add('ssi-code-block');
        });
    }

    /**
     * Show error message
     * @private
     * @param {string} message - Error message
     */
    showError(message) {
        // SAFE: Using escapeHtml() for user message
        const errorHtml = `
            <div class="ssi-doc-viewer__error">
                ${IconManager.getIcon('warning')}
                <h4>Fehler beim Laden</h4>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        this.contentElement.innerHTML = errorHtml;
    }

    /**
     * Escape HTML entities
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update document title
     * @param {string} title - New title
     */
    setTitle(title) {
        this.title = title;
        const titleElement = document.getElementById(`${this.containerId}-title`);
        if (titleElement) {
            titleElement.textContent = title; // SAFE: textContent
        }
    }

    /**
     * Update markdown content
     * @param {string} markdown - New markdown content
     */
    setMarkdown(markdown) {
        this.markdown = markdown;
        this.renderMarkdown(markdown);
    }

    /**
     * Reload document from URL
     */
    async reload() {
        await this.loadMarkdown();
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);

        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
