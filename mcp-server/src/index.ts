#!/usr/bin/env node

/**
 * SSI Builders MCP Server
 * Provides AI-optimized access to component documentation and code generation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load component data
const componentsIndex = JSON.parse(
  readFileSync(join(__dirname, 'data/components-index.json'), 'utf-8')
);
const codeTemplates = JSON.parse(
  readFileSync(join(__dirname, 'data/code-templates.json'), 'utf-8')
);

// Create MCP server
const server = new Server(
  {
    name: 'ssi-builders-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ==================== TOOLS ====================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'ssi_list_components',
      description: 'List all available SSI Builder components with optional category filter',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['all', 'core', 'analytics', 'forms', 'navigation', 'feedback', 'visualization', 'system'],
            description: 'Filter by category (default: all)',
            default: 'all',
          },
        },
      },
    },
    {
      name: 'ssi_get_component_info',
      description: 'Get detailed documentation for a specific SSI Builder component',
      inputSchema: {
        type: 'object',
        properties: {
          component: {
            type: 'string',
            description: 'Component name (e.g., ListBuilder, FormBuilder, AnalyticsCard)',
          },
          include: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['features', 'useCases', 'imports', 'css', 'demo'],
            },
            description: 'Optional: specific info to include',
          },
        },
        required: ['component'],
      },
    },
    {
      name: 'ssi_generate_code',
      description: 'Generate ready-to-use code snippet for SSI Builder integration',
      inputSchema: {
        type: 'object',
        properties: {
          component: {
            type: 'string',
            description: 'Component name (e.g., ListBuilder, FormBuilder)',
          },
          useCase: {
            type: 'string',
            description: 'Use case template (e.g., basic, with-search, with-actions, modal-form, grid)',
          },
        },
        required: ['component', 'useCase'],
      },
    },
    {
      name: 'ssi_search_components',
      description: 'Search SSI Builder components by keyword, feature, or use case',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term (e.g., "form validation", "dark mode", "dashboard", "modal")',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'ssi_check_updates',
      description: 'Check for new SSI Builders versions and optionally auto-update',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to ssi-builders installation (e.g., /path/to/vendor/ssi-builders). If not provided, checks GitHub only.',
          },
          autoUpdate: {
            type: 'boolean',
            description: 'If true, automatically updates to latest version via git. Requires projectPath. Default: false',
            default: false,
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'ssi_list_components': {
      const category = (args as any).category || 'all';

      if (category === 'all') {
        const allComponents: Record<string, string[]> = {};
        Object.entries(componentsIndex.categories).forEach(([key, cat]: [string, any]) => {
          allComponents[key] = cat.components;
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  version: componentsIndex.version,
                  categories: allComponents,
                  totalComponents: Object.values(allComponents).flat().length,
                },
                null,
                2
              ),
            },
          ],
        };
      } else {
        const categoryData = componentsIndex.categories[category];
        if (!categoryData) {
          throw new Error(`Category "${category}" not found`);
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  category,
                  name: categoryData.name,
                  description: categoryData.description,
                  components: categoryData.components,
                },
                null,
                2
              ),
            },
          ],
        };
      }
    }

    case 'ssi_get_component_info': {
      const componentName = (args as any).component;
      const include = (args as any).include || [
        'features',
        'useCases',
        'imports',
        'css',
        'demo',
      ];

      const componentData = componentsIndex.components[componentName];
      if (!componentData) {
        throw new Error(`Component "${componentName}" not found`);
      }

      const result: any = {
        name: componentName,
        category: componentData.category,
        description: componentData.description,
        complexity: componentData.complexity,
        tokenCost: componentData.tokenCost,
      };

      if (include.includes('features')) result.features = componentData.features;
      if (include.includes('useCases')) result.useCases = componentData.useCases;
      if (include.includes('imports'))
        result.requiredImports = componentData.requiredImports;
      if (include.includes('css')) result.cssFiles = componentData.cssFiles;
      if (include.includes('demo')) result.demoPage = componentData.demoPage;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case 'ssi_generate_code': {
      const componentName = (args as any).component;
      const useCase = (args as any).useCase;

      const templates = codeTemplates[componentName];
      if (!templates) {
        throw new Error(`No templates found for component "${componentName}"`);
      }

      const template = templates[useCase];
      if (!template) {
        const availableCases = Object.keys(templates).join(', ');
        throw new Error(
          `Use case "${useCase}" not found for ${componentName}. Available: ${availableCases}`
        );
      }

      return {
        content: [
          {
            type: 'text',
            text: `// ${template.description}\n// Component: ${componentName}\n// Use Case: ${useCase}\n\n${template.code}`,
          },
        ],
      };
    }

    case 'ssi_search_components': {
      const query = ((args as any).query || '').toLowerCase();
      const results: any[] = [];

      Object.entries(componentsIndex.components).forEach(([name, data]: [string, any]) => {
        let score = 0;
        const matches: string[] = [];

        // Search in name
        if (name.toLowerCase().includes(query)) {
          score += 10;
          matches.push('name');
        }

        // Search in description
        if (data.description.toLowerCase().includes(query)) {
          score += 5;
          matches.push('description');
        }

        // Search in features
        if (data.features?.some((f: string) => f.toLowerCase().includes(query))) {
          score += 3;
          matches.push('features');
        }

        // Search in use cases
        if (data.useCases?.some((uc: string) => uc.toLowerCase().includes(query))) {
          score += 3;
          matches.push('useCases');
        }

        if (score > 0) {
          results.push({
            component: name,
            score,
            matches,
            description: data.description,
            category: data.category,
            complexity: data.complexity,
            tokenCost: data.tokenCost,
          });
        }
      });

      results.sort((a, b) => b.score - a.score);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query,
                resultsCount: results.length,
                results: results.slice(0, 10), // Top 10 results
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'ssi_check_updates': {
      const projectPath = (args as any).projectPath;
      const autoUpdate = (args as any).autoUpdate || false;

      try {
        // Fetch latest release from GitHub
        const response = await fetch('https://api.github.com/repos/mmollay/ssi-builders/releases/latest');

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const release = await response.json();
        const latestVersion = release.tag_name.replace(/^v/, ''); // Remove 'v' prefix
        const currentVersion = componentsIndex.version;

        const result: any = {
          currentVersion,
          latestVersion,
          updateAvailable: latestVersion !== currentVersion,
          releaseUrl: release.html_url,
          releaseName: release.name,
          publishedAt: release.published_at,
          changelog: release.body || 'No changelog available',
        };

        // Auto-update if requested and path provided
        if (autoUpdate && projectPath) {
          const { execSync } = await import('child_process');
          const fs = await import('fs');
          const path = await import('path');

          // Verify path exists
          if (!fs.existsSync(projectPath)) {
            result.updateError = `Path does not exist: ${projectPath}`;
            result.updateSuccess = false;
          } else {
            try {
              // Check git status
              const gitStatus = execSync('git status --porcelain', {
                cwd: projectPath,
                encoding: 'utf-8'
              });

              if (gitStatus.trim()) {
                result.updateError = 'Working directory has uncommitted changes. Commit or stash first.';
                result.updateSuccess = false;
              } else {
                // Perform update
                execSync('git fetch --tags', { cwd: projectPath, encoding: 'utf-8' });
                execSync(`git checkout v${latestVersion}`, { cwd: projectPath, encoding: 'utf-8' });

                // Check if package.json changed
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                  execSync('npm install', { cwd: projectPath, encoding: 'utf-8' });
                }

                result.updateSuccess = true;
                result.updateMessage = `Successfully updated from v${currentVersion} to v${latestVersion}`;
              }
            } catch (error: any) {
              result.updateError = error.message;
              result.updateSuccess = false;
            }
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }, null, 2),
            },
          ],
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ==================== RESOURCES ====================

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'ssi://builders/index',
      name: 'SSI Builders - Component Index',
      description: 'Complete index of all SSI Builders components',
      mimeType: 'application/json',
    },
    {
      uri: 'ssi://builders/best-practices',
      name: 'SSI Builders - Best Practices',
      description: 'Guidelines for using SSI Builders effectively',
      mimeType: 'text/markdown',
    },
    {
      uri: 'ssi://builders/changelog',
      name: 'SSI Builders - Changelog (v2.7.0)',
      description: 'Latest changes and updates',
      mimeType: 'text/markdown',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'ssi://builders/index':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(componentsIndex, null, 2),
          },
        ],
      };

    case 'ssi://builders/best-practices':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: `# SSI Builders - Best Practices

## General Guidelines

### 1. Always Use GlobalConfig
Configure GlobalConfig ONCE at app initialization:

\`\`\`javascript
import { GlobalConfig, IconManager } from '/vendor/ssi-builders/src/index.js';

GlobalConfig.configure({
    iconPreset: 'lucide',
    iconWeight: 'regular',
    theme: { primary: '#1a73e8' }
});
\`\`\`

### 2. Use Design Tokens
NEVER hardcode colors or spacing:

\`\`\`css
/* ✅ CORRECT */
color: var(--m3-primary);
margin: var(--ssi-spacing-md);

