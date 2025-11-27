/**
 * Shared Layout Logic for SSI Builders Demo Pages
 * Creates consistent Sidebar navigation across all demo pages
 */

import { SidebarBuilder } from '../../src/SidebarBuilder.js';
import { IconManager } from '../../src/IconManager.js';
import { isNew, currentVersion } from '../../src/whats-new.js';

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
        href: '../../index.html#installation'
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
        href: '/docs/demos/m3-components.html'
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
