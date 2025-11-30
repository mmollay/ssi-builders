/**
 * Shared Layout Logic for SSI Builders Demo Pages
 * Creates consistent Sidebar navigation across all demo pages
 */

import { SidebarBuilder } from '../../src/SidebarBuilder.js';
import { IconManager } from '../../src/IconManager.js';
import { isNew, currentVersion } from '../../src/whats-new.js';
import { ThemeBuilder } from '../../src/ThemeBuilder.js';
import { i18n } from '../../src/i18n.js';

// Global Theme Instance
let globalTheme = null;

/**
 * Get badge for a component (NEW if updated, or custom badge)
 */
function getComponentBadge(componentName, defaultBadge = null) {
  if (isNew(componentName)) {
    return { text: `NEU v${currentVersion}`, color: '#2e7d32' };
  }
  return defaultBadge;
}

/**
 * Initialize the page layout with sidebar navigation
 * @param {string} activePage - The current active page identifier
 */
export function initializeLayout(activePage) {
  initializeDemoLayout(activePage);
}

/**
 * Initialize demo page layout with sidebar navigation
 * @param {string} activePage - The current active page identifier
 */
export function initializeDemoLayout(activePage) {
  // Initialize global theme (loads from localStorage if saved)
  initializeGlobalTheme();

  const sidebar = new SidebarBuilder({
    containerId: 'sidebar-container',
    title: 'SSI Builders',
    version: currentVersion,
    logo: {
      text: 'SSI',
      background: '#1a73e8'
    },
    items: [
      {
        type: 'heading',
        label: 'Getting Started'
      },
      {
        label: 'Overview',
        icon: IconManager.getIcon('home'),
        key: 'index',
        href: '../../index.html'
      },
      {
        label: 'Installation',
        icon: IconManager.getIcon('download'),
        key: 'installation',
        href: '/docs/demos/installation.html'
      },
      {
        type: 'heading',
        label: 'Analytics'
      },
      {
        label: 'AnalyticsCard',
        icon: IconManager.getIcon('chart'),
        key: 'analytics-card',
        href: '/docs/demos/analytics-card.html'
      },
      {
        label: 'FilterBar',
        icon: IconManager.getIcon('filter'),
        key: 'filter-bar',
        href: '/docs/demos/filter-bar.html'
      },
      {
        label: 'TimeRangePicker',
        icon: IconManager.getIcon('clock'),
        key: 'time-range-picker',
        href: '/docs/demos/time-range-picker.html'
      },
      {
        type: 'heading',
        label: 'Core Builders'
      },
      {
        label: 'ListBuilder',
        icon: IconManager.getIcon('list'),
        key: 'list-builder',
        href: '/docs/demos/list-builder.html',
        badge: getComponentBadge('ListBuilder', { text: 'Popular', color: '#34a853' })
      },
      {
        label: 'FormBuilder',
        icon: IconManager.getIcon('edit'),
        key: 'form-builder',
        href: '/docs/demos/form-builder.html',
        badge: { text: 'Popular', color: '#34a853' }
      },
      {
        label: 'ModalBuilder',
        icon: IconManager.getIcon('modal'),
        key: 'modal-builder',
        href: '/docs/demos/modal-builder.html'
      },
      {
        label: 'CRUD Demo',
        icon: IconManager.getIcon('grid'),
        key: 'crud-demo',
        href: '/docs/demos/crud-demo.html'
      },
      {
        label: 'Advanced Forms',
        icon: IconManager.getIcon('edit'),
        key: 'form-advanced-demo',
        href: '/docs/demos/form-advanced-demo.html',
        badge: { text: 'New', color: '#2e7d32' }
      },
      {
        label: 'ChartBuilder',
        icon: IconManager.getIcon('chart'),
        key: 'chart-builder',
        href: '/docs/demos/chart-builder.html'
      },
      {
        label: 'TabBuilder',
        icon: IconManager.getIcon('tab'),
        key: 'tab-builder',
        href: '/docs/demos/tab-builder.html'
      },
      {
        label: 'MenuBuilder',
        icon: IconManager.getIcon('menu'),
        key: 'menu-builder',
        href: '/docs/demos/menu-builder.html'
      },
      {
        label: 'SidebarBuilder',
        icon: IconManager.getIcon('sidebar'),
        key: 'sidebar-builder',
        href: '/docs/demos/sidebar-builder.html'
      },
      {
        label: 'SiteBuilder',
        icon: IconManager.getIcon('layout'),
        key: 'site-builder',
        href: '/docs/demos/site-builder.html'
      },
      {
        label: 'ToastBuilder',
        icon: IconManager.getIcon('bell'),
        key: 'toast-builder',
        href: '/docs/demos/toast-builder.html'
      },
      {
        label: 'MessageBuilder',
        icon: IconManager.getIcon('info'),
        key: 'message-builder',
        href: '/docs/demos/message-builder.html',
        badge: { text: 'New', color: '#2e7d32' }
      },
      {
        label: 'CardBuilder',
        icon: IconManager.getIcon('layout'),
        key: 'card-builder',
        href: '/docs/demos/card-builder.html',
        badge: { text: 'New', color: '#2e7d32' }
      },
      {
        label: 'TooltipBuilder',
        icon: IconManager.getIcon('info'),
        key: 'tooltip-builder',
        href: '/docs/demos/tooltip-builder.html'
      },
      {
        label: 'CodeSnippetBuilder',
        icon: IconManager.getIcon('copy'),
        key: 'code-snippet-builder',
        href: '/docs/demos/code-snippet-builder.html'
      },
      {
        label: 'ChangelogBuilder',
        icon: IconManager.getIcon('history'),
        key: 'changelog-builder',
        href: '/docs/demos/changelog-builder.html',
        badge: { text: 'New', color: '#1a73e8' }
      },
      {
        type: 'heading',
        label: 'Design System'
      },
      {
        label: 'M3 Components',
        icon: IconManager.getIcon('layout'),
        key: 'm3-components',
        href: '/docs/demos/m3-components.html',
        badge: { text: 'Updated', color: '#1a73e8' }
      },
      {
        label: 'ThemeBuilder',
        icon: IconManager.getIcon('star'),
        key: 'theme-builder',
        href: '/docs/demos/theme-builder.html',
        badge: { text: 'New', color: '#2e7d32' }
      },
      {
        type: 'heading',
        label: 'System'
      },
      {
        label: 'Icon System',
        icon: IconManager.getIcon('star'),
        key: 'icon-system',
        href: '/docs/demos/icon-system.html'
      },
      {
        label: 'Global Config',
        icon: IconManager.getIcon('settings'),
        key: 'global-config',
        href: '/docs/demos/global-config-playground.html'
      },
      {
        label: 'All Builders',
        icon: IconManager.getIcon('grid'),
        key: 'all-builders',
        href: '/docs/demos/all-builders-overview.html'
      },
      {
        type: 'divider'
      },
      {
        type: 'heading',
        label: 'Resources'
      },
      {
        label: 'GitHub',
        icon: IconManager.getIcon('github'),
        key: 'github',
        href: 'https://github.com/ssi-solutions/ssi-builders',
        target: '_blank'
      },
      {
        label: 'Changelog',
        icon: IconManager.getIcon('history'),
        key: 'changelog',
        href: '/docs/changelog.html'
      },
      {
        label: 'Documentation',
        icon: IconManager.getIcon('book'),
        key: 'documentation',
        href: '../../README.md',
        target: '_blank'
      },
      {
        label: 'MCP Server',
        icon: IconManager.getIcon('settings'),
        key: 'mcp-server',
        href: '/docs/demos/mcp-server.html',
        badge: { text: 'New', color: '#2e7d32' }
      }
    ],
    activePage: activePage,
    collapsible: true,
    defaultCollapsed: false,
    width: '280px'
  });

  // Render sidebar
  sidebar.render();

  // Setup mobile menu toggle
  setupMobileMenuToggle();

  // Add resize handler for responsive behavior
  handleResponsiveLayout();
  window.addEventListener('resize', handleResponsiveLayout);

  // Update content margin when sidebar toggles
  updateContentMargin();

  // Listen for sidebar toggle
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      setTimeout(updateContentMargin, 50);
    });
  }
}