/* ❌ WRONG */
color: #1a73e8;
margin: 12px;
\`\`\`

### 3. Enable i18n
All builders support internationalization:

\`\`\`javascript
import { i18n } from '/vendor/ssi-builders/src/index.js';

i18n.setLanguage('en'); // or 'de', 'fr'
\`\`\`

### 4. Dark Mode Support
All components automatically support dark mode via CSS variables.

### 5. Responsive Design
All builders are mobile-first and responsive by default.

## Component-Specific Tips

### ListBuilder
- Always use \`dataSource\` for async data (not static \`data\`)
- Enable search with \`searchable: true\`
- Use \`actions\` for row-level operations

### FormBuilder
- Leverage validation with \`required\` and \`validation.pattern\`
- Use \`autoSave\` for user convenience
- Multi-step forms with \`step\` property

### ModalBuilder
- Use static methods for common cases: \`alert()\`, \`confirm()\`, \`form()\`
- AJAX support via promises
- Choose appropriate size (xs, small, medium, large, fullscreen)

### AnalyticsCard
- Use \`AnalyticsCardGrid\` for dashboard layouts
- Format values with \`format\` option (currency, percent, compact)
- Show trends with \`trend\` object

## Performance Tips

1. **Lazy Load**: Import components only when needed
2. **Destroy Instances**: Call \`destroy()\` when removing components
3. **Use Haiku Model**: For simple SSI Builders tasks, Claude Code uses Haiku (20x cheaper than Sonnet)

## Token Optimization

When using Claude Code with SSI Builders:
- Simple tasks (styling, config): **Haiku** (~$4/1M tokens)
- Complex tasks (architecture): **Sonnet** (~$15/1M tokens)
- MCP Server provides exact code snippets (70% token savings)
`,
          },
        ],
      };

    case 'ssi://builders/changelog':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: `# SSI Builders Changelog

## [2.7.0] - 2025-12-03

### Added
- 🏗️ **SiteBuilder Studio**: New visual layout editor for SiteBuilder configurations
  - Element-based editing system (Page, Header, Sidebar, Content, Footer tabs)
  - Edit-Frame highlighting with blue dashed outline and labels
  - Click-to-select: clicking elements in preview switches to corresponding tab
  - Extended Content settings: Background Color, Page Title, Max Width, Alignment
  - Real-time preview updates with undo/redo history
  - Export configuration as code
- 🎨 **FormBuilder Studio-Style Fields**: New field types for visual editors
  - \`button-group\`: Horizontal single-select buttons with optional sublabels
  - \`card-select\`: Grid-based card selection (like layout skeleton picker)
  - \`color-swatches\`: Round color picker buttons with checkmark indicator
  - \`inline-checkbox\`: Compact checkbox with background container
  - \`section-header\`: Numbered section headers (e.g., "1. LAYOUT SKELETON")
  - \`item-list\`: Dynamic list with add/remove (for navigation items, footer links)
- 📱 **HeaderBuilder**: Material Design 3 app bar component
  - Logo/brand section, navigation tabs, action buttons
  - Search bar, user profile/avatar
  - Mobile hamburger menu, sidebar toggle
  - Fixed/Sticky/Static positioning, elevation on scroll
- 🔧 **SiteBuilder**: Right sidebar position support (\`position: 'right'\`)
- 🔧 **SiteBuilder**: Footer layout variants (\`simple\`, \`columns\`, \`centered\`)
- 🔧 **SiteBuilder**: Spacing presets (compact: 16px, normal: 40px, spacious: 64px)
- 🎨 **IconManager**: Social media icons (Facebook, Twitter, Instagram, LinkedIn, YouTube, Email)
- 💡 **TooltipBuilder**: Dynamic repositioning on scroll and resize

### Fixed
- **FormBuilder**: XSS vulnerability in studio-style field types (escaped all user input)
- **FormBuilder**: Duplicate CSS hover rules causing incorrect border colors
- **FormBuilder**: Hardcoded emoji in color-swatches replaced with SVG checkmark
- **SiteBuilder**: Mobile padding override issue (removed !important from CSS)
- **ThemeBuilder**: darkMode option now correctly respects explicit \`false\` value

### Security
- **FormBuilder**: All studio-style field types now use \`escapeHtml()\` for user-provided content
- **FormBuilder**: Color values sanitized to prevent CSS injection

## [2.6.0] - 2025-11-29

### Added
- 🌐 **i18n System**: Complete internationalization with DE/EN/FR support
- 🌙 **Dark Mode**: Full dark theme implementation across all components
- 🆕 **ThemeBuilder**: Dynamic Material Design 3 color scheme generator
- 🆕 **CardBuilder**: Content card component with variants
- 🆕 **MessageBuilder**: Inline alert/message system

No breaking changes - fully backwards compatible!
`,
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SSI Builders MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
