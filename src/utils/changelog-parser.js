/**
 * CHANGELOG.md Parser
 *
 * Automatically parses CHANGELOG.md and converts it to ChangelogBuilder format.
 * This ensures the changelog HTML is always up-to-date with the markdown file.
 *
 * Usage:
 *   import { parseChangelog } from '/src/utils/changelog-parser.js';
 *   const data = await parseChangelog('/CHANGELOG.md');
 */

/**
 * Fetch and parse CHANGELOG.md file
 * @param {string} changelogPath - Path to CHANGELOG.md file
 * @returns {Promise<Array>} Parsed changelog data for ChangelogBuilder
 */
export async function parseChangelog(changelogPath = '/CHANGELOG.md') {
    try {
        const response = await fetch(changelogPath);
        const text = await response.text();
        return parseChangelogText(text);
    } catch (error) {
        console.error('Failed to fetch CHANGELOG.md:', error);
        return [];
    }
}

/**
 * Parse CHANGELOG.md text content
 * @param {string} text - Raw CHANGELOG.md content
 * @returns {Array} Parsed changelog data
 */
export function parseChangelogText(text) {
    const versions = [];
    const lines = text.split('\n');

    let currentVersion = null;
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Match version header: ## [2.6.2] - 2025-11-29
        const versionMatch = line.match(/^##\s+\[([^\]]+)\]\s+-\s+(.+)$/);
        if (versionMatch) {
            // Save previous version if exists
            if (currentVersion && currentVersion.changes.length > 0) {
                versions.push(currentVersion);
            }

            // Start new version
            currentVersion = {
                version: versionMatch[1],
                date: versionMatch[2],
                changes: []
            };
            currentSection = null;
            continue;
        }

        // Match section header: ### Added, ### Changed, ### Fixed, etc.
        const sectionMatch = line.match(/^###\s+(.+)$/);
        if (sectionMatch && currentVersion) {
            currentSection = sectionMatch[1].toLowerCase();
            continue;
        }

        // Match change item: - **Component**: Description
        const changeMatch = line.match(/^-\s+(.+)$/);
        if (changeMatch && currentVersion && currentSection) {
            const changeText = changeMatch[1]
                .replace(/\*\*/g, '') // Remove markdown bold
                .replace(/`/g, '')    // Remove code backticks
                .trim();

            if (changeText) {
                currentVersion.changes.push({
                    type: currentSection,
                    text: changeText
                });
            }
        }
    }

    // Add last version
    if (currentVersion && currentVersion.changes.length > 0) {
        versions.push(currentVersion);
    }

    // Mark first version as highlighted
    if (versions.length > 0) {
        versions[0].highlight = true;
    }

    return versions;
}

/**
 * Format date from CHANGELOG.md format to display format
 * @param {string} dateStr - Date string (YYYY-MM-DD or text)
 * @returns {string} Formatted date
 */
export function formatChangelogDate(dateStr) {
    // Handle text dates like "Coming Soon"
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
