#!/usr/bin/env node
/**
 * sync-version.js - Synchronize version across all SSI Builders files
 *
 * Reads version from package.json and updates all hardcoded version references
 * across the codebase to ensure consistency.
 *
 * Usage: node scripts/sync-version.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Read version from package.json (Source of Truth)
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const VERSION = packageJson.version;

console.log(`\n🔄 Syncing version to: ${VERSION}\n`);

// Files to update with their update patterns
const filesToUpdate = [
  {
    path: 'src/version.js',
    pattern: /const VERSION = '[^']+';/,
    replacement: `const VERSION = '${VERSION}';`,
    description: 'Version constant'
  },
  {
    path: 'docs/demos/layout.js',
    pattern: /version: '[^']+',/,
    replacement: `version: '${VERSION}',`,
    description: 'Sidebar version'
  }
];

let updatedCount = 0;
let errors = [];

// Update each file
filesToUpdate.forEach(({ path: filePath, pattern, replacement, description }) => {
  const fullPath = path.join(rootDir, filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  ${filePath} - File not found, skipping`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Check if pattern exists
    if (!pattern.test(content)) {
      console.log(`⚠️  ${filePath} - Pattern not found, skipping`);
      errors.push(`Pattern not found in ${filePath}`);
      return;
    }

    // Replace pattern
    content = content.replace(pattern, replacement);

    // Check if anything changed
    if (content === originalContent) {
      console.log(`✅ ${filePath} - Already up to date (${description})`);
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath} - Updated (${description})`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ ${filePath} - Error: ${error.message}`);
    errors.push(`Error updating ${filePath}: ${error.message}`);
  }
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`📊 SUMMARY`);
console.log(`${'='.repeat(50)}`);
console.log(`Version: ${VERSION}`);
console.log(`Files checked: ${filesToUpdate.length}`);
console.log(`Files updated: ${updatedCount}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n⚠️  Errors:`);
  errors.forEach(err => console.log(`   - ${err}`));
}

console.log(`\n✅ Version sync complete!\n`);

// Exit with error code if there were errors
process.exit(errors.length > 0 ? 1 : 0);
