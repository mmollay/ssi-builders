/**
 * version.js - SSI Builders Version Badge Utility
 *
 * Provides version number display for all Builder components
 * Reads from package.json during build
 */

// Version wird aus package.json gelesen
const VERSION = '1.2.1';

/**
 * Returns the current SSI Builders version
 * @returns {string} Version number
 */
export function getVersion() {
    return VERSION;
}

/**
 * Creates a discrete version badge HTML
 * @returns {string} HTML for version badge
 */
export function createVersionBadge() {
    return `
        <div class="ssi-version-badge" title="SSI Builders v${VERSION}">
            v${VERSION}
        </div>
    `;
}
