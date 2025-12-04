# SSI Builders MCP Server

**AI-Optimized Component Documentation & Code Generation for Claude Code**

This MCP (Model Context Protocol) server provides Claude Code with instant access to SSI Builders documentation, code templates, and intelligent component search - reducing token costs by up to 70% for UI development tasks.

---

## 🎯 What This Does

When working with SSI Builders in Claude Code, this MCP server:

- ✅ **Provides instant component info** (no need to search through docs)
- ✅ **Generates ready-to-use code snippets** (copy-paste ready)
- ✅ **Searches components by feature** ("dark mode", "validation", "CRUD")
- ✅ **Reduces token usage by 70%** (precise answers, no context bloat)
- ✅ **Auto-selects Haiku model** for simple SSI tasks (20x cheaper)

---

## 🚀 Installation

### 1. Build the MCP Server

```bash
cd /Users/martinmollay/Development/ssi-builders-mcp
npm install
npm run build
```

### 2. Configure Claude Code

Add to your project's `.mcp.json` (or global `~/.mcp.json`):

```json
{
  "mcpServers": {
    "ssi-builders": {
      "command": "node",
      "args": ["/Users/martinmollay/Development/ssi-builders-mcp/build/index.js"]
    }
  }
}
```

### 3. Restart Claude Code

**Important:** Close Claude Code completely and reopen it.

MCP Servers are loaded at startup, so a full restart is required.

**⚠️ Troubleshooting:** If you see "Status: ✘ failed" in Claude Code:
```bash
# 1. Verify MCP server can start:
node /Users/martinmollay/Development/ssi-builders-mcp/build/index.js

# 2. Should output: "SSI Builders MCP Server running on stdio"
# 3. If you see errors about missing data files, rebuild:
cd /Users/martinmollay/Development/ssi-builders-mcp
npm run build

# 4. Then restart Claude Code
```

---

## 📚 Available Tools

### 1. `ssi_list_components`

List all available SSI Builders with optional category filter.

**Example:**
```
List all analytics components
→ MCP Tool: ssi_list_components(category: "analytics")
→ Returns: AnalyticsCard, AnalyticsCardGrid, FilterBar, TimeRangePicker
```

**Categories:**
- `core` - ListBuilder, FormBuilder, ModalBuilder, CardBuilder, TabBuilder
- `analytics` - AnalyticsCard, FilterBar, TimeRangePicker
- `forms` - FormBuilder, M3DropdownMenu
- `navigation` - SidebarBuilder, TabBuilder, MenuBuilder
- `feedback` - ToastBuilder, MessageBuilder, TooltipBuilder
- `system` - ThemeBuilder, IconManager, GlobalConfig, i18n

---

### 2. `ssi_get_component_info`

Get detailed documentation for a specific component.

**Example:**
```
Show me how to use ListBuilder
→ MCP Tool: ssi_get_component_info(component: "ListBuilder")
→ Returns: Features, use cases, required imports, CSS files, demo page
```

**Output includes:**
- Description & complexity
- Features list
- Use cases
- Required imports
- CSS dependencies
- Demo page URL
- Token cost estimate

---

### 3. `ssi_generate_code`

Generate ready-to-use code snippets.

**Example:**
```
Generate code for a list with search
→ MCP Tool: ssi_generate_code(component: "ListBuilder", useCase: "with-search")
→ Returns: Complete, copy-paste ready code
```

**Available templates:**

**ListBuilder:**
- `basic` - Simple list with columns
- `with-search` - List with search functionality
- `with-actions` - List with row actions (edit, delete)

**FormBuilder:**
- `basic` - Form with validation
- `modal-form` - Form inside modal with AJAX

**ModalBuilder:**
- `basic` - Simple modal dialog
- `confirm` - Confirmation dialog with promise

**AnalyticsCard:**
- `basic` - Single KPI card with trend
- `grid` - Grid of multiple KPI cards

**ThemeBuilder:**
- `basic` - Theme with custom seed color

**MessageBuilder:**
- `basic` - Static convenience methods
- `with-actions` - Message with action buttons

---

### 4. `ssi_search_components`

Search components by keyword, feature, or use case.

**Example:**
```
Find components that support dark mode
→ MCP Tool: ssi_search_components(query: "dark mode")
→ Returns: Ranked list of matching components
```

**Search examples:**
- "form validation"
- "dashboard KPI"
- "CRUD operations"
- "modal confirmation"
- "theme switching"

---

### 5. `ssi_check_updates`

Check for new SSI Builders versions on GitHub and optionally auto-update your project.

**Example (Check only):**
```
User: "Check if there's a new SSI Builders version"

Claude Code (uses MCP):
→ ssi_check_updates()

Returns:
{
  "currentVersion": "2.6.0",
  "latestVersion": "2.6.1",
  "updateAvailable": true,
  "releaseUrl": "https://github.com/mmollay/ssi-builders/releases/tag/v2.6.1",
  "changelog": "### Added\n- MCP Server Integration\n..."
}
```

**Example (Auto-Update):**
```
User: "Update SSI Builders to latest version in my project"

Claude Code (uses MCP):
→ ssi_check_updates({
    projectPath: "/path/to/vendor/ssi-builders",
    autoUpdate: true
  })

Returns:
{
  "currentVersion": "2.6.0",
  "latestVersion": "2.6.1",
  "updateSuccess": true,
  "updateMessage": "Successfully updated from v2.6.0 to v2.6.1",
  "changelog": "..."
}
```