/**
 * Update content margin based on sidebar state
 */
function updateContentMargin() {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.demo-content');

  if (!sidebar || !content) return;

  const isMobile = window.innerWidth < 1024;

  if (isMobile) {
    content.style.marginLeft = '0';
  } else {
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    content.style.marginLeft = isCollapsed ? '72px' : '280px';
  }
}

/**
 * Handle responsive layout adjustments
 */
function handleResponsiveLayout() {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.demo-content');

  if (!sidebar || !content) return;

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  if (isMobile) {
    // Mobile: Sidebar overlay
    sidebar.style.position = 'fixed';
    sidebar.style.zIndex = '1000';
    content.style.marginLeft = '0';
  } else if (isTablet) {
    // Tablet: Sidebar collapsed by default
    sidebar.style.position = 'fixed';
    content.style.marginLeft = '280px';
  } else {
    // Desktop: Sidebar always visible
    sidebar.style.position = 'fixed';
    content.style.marginLeft = '280px';
  }
}

/**
 * Setup mobile menu toggle button
 * Now handled by SidebarBuilder's toggle button
 */
function setupMobileMenuToggle() {
  // Mobile toggle is now handled by SidebarBuilder's .sidebar-toggle button
  // This function is kept for backwards compatibility but does nothing
}

/**
 * Add mobile menu toggle button (legacy support)
 */
