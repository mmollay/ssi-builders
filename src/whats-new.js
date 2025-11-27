/**
 * SSI Builders - What's New Tracking System
 *
 * This file tracks which components have been updated since the last release.
 * When a new version is released, clear the `updatedComponents` array.
 *
 * Usage in Sidebar/Demos:
 *   import { isNew, getNewBadge, updatedComponents } from './whats-new.js';
 *
 *   if (isNew('ListBuilder')) {
 *       // Show badge
 *   }
 */

// Current version being developed
export const currentVersion = '2.4.4';

// Components updated in current development cycle
// CLEAR THIS ARRAY when releasing a new version!
export const updatedComponents = [
    {
        name: 'ListBuilder',
        feature: 'Bulk Actions & Multi-Select',
        description: 'getSelectedRows(), clearSelection(), optimistic UI delete',
        date: '2025-11-27'
    }
];

/**
 * Check if a component has updates in current dev cycle
 * @param {string} componentName - Name of the component (e.g., 'ListBuilder')
 * @returns {boolean}
 */
export function isNew(componentName) {
    return updatedComponents.some(c => c.name === componentName);
}

/**
 * Get update info for a component
 * @param {string} componentName
 * @returns {object|null}
 */
export function getUpdateInfo(componentName) {
    return updatedComponents.find(c => c.name === componentName) || null;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

/**
 * Generate HTML badge for "NEW" indicator
 * @param {string} componentName
 * @param {string} style - 'badge' | 'dot' | 'text'
 * @returns {string} HTML string
 */
export function getNewBadge(componentName, style = 'badge') {
    if (!isNew(componentName)) return '';

    const info = getUpdateInfo(componentName);
    const rawTooltip = info ? `${info.feature} (v${currentVersion})` : `Neu in v${currentVersion}`;
    const tooltip = escapeHtml(rawTooltip);

    switch (style) {
        case 'dot':
            return `<span class="ssi-new-dot" title="${tooltip}"></span>`;
        case 'text':
            return `<span class="ssi-new-text" title="${tooltip}">NEU</span>`;
        case 'badge':
        default:
            return `<span class="ssi-new-badge" title="${tooltip}">NEU v${escapeHtml(currentVersion)}</span>`;
    }
}

/**
 * Get all components with updates
 * @returns {string[]} Array of component names
 */
export function getUpdatedComponentNames() {
    return updatedComponents.map(c => c.name);
}

/**
 * Clear all updates (call this when releasing new version)
 * This is just a helper - you should manually clear updatedComponents array
 */
export function clearUpdates() {
    console.warn('[whats-new] Remember to clear updatedComponents array in whats-new.js for new release!');
}

// CSS for badges (inject into page if needed)
export const whatsNewCSS = `
/* SSI Builders - What's New Badges */
.ssi-new-badge {
    display: inline-block;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    color: #2e7d32;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    vertical-align: middle;
    animation: ssi-new-pulse 2s ease-in-out infinite;
}

.ssi-new-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
    margin-left: 6px;
    vertical-align: middle;
    animation: ssi-new-pulse 2s ease-in-out infinite;
}

.ssi-new-text {
    color: #2e7d32;
    font-size: 11px;
    font-weight: 600;
    margin-left: 6px;
    text-transform: uppercase;
}

@keyframes ssi-new-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* Dark mode support */
.m3-dark .ssi-new-badge {
    background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
    color: #a5d6a7;
}

.m3-dark .ssi-new-dot {
    background: #81c784;
}

.m3-dark .ssi-new-text {
    color: #81c784;
}
`;

export default {
    currentVersion,
    updatedComponents,
    isNew,
    getUpdateInfo,
    getNewBadge,
    getUpdatedComponentNames,
    clearUpdates,
    whatsNewCSS
};