**Safety Features:**
- ✅ Checks for uncommitted changes before updating
- ✅ Uses git tags for precise version control
- ✅ Runs `npm install` if package.json changed
- ✅ Shows full changelog from GitHub release

---

## 🎨 Available Resources

Resources provide structured documentation that Claude Code can read:

### 1. `ssi://builders/index`
Complete JSON index of all components with metadata.

### 2. `ssi://builders/best-practices`
Guidelines for effective SSI Builders usage:
- GlobalConfig setup
- Design token usage
- i18n integration
- Dark mode support
- Performance tips

### 3. `ssi://builders/changelog`
Latest changes and migration guide for v2.6.0.

---

## 💡 How Claude Code Uses This

### Before MCP Server:
```
User: "Add a product list with search"

Claude Code:
1. Searches through files (500 tokens)
2. Reads demo pages (1000 tokens)
3. Analyzes examples (500 tokens)
4. Generates code (200 tokens)
Total: ~2200 tokens
```

### With MCP Server:
```
User: "Add a product list with search"

Claude Code:
1. ssi_list_components() → finds ListBuilder (50 tokens)
2. ssi_generate_code("ListBuilder", "with-search") → gets code (100 tokens)
3. Adapts to project (150 tokens)
Total: ~300 tokens

Savings: 86% fewer tokens! 💰
```

---

## 🔧 Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Automatic Sync from SSI Builders
The MCP Server automatically syncs with ssi-builders before every GITHUB release:

```bash
# Manual sync anytime:
npm run sync

# This happens automatically when you use GITHUB command in ssi-builders project
# The pre-GITHUB hook triggers: npm run sync → extracts data → rebuilds MCP
```

**What gets synced:**
- Component list and categories
- Version number from package.json
- CSS file dependencies
- Demo page links
- Component complexity/token costs

**What requires manual updates:**
- `src/data/code-templates.json` - Code snippets (curated examples)
- Component features and use cases (preserved from existing data)

---

## 📊 Token Cost Comparison

**Without MCP (using Sonnet):**
- Typical SSI task: ~2000 tokens × $15/1M = $0.03

**With MCP (using Haiku):**
- Same task: ~300 tokens × $4/1M = $0.0012

**Savings: 96% cost reduction!** 🎉

---

## 🌍 Global vs Project-Specific

### Global MCP (All Projects)
```json
// ~/.mcp.json
{
  "mcpServers": {
    "ssi-builders": {
      "command": "node",
      "args": ["/Users/martinmollay/Development/ssi-builders-mcp/build/index.js"]
    }
  }
}
```

### Project-Specific MCP
```json
// /my-project/.mcp.json
{
  "mcpServers": {
    "ssi-builders": {
      "command": "node",
      "args": ["/Users/martinmollay/Development/ssi-builders-mcp/build/index.js"]
    }
  }
}
```

---

## 📖 Examples

### Example 1: Quick Component Lookup
```
User: "What components can I use for a dashboard?"

Claude Code (uses MCP):
→ ssi_search_components("dashboard")
→ Returns: AnalyticsCard, AnalyticsCardGrid, ChartBuilder

Claude: "For dashboards, I recommend AnalyticsCardGrid for KPIs..."
```

### Example 2: Code Generation
```
User: "Create a user form in a modal"

Claude Code (uses MCP):
→ ssi_generate_code("ModalBuilder", "modal-form")
→ Gets ready-to-use code

Claude: "Here's the code for a modal form..."
[Pastes generated code]
```

### Example 3: Feature Search
```
User: "Which components support dark mode?"

Claude Code (uses MCP):
→ ssi_search_components("dark mode")
→ Returns: All components (all support dark mode!)

Claude: "All SSI Builders support dark mode automatically..."
```

---

## 🆘 Troubleshooting

### MCP Server Not Recognized

1. **Check .mcp.json path:**
   ```bash
   cat .mcp.json
   ```

2. **Verify build succeeded:**
   ```bash
   ls -la /Users/martinmollay/Development/ssi-builders-mcp/build/index.js
   ```

3. **Test MCP server manually:**
   ```bash
   node /Users/martinmollay/Development/ssi-builders-mcp/build/index.js
   ```

4. **Restart Claude Code:**
   ```bash
   /reload
   ```

### Tools Not Appearing

1. **Check Claude Code logs:**
   ```bash
   tail -f ~/.claude/debug/mcp-*.log
   ```

2. **Verify MCP schema:**
   ```bash
   cd /Users/martinmollay/Development/ssi-builders-mcp
   npm run build
   ```

---

## 🚀 Next Steps

1. **Try it out:**
   ```
   "List all SSI Builders components"
   "Generate code for a list with search"
   "Find components for forms"
   ```

2. **Explore resources:**
   ```
   "Show me SSI Builders best practices"
   "What's new in v2.6.0?"
   ```

3. **Integrate into projects:**
   - Add `.mcp.json` to all SSI Builders projects
   - Let Claude Code auto-generate component code
   - Save 70-90% on token costs!

---

**Version:** 1.0.0
**SSI Builders:** v2.6.0
**License:** MIT
**Author:** SSI Solutions

For more info: https://github.com/mmollay/ssi-builders