export function addMobileMenuToggle() {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.id = 'mobile-menu-toggle';
    toggleBtn.innerHTML = '☰';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');

    toggleBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar-container');
      if (sidebar) {
        sidebar.classList.toggle('mobile-open');
      }
    });

    document.body.insertBefore(toggleBtn, document.body.firstChild);
  }
}

/**
 * Initialize global theme from localStorage or defaults
 */
function initializeGlobalTheme() {
  // Load saved theme settings from localStorage
  const savedSeedColor = localStorage.getItem('ssi-theme-seed-color') || '#1a73e8';
  const savedDarkMode = localStorage.getItem('ssi-theme-dark-mode') === 'true';

  // Create global theme instance (dark mode classes already applied by inline script in <head>)
  globalTheme = new ThemeBuilder({
    seedColor: savedSeedColor,
    darkMode: savedDarkMode,
    autoApply: true
  });

  // Add theme toggle button to page
  addThemeToggleButton();
}

/**
 * Color presets for theme picker
 */
const colorPresets = [
  { name: 'Blue', color: '#1a73e8' },
  { name: 'Purple', color: '#6750a4' },
  { name: 'Teal', color: '#008080' },
  { name: 'Orange', color: '#ff5722' },
  { name: 'Green', color: '#2e7d32' },
  { name: 'Pink', color: '#e91e63' },
  { name: 'Indigo', color: '#3f51b5' },
  { name: 'Cyan', color: '#00bcd4' }
];

/**
 * Add floating theme toggle button with M3 panel
 */
function addThemeToggleButton() {
  // Check if already exists
  if (document.getElementById('theme-fab-container')) return;

  // Inject styles
  injectThemePanelStyles();

  // Create container
  const container = document.createElement('div');
  container.id = 'theme-fab-container';
  container.className = 'theme-fab-container';

  // Create FAB button
  const fab = document.createElement('button');
  fab.id = 'theme-fab';
  fab.className = 'theme-fab';
  fab.setAttribute('aria-label', 'Theme settings');
  fab.innerHTML = `
    <svg class="theme-fab-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  `;

  // Create panel
  const panel = document.createElement('div');
  panel.id = 'theme-panel';
  panel.className = 'theme-panel';
  panel.innerHTML = `
    <div class="theme-panel-header">
      <span class="theme-panel-title">Theme</span>
      <button class="theme-panel-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <div class="theme-panel-section">
      <div class="theme-panel-label">Mode</div>
      <div class="theme-mode-toggle">
        <button class="theme-mode-btn ${!globalTheme?.darkMode ? 'active' : ''}" data-mode="light">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          </svg>
          Light
        </button>
        <button class="theme-mode-btn ${globalTheme?.darkMode ? 'active' : ''}" data-mode="dark">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
          </svg>
          Dark
        </button>
      </div>
    </div>

    <div class="theme-panel-section">
      <div class="theme-panel-label">Accent Color</div>
      <div class="theme-color-grid">
        ${colorPresets.map(preset => `
          <button class="theme-color-btn ${preset.color === (localStorage.getItem('ssi-theme-seed-color') || '#1a73e8') ? 'active' : ''}"
                  data-color="${preset.color}"
                  style="--preset-color: ${preset.color}"
                  title="${preset.name}">
            <span class="theme-color-swatch"></span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="theme-panel-section">
      <div class="theme-panel-label">Custom Color</div>
      <div class="theme-custom-color">
        <input type="color" id="theme-custom-picker" value="${localStorage.getItem('ssi-theme-seed-color') || '#1a73e8'}" />
        <span class="theme-color-hex">${localStorage.getItem('ssi-theme-seed-color') || '#1a73e8'}</span>
      </div>
    </div>

    <div class="theme-panel-section">
      <div class="theme-panel-label">Language</div>
      <div class="theme-language-toggle">
        <button class="theme-lang-btn ${i18n.getLanguage() === 'de' ? 'active' : ''}" data-lang="de">DE</button>
        <button class="theme-lang-btn ${i18n.getLanguage() === 'en' ? 'active' : ''}" data-lang="en">EN</button>
        <button class="theme-lang-btn ${i18n.getLanguage() === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
      </div>
    </div>
  `;

  container.appendChild(panel);
  container.appendChild(fab);
  document.body.appendChild(container);

  // Event listeners
  let panelOpen = false;

  fab.addEventListener('click', () => {
    panelOpen = !panelOpen;
    panel.classList.toggle('open', panelOpen);
    fab.classList.toggle('active', panelOpen);
  });

  panel.querySelector('.theme-panel-close').addEventListener('click', () => {
    panelOpen = false;
    panel.classList.remove('open');
    fab.classList.remove('active');
  });

  // Mode toggle
  panel.querySelectorAll('.theme-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const isDark = mode === 'dark';

      if (globalTheme) {
        globalTheme.setDarkMode(isDark);
        localStorage.setItem('ssi-theme-dark-mode', isDark);

        // Update button states
        panel.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Color presets
  panel.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      applyThemeColor(color);

      // Update active state
      panel.querySelectorAll('.theme-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update custom picker
      document.getElementById('theme-custom-picker').value = color;
      panel.querySelector('.theme-color-hex').textContent = color;
    });
  });

  // Custom color picker
  const customPicker = document.getElementById('theme-custom-picker');
  customPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    applyThemeColor(color);

    // Clear preset active state
    panel.querySelectorAll('.theme-color-btn').forEach(b => b.classList.remove('active'));
    panel.querySelector('.theme-color-hex').textContent = color;
  });

  // Language toggle
  panel.querySelectorAll('.theme-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      i18n.setLanguage(lang);
      localStorage.setItem('ssi-language', lang);

      // Update button states
      panel.querySelectorAll('.theme-lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Reload page to apply translations
      window.location.reload();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panelOpen && !container.contains(e.target)) {
      panelOpen = false;
      panel.classList.remove('open');
      fab.classList.remove('active');
    }
  });
}

/**
 * Apply theme color
 */
function applyThemeColor(color) {
  if (globalTheme) {
    globalTheme.setSeedColor(color);
    localStorage.setItem('ssi-theme-seed-color', color);
  }
}

/**
 * Inject CSS styles for theme panel
 */
function injectThemePanelStyles() {
  if (document.getElementById('theme-panel-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'theme-panel-styles';
  styles.textContent = `
    .theme-fab-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
    }

    .theme-fab {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      border: none;
      background: var(--m3-primary, #1a73e8);
      color: var(--m3-on-primary, white);
      cursor: pointer;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-fab:hover {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);
      transform: scale(1.05);
    }

    .theme-fab.active {
      background: var(--m3-primary-container, #d3e3fd);
      color: var(--m3-on-primary-container, #041e49);
    }

    .theme-fab-icon {
      width: 24px;
      height: 24px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .theme-fab.active .theme-fab-icon {
      transform: rotate(30deg);
    }

    .theme-panel {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 280px;
      background: var(--m3-surface-container-high, #e8eaed);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .theme-panel.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .theme-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px 8px;
      border-bottom: 1px solid var(--m3-outline-variant, #c4c7c5);
    }

    .theme-panel-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--m3-on-surface, #1f1f1f);
    }

    .theme-panel-close {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--m3-on-surface-variant, #444746);
      transition: background 0.2s;
    }

    .theme-panel-close:hover {
      background: var(--m3-surface-container-highest, #dde3ea);
    }

    .theme-panel-section {
      padding: 16px;
    }

    .theme-panel-section + .theme-panel-section {
      padding-top: 8px;
    }

    .theme-panel-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--m3-on-surface-variant, #444746);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .theme-mode-toggle {
      display: flex;
      gap: 8px;
    }

    .theme-mode-btn {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid var(--m3-outline, #747775);
      border-radius: 12px;
      background: var(--m3-surface, #fef7ff);
      color: var(--m3-on-surface, #1f1f1f);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      font-family: inherit;
    }

    .theme-mode-btn:hover {
      background: var(--m3-surface-container-high, #e8eaed);
    }

    .theme-mode-btn.active {
      background: var(--m3-primary-container, #d3e3fd);
      border-color: var(--m3-primary, #1a73e8);
      color: var(--m3-on-primary-container, #041e49);
    }

    .theme-color-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .theme-color-btn {
      aspect-ratio: 1;
      border: 2px solid transparent;
      border-radius: 12px;
      background: var(--m3-surface, #fef7ff);
      cursor: pointer;
      padding: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-color-btn:hover {
      transform: scale(1.1);
    }

    .theme-color-btn.active {
      border-color: var(--m3-primary, #1a73e8);
      background: var(--m3-primary-container, #d3e3fd);
    }

    .theme-color-swatch {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background: var(--preset-color);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .theme-custom-color {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .theme-custom-color input[type="color"] {
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      padding: 0;
      background: transparent;
    }

    .theme-custom-color input[type="color"]::-webkit-color-swatch-wrapper {
      padding: 4px;
    }

    .theme-custom-color input[type="color"]::-webkit-color-swatch {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .theme-color-hex {
      font-family: 'Roboto Mono', monospace;
      font-size: 14px;
      color: var(--m3-on-surface-variant, #444746);
      text-transform: uppercase;
    }

    /* Dark mode adjustments */
    html.dark-mode .theme-panel,
    html.m3-dark .theme-panel {
      background: var(--m3-surface-container-high, #2d2d2d);
    }

    html.dark-mode .theme-panel-title,
    html.m3-dark .theme-panel-title {
      color: var(--m3-on-surface, #e1e1e1);
    }

    html.dark-mode .theme-panel-close,
    html.m3-dark .theme-panel-close {
      color: var(--m3-on-surface-variant, #a1a1a1);
    }

    html.dark-mode .theme-panel-close:hover,
    html.m3-dark .theme-panel-close:hover {
      background: var(--m3-surface-container-highest, #3d3d3d);
    }

    html.dark-mode .theme-panel-header,
    html.m3-dark .theme-panel-header {
      border-bottom-color: var(--m3-outline-variant, #3d3d3d);
    }

    html.dark-mode .theme-mode-btn,
    html.m3-dark .theme-mode-btn {
      background: var(--m3-surface, #1e1e1e);
      border-color: var(--m3-outline, #5c5c5c);
      color: var(--m3-on-surface, #e1e1e1);
    }

    html.dark-mode .theme-mode-btn:hover,
    html.m3-dark .theme-mode-btn:hover {
      background: var(--m3-surface-container, #2d2d2d);
    }

    html.dark-mode .theme-mode-btn.active,
    html.m3-dark .theme-mode-btn.active {
      background: var(--m3-primary-container, #004a77);
      border-color: var(--m3-primary, #8ab4f8);
      color: var(--m3-on-primary-container, #d3e3fd);
    }

    html.dark-mode .theme-color-btn,
    html.m3-dark .theme-color-btn {
      background: var(--m3-surface, #1e1e1e);
    }

    html.dark-mode .theme-color-btn.active,
    html.m3-dark .theme-color-btn.active {
      background: var(--m3-primary-container, #004a77);
      border-color: var(--m3-primary, #8ab4f8);
    }

    /* Language toggle */
    .theme-language-toggle {
      display: flex;
      gap: 8px;
    }

    .theme-lang-btn {
      flex: 1;
      padding: 10px 12px;
      border: 2px solid var(--m3-outline, #747775);
      border-radius: 12px;
      background: var(--m3-surface, #fef7ff);
      color: var(--m3-on-surface, #1f1f1f);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .theme-lang-btn:hover {
      background: var(--m3-surface-container-high, #e8eaed);
    }

    .theme-lang-btn.active {
      background: var(--m3-primary-container, #d3e3fd);
      border-color: var(--m3-primary, #1a73e8);
      color: var(--m3-on-primary-container, #041e49);
    }

    html.dark-mode .theme-lang-btn,
    html.m3-dark .theme-lang-btn {
      background: var(--m3-surface, #1e1e1e);
      border-color: var(--m3-outline, #5c5c5c);
      color: var(--m3-on-surface, #e1e1e1);
    }

    html.dark-mode .theme-lang-btn:hover,
    html.m3-dark .theme-lang-btn:hover {
      background: var(--m3-surface-container, #2d2d2d);
    }

    html.dark-mode .theme-lang-btn.active,
    html.m3-dark .theme-lang-btn.active {
      background: var(--m3-primary-container, #004a77);
      border-color: var(--m3-primary, #8ab4f8);
      color: var(--m3-on-primary-container, #d3e3fd);
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .theme-panel {
        width: calc(100vw - 48px);
        right: -12px;
      }
    }
  `;
  document.head.appendChild(styles);
}

/**
 * Get global theme instance
 * @returns {ThemeBuilder|null}
 */
export function getGlobalTheme() {
  return globalTheme;
}

/**
 * Set global theme seed color
 * @param {string} hexColor - Hex color code
 */
export function setGlobalThemeSeed(hexColor) {
  if (globalTheme) {
    globalTheme.setSeedColor(hexColor);
    localStorage.setItem('ssi-theme-seed-color', hexColor);
  }
}

/**
 * Toggle global dark mode
 */
export function toggleGlobalDarkMode() {
  if (globalTheme) {
    globalTheme.toggleDarkMode();
    localStorage.setItem('ssi-theme-dark-mode', globalTheme.darkMode);

    // Update toggle button
    const toggleBtn = document.getElementById('global-theme-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = globalTheme.darkMode ? '☀️' : '🌙';
    }
  }
}
