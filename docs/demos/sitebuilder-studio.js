import { SiteBuilder, ListBuilder, IconManager, ToastBuilder, ModalBuilder, TabBuilder, GlobalConfig, FormBuilder } from '/src/index.js';

// Helper function to adjust color brightness
function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Current Configuration
let config = {
    skeleton: 'admin',
    spacingValue: 40, // Pixel value for content padding (0-80)
    showSidebar: true,
    sidebarPosition: 'left',
    fixedHeader: false,
    showFooter: false,
    maxWidth: 'full',
    // Content settings
    content: {
        bgColor: 'transparent',
        title: 'Benutzerverwaltung',
        showTitle: true,
        maxWidth: 'full',
        align: 'left',
        headerGap: 0, // Gap between header and content (0-80)
        marginTop: 0, // Additional top margin (0-80)
        marginBottom: 0, // Additional bottom margin (0-80)
        borderRadius: 0, // Border radius (0-24)
        shadow: 'none' // Box shadow: none, sm, md, lg
    },
    theme: {
        color: '#1a73e8',
        darkMode: false
    },
    header: {
        title: 'Admin Dashboard',
        subtitle: '',
        logo: '',
        showTabs: true,
        tabs: [
            { label: 'Dashboard', icon: 'home', href: '#', active: true },
            { label: 'Projects', icon: 'folder', href: '#projects' },
            { label: 'Analytics', icon: 'chart', href: '#analytics', badge: '3' },
            { label: 'Settings', icon: 'settings', href: '#settings' }
        ],
        showUser: true,
        user: {
            name: 'Maria Schmidt',
            email: 'maria@ssi.at',
            avatar: 'https://i.pravatar.cc/150?img=47'
        },
        showSearch: true
    },
    navigation: [
        { label: 'Dashboard', icon: 'home', href: '#' },
        { label: 'Content', icon: 'list', href: '#' },
        { label: 'Settings', icon: 'settings', href: '#' }
    ],
    headerActions: [
        { label: 'New', icon: 'add', type: 'primary' }
    ],
    footer: {
        copyright: '© 2025 SSI Solutions',
        links: [
            { label: 'Privacy', href: '#privacy' },
            { label: 'Terms', href: '#terms' }
        ]
    },
    configName: ''
};

// Available icons for navigation
const availableIcons = ['home', 'list', 'settings', 'star', 'chart', 'folder', 'bell', 'grid', 'book', 'info', 'search', 'add', 'edit', 'delete', 'filter', 'download', 'upload'];

// Studio Form Instance
let studioForm = null;

// Current selected element for editing
let currentElement = 'page';

// Undo/Redo History
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

function saveToHistory() {
    // Remove any future history if we're not at the end
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }

    // Add current state
    historyStack.push(JSON.stringify(config));

    // Limit history size
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    } else {
        historyIndex++;
    }

    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        config = JSON.parse(historyStack[historyIndex]);
        applyConfigToUI();
        createPreview();
        updateUndoRedoButtons();
        ToastBuilder.info('Undo');
    }
}

function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        config = JSON.parse(historyStack[historyIndex]);
        applyConfigToUI();
        createPreview();
        updateUndoRedoButtons();
        ToastBuilder.info('Redo');
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= historyStack.length - 1;
}

function applyConfigToUI() {
    // Re-initialize form with updated config values
    initElementForm(currentElement);
}

let currentSite = null;

// Sample Data
const sampleData = [
    { id: 1, name: 'Anna Schmidt', email: 'anna@example.com', status: 'Aktiv', role: 'Admin' },
    { id: 2, name: 'Max Mustermann', email: 'max@example.com', status: 'Inaktiv', role: 'User' },
    { id: 3, name: 'Lisa Müller', email: 'lisa@example.com', status: 'Aktiv', role: 'Editor' },
    { id: 4, name: 'Tom Weber', email: 'tom@example.com', status: 'Aktiv', role: 'User' },
    { id: 5, name: 'Sarah Klein', email: 'sarah@example.com', status: 'Inaktiv', role: 'Viewer' }
];

// Skeleton Templates
const skeletons = {
    admin: {
        name: 'Admin Dashboard',
        layout: 'admin',
        sidebar: true,
        header: {
            title: 'Admin Dashboard',
            menu: [
                { label: 'Dashboard', icon: IconManager.getIcon('home') },
                { label: 'Users', icon: IconManager.getIcon('list') }
            ]
        },
        content: `
            <h2 style="font-size: 24px; font-weight: 500; margin-bottom: 16px;">Benutzerverwaltung</h2>
            <div id="user-list"></div>
        `
    },
    landing: {
        name: 'Landing Page',
        layout: 'landing',
        sidebar: false,
        header: {
            title: 'My Product',
            menu: [
                { label: 'Features', icon: IconManager.getIcon('star') },
                { label: 'Pricing', icon: IconManager.getIcon('info') },
                { label: 'Contact', icon: IconManager.getIcon('bell') }
            ]
        },
        content: `
            <div style="text-align: center; max-width: 800px; margin: 0 auto; padding: 60px 20px;">
                <h1 style="font-size: 48px; font-weight: 600; margin-bottom: 24px; color: var(--ssi-text);">
                    Build Amazing Websites
                </h1>
                <p style="font-size: 20px; color: var(--ssi-text-secondary); margin-bottom: 32px; line-height: 1.6;">
                    With SSI Builders, create professional websites in minutes. No coding required.
                </p>
                <div style="display: flex; gap: 16px; justify-content: center;">
                    <button style="padding: 14px 32px; background: var(--ssi-primary); color: var(--ssi-on-primary); border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                        Get Started
                    </button>
                    <button style="padding: 14px 32px; background: transparent; color: var(--ssi-primary); border: 2px solid var(--ssi-primary); border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                        Learn More
                    </button>
                </div>
            </div>
        `
    },
    blog: {
        name: 'Blog Layout',
        layout: 'website',
        sidebar: true,
        header: {
            title: 'My Blog',
            menu: [
                { label: 'Home', icon: IconManager.getIcon('home') },
                { label: 'Articles', icon: IconManager.getIcon('book') },
                { label: 'About', icon: IconManager.getIcon('info') }
            ]
        },
        content: `
            <div style="max-width: 800px;">
                <article style="background: var(--ssi-surface); padding: 32px; border-radius: 12px; box-shadow: var(--ssi-shadow-sm); margin-bottom: 24px; border: 1px solid var(--ssi-border);">
                    <h2 style="font-size: 32px; font-weight: 600; margin-bottom: 16px; color: var(--ssi-text);">Getting Started with SSI Builders</h2>
                    <p style="color: var(--ssi-text-secondary); margin-bottom: 12px; font-size: 14px;">Published on Nov 30, 2025 • 5 min read</p>
                    <p style="line-height: 1.8; color: var(--ssi-text);">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </article>
            </div>
        `
    },
    ecommerce: {
        name: 'E-Commerce',
        layout: 'admin',
        sidebar: true,
        header: {
            title: 'Shop Admin',
            menu: [
                { label: 'Products', icon: IconManager.getIcon('grid') },
                { label: 'Orders', icon: IconManager.getIcon('list') }
            ]
        },
        content: `
            <h2 style="font-size: 24px; font-weight: 500; margin-bottom: 16px;">Produktverwaltung</h2>
            <div id="user-list"></div>
        `
    }
};

// Update Site Configuration
function updateSite() {
    // Apply Theme
    GlobalConfig.setThemeFromSeed(config.theme.color, config.theme.darkMode);

    if (!currentSite) {
        // Initial creation
        createPreview();
        setupPreviewClickHandlers();
        updateEditFrame(currentElement);
        return;
    }

    const skeleton = skeletons[config.skeleton];

    // Build navigation from config
    const navigation = config.navigation.map(item => ({
        label: item.label,
        icon: IconManager.getIcon(item.icon),
        href: item.href
    }));

    // Build header actions from config
    const headerActions = config.headerActions.map(action => ({
        label: action.label,
        icon: IconManager.getIcon(action.icon),
        type: action.type,
        onClick: () => ToastBuilder.info(`${action.label} clicked`)
    }));

    // Build header tabs from config
    const headerTabs = config.header.showTabs ? config.header.tabs.map(tab => ({
        label: tab.label,
        icon: tab.icon,
        href: tab.href,
        active: tab.active,
        badge: tab.badge
    })) : [];

    // Build user menu config
    const userMenu = config.header.showUser ? {
        name: config.header.user.name,
        email: config.header.user.email,
        avatar: config.header.user.avatar,
        menu: [
            { label: 'Mein Profil', icon: 'settings', onClick: () => ToastBuilder.info('Profile clicked') },
            { label: 'Einstellungen', icon: 'settings', onClick: () => ToastBuilder.info('Settings clicked') },
            { type: 'divider' },
            { label: 'Abmelden', icon: 'close', onClick: () => ToastBuilder.warning('Logged out') }
        ]
    } : null;

    // Build search config
    const searchConfig = config.header.showSearch ? {
        placeholder: 'Search...',
        onSearch: (query) => ToastBuilder.info(`Searching: ${query}`),
        onClear: () => ToastBuilder.info('Search cleared')
    } : null;

    // Build logo - SSI Style gradient if no custom logo
    const logoHtml = config.header.logo || `<div style="width: 36px; height: 36px; background: linear-gradient(135deg, ${config.theme.color}, ${adjustColor(config.theme.color, 30)}); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; letter-spacing: -0.5px;">SSI</div>`;

    // Use new update() method - navigation must ALWAYS be provided!
    currentSite.update({
        header: {
            title: config.header.title || skeleton.header.title,
            subtitle: config.header.subtitle || null,
            logo: logoHtml,
            menu: headerTabs,
            fixed: config.fixedHeader,
            actions: headerActions,
            search: searchConfig,
            user: userMenu
        },
        sidebar: {
            show: config.showSidebar,
            position: config.sidebarPosition,
            navigation: navigation
        },
        content: {
            padding: config.spacingValue,
            maxWidth: config.maxWidth
        },
        footer: {
            show: config.showFooter,
            copyright: config.footer.copyright,
            links: config.footer.links
        }
    });

    // Apply additional content settings directly to DOM
    applyContentSettings();

    updatePreviewInfo();
}

// Apply content settings that aren't directly supported by SiteBuilder
function applyContentSettings() {
    const previewFrame = document.getElementById('preview-frame');
    if (!previewFrame) return;

    const siteMain = previewFrame.querySelector('.site-main');
    const siteContent = previewFrame.querySelector('.site-content');
    const contentInner = previewFrame.querySelector('.site-content-inner');
    const pageTitle = previewFrame.querySelector('.site-content h2');

    // Apply header gap (margin-top on site-main)
    if (siteMain) {
        siteMain.style.marginTop = `${64 + config.content.headerGap}px`;

        // Apply additional top/bottom margins
        siteMain.style.paddingTop = `${config.content.marginTop}px`;
        siteMain.style.paddingBottom = `${config.content.marginBottom}px`;

        // Apply background color
        siteMain.style.backgroundColor = config.content.bgColor === 'transparent' ? '' : config.content.bgColor;
    }

    // Apply content inner styles
    if (contentInner) {
        // Max width
        const maxWidth = config.content.maxWidth === 'full' ? 'none' : `${config.content.maxWidth}px`;
        contentInner.style.maxWidth = maxWidth;
        contentInner.style.margin = config.content.align === 'center' ? '0 auto' : '0';

        // Border radius
        contentInner.style.borderRadius = `${config.content.borderRadius}px`;

        // Box shadow
        const shadowMap = {
            'none': 'none',
            'sm': 'var(--ssi-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
            'md': 'var(--ssi-shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
            'lg': 'var(--ssi-shadow-lg, 0 10px 15px rgba(0,0,0,0.1))'
        };
        contentInner.style.boxShadow = shadowMap[config.content.shadow] || 'none';

        // If we have shadow or border radius and background is transparent, apply a subtle background
        if ((config.content.shadow !== 'none' || config.content.borderRadius > 0) && config.content.bgColor === 'transparent') {
            contentInner.style.backgroundColor = 'var(--m3-surface, #ffffff)';
        }
    }

    // Update page title
    if (pageTitle && config.content.title) {
        pageTitle.textContent = config.content.title;
        pageTitle.style.display = config.content.showTitle ? '' : 'none';
    }
}

// Initial Creation
function createPreview() {
    // Apply Theme first
    GlobalConfig.setThemeFromSeed(config.theme.color, config.theme.darkMode);

    const skeleton = skeletons[config.skeleton];

    // Build navigation from config
    const navigation = config.navigation.map(item => ({
        label: item.label,
        icon: IconManager.getIcon(item.icon),
        href: item.href
    }));

    // Build header actions from config
    const headerActions = config.headerActions.map(action => ({
        label: action.label,
        icon: IconManager.getIcon(action.icon),
        type: action.type,
        onClick: () => ToastBuilder.info(`${action.label} clicked`)
    }));

    // Build header tabs from config
    const headerTabs = config.header.showTabs ? config.header.tabs.map(tab => ({
        label: tab.label,
        icon: tab.icon,
        href: tab.href,
        active: tab.active,
        badge: tab.badge
    })) : [];

    // Build user menu config
    const userMenu = config.header.showUser ? {
        name: config.header.user.name,
        email: config.header.user.email,
        avatar: config.header.user.avatar,
        menu: [
            { label: 'Mein Profil', icon: 'settings', onClick: () => ToastBuilder.info('Profile clicked') },
            { label: 'Einstellungen', icon: 'settings', onClick: () => ToastBuilder.info('Settings clicked') },
            { type: 'divider' },
            { label: 'Abmelden', icon: 'close', onClick: () => ToastBuilder.warning('Logged out') }
        ]
    } : null;

    // Build search config
    const searchConfig = config.header.showSearch ? {
        placeholder: 'Search...',
        onSearch: (query) => ToastBuilder.info(`Searching: ${query}`),
        onClear: () => ToastBuilder.info('Search cleared')
    } : null;

    // Build logo - SSI Style gradient if no custom logo
    const logoHtml = config.header.logo || `<div style="width: 36px; height: 36px; background: linear-gradient(135deg, ${config.theme.color}, ${adjustColor(config.theme.color, 30)}); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; letter-spacing: -0.5px;">SSI</div>`;

    currentSite = new SiteBuilder({
        containerId: 'preview-frame',
        layout: skeleton.layout,
        header: {
            title: config.header.title || skeleton.header.title,
            subtitle: config.header.subtitle || null,
            logo: logoHtml,
            menu: headerTabs,
            fixed: config.fixedHeader,
            actions: headerActions,
            search: searchConfig,
            user: userMenu
        },
        sidebar: {
            show: config.showSidebar,
            position: config.sidebarPosition,
            navigation: navigation
        },
        content: {
            padding: config.spacingValue,
            maxWidth: config.maxWidth
        },
        footer: {
            show: config.showFooter,
            copyright: config.footer.copyright,
            links: config.footer.links
        }
    });

    currentSite.renderContent(skeleton.content);

    // Add ListBuilder if user-list exists
    setTimeout(() => {
        const userListEl = document.getElementById('user-list');
        if (userListEl) {
            new ListBuilder({
                containerId: 'user-list',
                data: sampleData,
                columns: [
                    { key: 'name', label: 'Name', width: 3 },
                    { key: 'email', label: 'E-Mail', width: 3 },
                    { key: 'role', label: 'Rolle', width: 2 },
                    { key: 'status', label: 'Status', width: 2 }
                ],
                options: { searchable: true, responsive: true },
                rowActions: [
                    {
                        label: 'Edit',
                        icon: IconManager.getIcon('edit'),
                        onClick: (row) => ToastBuilder.info(`Edit ${row.name}`)
                    }
                ]
            });
        }
    }, 100);

    updatePreviewInfo();
}

function updatePreviewInfo() {
    const skeleton = skeletons[config.skeleton];
    document.getElementById('preview-info').textContent =
        `${skeleton.name} • ${config.spacingValue}px Padding • ${config.theme.darkMode ? 'Dark' : 'Light'}`;
}

// =============================================================
// STUDIO FORM - FormBuilder-based configuration panel
// =============================================================
// NOTE: initStudioForm() replaced by initElementForm() - see ELEMENT TABS section below
// =============================================================

function handleFormChange(values, changedField) {
    // Update config based on form values
    config.skeleton = values.skeleton;
    config.header.title = values.headerTitle;
    config.header.subtitle = values.headerSubtitle;
    config.header.logo = values.headerLogo;
    config.spacingValue = values.spacingValue;
    config.theme.color = values.themeColor;
    config.theme.darkMode = values.darkMode;
    config.showSidebar = values.showSidebar;
    config.sidebarPosition = values.sidebarPosition;
    config.fixedHeader = values.fixedHeader;
    config.showFooter = values.showFooter;
    config.maxWidth = values.maxWidth;
    config.footer.copyright = values.footerCopyright;
    config.configName = values.configName;

    // Content settings
    if (values.contentBgColor !== undefined) config.content.bgColor = values.contentBgColor;
    if (values.contentTitle !== undefined) config.content.title = values.contentTitle;
    if (values.showContentTitle !== undefined) config.content.showTitle = values.showContentTitle;
    if (values.contentMaxWidth !== undefined) config.content.maxWidth = values.contentMaxWidth;
    if (values.contentAlign !== undefined) config.content.align = values.contentAlign;
    if (values.contentHeaderGap !== undefined) config.content.headerGap = values.contentHeaderGap;
    if (values.contentMarginTop !== undefined) config.content.marginTop = values.contentMarginTop;
    if (values.contentMarginBottom !== undefined) config.content.marginBottom = values.contentMarginBottom;
    if (values.contentBorderRadius !== undefined) config.content.borderRadius = values.contentBorderRadius;
    if (values.contentShadow !== undefined) config.content.shadow = values.contentShadow;

    // Handle navigation items
    if (values.navigation) {
        config.navigation = values.navigation.map(n => ({
            label: n.label || 'Item',
            icon: n.icon || 'star',
            href: '#'
        }));
    }

    // Handle header actions
    if (values.headerActions) {
        config.headerActions = values.headerActions.map(a => ({
            label: a.label || 'Action',
            icon: a.icon || 'star',
            type: a.type || 'text'
        }));
    }

    // Handle footer links
    if (values.footerLinks) {
        config.footer.links = values.footerLinks.map(l => ({
            label: l.label || 'Link',
            href: l.href || '#'
        }));
    }

    // Special handling for skeleton change - apply sidebar default
    if (changedField === 'skeleton') {
        const skeleton = skeletons[config.skeleton];
        config.showSidebar = skeleton.sidebar;
        // Need to update the form - stay on current element
        initElementForm(currentElement);
        createPreview();
        setupPreviewClickHandlers();
        ToastBuilder.success(`Skeleton: ${skeleton.name}`);
        return;
    }

    // Show toast for specific changes (not for slider values - too many updates)
    if (changedField === 'themeColor') {
        ToastBuilder.success('Theme Color Updated');
    } else if (changedField === 'darkMode') {
        ToastBuilder.success(config.theme.darkMode ? 'Dark Mode Enabled' : 'Light Mode Enabled');
    } else if (changedField === 'sidebarPosition') {
        ToastBuilder.success(`Sidebar Position: ${config.sidebarPosition}`);
    }
    // Note: spacingValue toast removed - too many updates during slider drag

    updateSite();
}

// ========================================
// ELEMENT TABS & EDIT FRAME SYSTEM
// ========================================

// Element field definitions - each element has its own form fields
const elementFields = {
    page: [
        // Layout Skeleton
        {
            key: '_section_skeleton',
            type: 'section-header',
            number: 1,
            label: 'LAYOUT SKELETON'
        },
        {
            key: 'skeleton',
            type: 'card-select',
            columns: 2,
            options: [
                { value: 'admin', label: 'Admin Dashboard', icon: '📊' },
                { value: 'landing', label: 'Landing Page', icon: '🏠' },
                { value: 'blog', label: 'Blog Layout', icon: '📝' },
                { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' }
            ]
        },
        // Theme Customization
        {
            key: '_section_theme',
            type: 'section-header',
            number: 2,
            label: 'THEME'
        },
        {
            key: 'themeColor',
            type: 'color-swatches',
            label: 'Primary Color',
            colors: [
                { value: '#1a73e8', label: 'Blue' },
                { value: '#9334e6', label: 'Purple' },
                { value: '#009688', label: 'Teal' },
                { value: '#e6710a', label: 'Orange' },
                { value: '#ea4335', label: 'Red' }
            ]
        },
        {
            key: 'darkMode',
            type: 'inline-checkbox',
            checkboxLabel: 'Dark Mode'
        },
        // Container Width
        {
            key: '_section_width',
            type: 'section-header',
            number: 3,
            label: 'CONTAINER WIDTH'
        },
        {
            key: 'maxWidth',
            type: 'button-group',
            options: [
                { value: '1200', label: '1200px' },
                { value: 'full', label: 'Full' }
            ]
        },
        // Save Configuration
        {
            key: '_section_save',
            type: 'section-header',
            number: 4,
            label: 'SAVE CONFIGURATION'
        },
        {
            key: 'configName',
            type: 'text',
            label: 'Configuration Name',
            placeholder: 'My Layout Config'
        }
    ],
    header: [
        // Header Settings
        {
            key: '_section_header',
            type: 'section-header',
            number: 1,
            label: 'HEADER SETTINGS'
        },
        {
            key: 'headerTitle',
            type: 'text',
            label: 'App Title',
            placeholder: 'Enter title...'
        },
        {
            key: 'headerSubtitle',
            type: 'text',
            label: 'Subtitle',
            placeholder: 'Optional subtitle...'
        },
        {
            key: 'headerLogo',
            type: 'text',
            label: 'Logo URL',
            placeholder: 'https://example.com/logo.svg'
        },
        {
            key: 'fixedHeader',
            type: 'inline-checkbox',
            checkboxLabel: 'Fixed Header (Sticky)'
        },
        // Header Actions
        {
            key: '_section_actions',
            type: 'section-header',
            number: 2,
            label: 'HEADER ACTIONS'
        },
        {
            key: 'headerActions',
            type: 'item-list',
            addLabel: 'Add Action Button',
            itemFields: [
                { key: 'label', type: 'text', placeholder: 'Label' },
                {
                    key: 'icon',
                    type: 'select',
                    options: availableIcons.map(icon => ({ value: icon, label: icon }))
                },
                {
                    key: 'type',
                    type: 'select',
                    options: [
                        { value: 'primary', label: 'Primary' },
                        { value: 'text', label: 'Text' },
                        { value: 'outlined', label: 'Outlined' }
                    ]
                }
            ]
        }
    ],
    sidebar: [
        // Sidebar Settings
        {
            key: '_section_sidebar',
            type: 'section-header',
            number: 1,
            label: 'SIDEBAR SETTINGS'
        },
        {
            key: 'showSidebar',
            type: 'inline-checkbox',
            checkboxLabel: 'Show Sidebar'
        },
        {
            key: 'sidebarPosition',
            type: 'button-group',
            label: 'Position',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' }
            ]
        },
        // Navigation Items
        {
            key: '_section_nav',
            type: 'section-header',
            number: 2,
            label: 'NAVIGATION ITEMS'
        },
        {
            key: 'navigation',
            type: 'item-list',
            addLabel: 'Add Navigation Item',
            itemFields: [
                { key: 'label', type: 'text', placeholder: 'Label' },
                {
                    key: 'icon',
                    type: 'select',
                    options: availableIcons.map(icon => ({ value: icon, label: icon }))
                }
            ]
        }
    ],
    content: [
        // Content Spacing
        {
            key: '_section_spacing',
            type: 'section-header',
            number: 1,
            label: 'SPACING'
        },
        {
            key: 'spacingValue',
            type: 'slider',
            label: 'Padding',
            min: 0,
            max: 80,
            step: 4,
            unit: 'px',
            discrete: true,
            showTicks: false
        },
        {
            key: 'contentHeaderGap',
            type: 'slider',
            label: 'Header Gap',
            min: 0,
            max: 80,
            step: 4,
            unit: 'px',
            discrete: true,
            showTicks: false
        },
        {
            key: 'contentMarginTop',
            type: 'slider',
            label: 'Top Margin',
            min: 0,
            max: 80,
            step: 4,
            unit: 'px',
            discrete: true,
            showTicks: false
        },
        {
            key: 'contentMarginBottom',
            type: 'slider',
            label: 'Bottom Margin',
            min: 0,
            max: 80,
            step: 4,
            unit: 'px',
            discrete: true,
            showTicks: false
        },
        // Content Style
        {
            key: '_section_content_style',
            type: 'section-header',
            number: 2,
            label: 'STYLE'
        },
        {
            key: 'contentBgColor',
            type: 'color-swatches',
            label: 'Background',
            colors: [
                { value: 'transparent', label: 'None' },
                { value: '#ffffff', label: 'White' },
                { value: '#f8f9fa', label: 'Gray' },
                { value: '#e8f0fe', label: 'Blue' }
            ]
        },
        {
            key: 'contentBorderRadius',
            type: 'slider',
            label: 'Border Radius',
            min: 0,
            max: 24,
            step: 4,
            unit: 'px',
            discrete: true,
            showTicks: false
        },
        {
            key: 'contentShadow',
            type: 'button-group',
            label: 'Shadow',
            options: [
                { value: 'none', label: 'None' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' }
            ]
        },
        // Content Title
        {
            key: '_section_content_title',
            type: 'section-header',
            number: 3,
            label: 'PAGE TITLE'
        },
        {
            key: 'contentTitle',
            type: 'text',
            label: 'Title Text',
            placeholder: 'Enter page title...'
        },
        {
            key: 'showContentTitle',
            type: 'inline-checkbox',
            checkboxLabel: 'Show Title'
        },
        // Content Layout
        {
            key: '_section_content_layout',
            type: 'section-header',
            number: 4,
            label: 'LAYOUT'
        },
        {
            key: 'contentMaxWidth',
            type: 'button-group',
            label: 'Max Width',
            options: [
                { value: '800', label: '800' },
                { value: '1000', label: '1000' },
                { value: '1200', label: '1200' },
                { value: 'full', label: 'Full' }
            ]
        },
        {
            key: 'contentAlign',
            type: 'button-group',
            label: 'Align',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' }
            ]
        }
    ],
    footer: [
        // Footer Settings
        {
            key: '_section_footer',
            type: 'section-header',
            number: 1,
            label: 'FOOTER SETTINGS'
        },
        {
            key: 'showFooter',
            type: 'inline-checkbox',
            checkboxLabel: 'Show Footer'
        },
        {
            key: 'footerCopyright',
            type: 'text',
            label: 'Copyright Text',
            placeholder: '© 2025 Your Company'
        },
        {
            key: 'footerLinks',
            type: 'item-list',
            label: 'Footer Links',
            addLabel: 'Add Footer Link',
            itemFields: [
                { key: 'label', type: 'text', placeholder: 'Label' },
                { key: 'href', type: 'text', placeholder: 'URL' }
            ]
        }
    ]
};

// Get initial values for a specific element
function getInitialValuesForElement(element) {
    const baseValues = {
        skeleton: config.skeleton,
        headerTitle: config.header.title,
        headerSubtitle: config.header.subtitle || '',
        headerLogo: config.header.logo || '',
        spacingValue: config.spacingValue,
        themeColor: config.theme.color,
        darkMode: config.theme.darkMode,
        showSidebar: config.showSidebar,
        sidebarPosition: config.sidebarPosition,
        fixedHeader: config.fixedHeader,
        showFooter: config.showFooter,
        navigation: config.navigation.map(n => ({ label: n.label, icon: n.icon })),
        maxWidth: config.maxWidth,
        headerActions: config.headerActions.map(a => ({ label: a.label, icon: a.icon, type: a.type })),
        footerCopyright: config.footer.copyright,
        footerLinks: config.footer.links.map(l => ({ label: l.label, href: l.href })),
        configName: config.configName || '',
        // Content settings
        contentBgColor: config.content.bgColor,
        contentTitle: config.content.title,
        showContentTitle: config.content.showTitle,
        contentMaxWidth: config.content.maxWidth,
        contentAlign: config.content.align,
        contentHeaderGap: config.content.headerGap || 0,
        contentMarginTop: config.content.marginTop || 0,
        contentMarginBottom: config.content.marginBottom || 0,
        contentBorderRadius: config.content.borderRadius || 0,
        contentShadow: config.content.shadow || 'none'
    };
    return baseValues;
}

// Initialize form for a specific element
function initElementForm(element) {
    // Destroy existing form
    if (studioForm) {
        studioForm.destroy();
    }

    // Clear container
    const container = document.getElementById('studio-form-container');
    container.innerHTML = '';

    // Get fields for selected element
    const fields = elementFields[element] || elementFields.page;

    // Create new form
    studioForm = new FormBuilder({
        containerId: 'studio-form-container',
        fields: fields,
        options: {
            showActions: false,
            layout: 'vertical',
            density: 'dense',
            initialValues: getInitialValuesForElement(element),
            onChange: (values, changedField) => {
                handleFormChange(values, changedField);
            }
        }
    });

    studioForm.render();

    // Add storage buttons only for 'page' tab
    if (element === 'page') {
        const storageHtml = `
            <div class="storage-buttons" style="margin-top: 16px;">
                <button class="storage-btn primary" id="save-config">💾 Save</button>
                <button class="storage-btn" id="load-config">📂 Load</button>
            </div>
            <div id="saved-configs-list" class="saved-configs-list"></div>
        `;
        container.insertAdjacentHTML('beforeend', storageHtml);

        // Attach storage button listeners
        document.getElementById('save-config')?.addEventListener('click', saveConfiguration);
        document.getElementById('load-config')?.addEventListener('click', showLoadModal);
        renderSavedConfigs();
    }
}

// Switch to a different element tab
function switchToElement(element) {
    currentElement = element;

    // Update tab UI
    document.querySelectorAll('.element-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.element === element);
    });

    // Re-render form for selected element
    initElementForm(element);

    // Update edit frame in preview
    updateEditFrame(element);
}

// Update edit frame highlighting in preview
function updateEditFrame(element) {
    const previewFrame = document.getElementById('preview-frame');
    if (!previewFrame) return;

    // Remove all existing edit highlights
    previewFrame.querySelectorAll('.edit-highlight').forEach(el => {
        el.classList.remove('edit-highlight');
        el.removeAttribute('data-edit-label');
    });

    // Element to selector mapping (using SiteBuilder's actual class names)
    const selectorMap = {
        page: null, // Page doesn't highlight anything specific
        header: '.site-header-container',
        sidebar: '.sidebar, .site-sidebar-container',
        content: '.site-main',
        footer: '.site-footer'
    };

    const selector = selectorMap[element];
    if (selector) {
        const targetEl = previewFrame.querySelector(selector);
        if (targetEl) {
            targetEl.classList.add('edit-highlight');
            targetEl.setAttribute('data-edit-label', element.charAt(0).toUpperCase() + element.slice(1));
        }
    }
}

// Make preview elements clickable to select them
function setupPreviewClickHandlers() {
    const previewFrame = document.getElementById('preview-frame');
    if (!previewFrame) return;

    // Add click handlers after a short delay to ensure preview is rendered
    setTimeout(() => {
        const clickableElements = [
            { selector: '.site-header-container', element: 'header' },
            { selector: '.sidebar, .site-sidebar-container', element: 'sidebar' },
            { selector: '.site-main', element: 'content' },
            { selector: '.site-footer', element: 'footer' }
        ];

        clickableElements.forEach(({ selector, element }) => {
            const el = previewFrame.querySelector(selector);
            if (el) {
                el.classList.add('edit-clickable');
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    switchToElement(element);
                });
            }
        });
    }, 100);
}

// Initialize element tab listeners
function initElementTabs() {
    document.querySelectorAll('.element-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const element = tab.dataset.element;
            if (element) {
                switchToElement(element);
            }
        });
    });
}

// ========================================
// END ELEMENT TABS SYSTEM
// ========================================

// Panel Toggle
const controlPanel = document.getElementById('control-panel');
const panelToggle = document.getElementById('panel-toggle');

function updateToggleIcon() {
    const isMobile = window.innerWidth < 768;
    const isCollapsed = controlPanel.classList.contains('collapsed');

    if (isMobile) {
        panelToggle.textContent = isCollapsed ? '▼' : '▲';
    } else {
        panelToggle.textContent = isCollapsed ? '▶' : '◀';
    }
}

panelToggle.addEventListener('click', () => {
    controlPanel.classList.toggle('collapsed');
    updateToggleIcon();
});

window.addEventListener('resize', updateToggleIcon);
updateToggleIcon();

// Export Code Function
window.exportCode = async function() {
    const generatedCode = generateExportCode();

    const modalContent = `
        <div style="position: relative;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 12px; gap: 8px;">
                <button id="copy-code-btn" style="
                    padding: 8px 16px;
                    background: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    📋 Copy to Clipboard
                </button>
                <button id="download-code-btn" style="
                    padding: 8px 16px;
                    background: white;
                    color: #1a73e8;
                    border: 1px solid #1a73e8;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    💾 Download
                </button>
            </div>
            <pre id="code-preview" style="
                background: #1e1e1e;
                color: #d4d4d4;
                padding: 20px;
                border-radius: 8px;
                overflow-x: auto;
                font-size: 13px;
                line-height: 1.6;
                max-height: 500px;
                overflow-y: auto;
            ">${escapeHtml(generatedCode)}</pre>
        </div>
    `;

    const modal = new ModalBuilder({
        title: '📦 Export Code',
        size: 'large',
        content: modalContent,
        buttons: [
            {
                label: 'Close',
                onClick: (modal) => modal.close()
            }
        ]
    });

    modal.open();

    // Add copy functionality after modal is open
    setTimeout(() => {
        document.getElementById('copy-code-btn')?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(generatedCode);
                ToastBuilder.success('Code copied to clipboard!');
            } catch (err) {
                ToastBuilder.error('Failed to copy code');
            }
        });

        document.getElementById('download-code-btn')?.addEventListener('click', () => {
            const blob = new Blob([generatedCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitebuilder-config.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            ToastBuilder.success('File downloaded!');
        });
    }, 100);
};

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// (Old Header Settings Event Listeners removed - handled by FormBuilder)

// Viewport Switcher
document.querySelectorAll('.viewport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const viewport = btn.dataset.viewport;
        const wrapper = document.getElementById('preview-wrapper');

        wrapper.classList.remove('viewport-desktop', 'viewport-tablet', 'viewport-mobile');
        wrapper.classList.add(`viewport-${viewport}`);

        ToastBuilder.info(`Viewport: ${viewport.charAt(0).toUpperCase() + viewport.slice(1)}`);
    });
});

// Code Preview Toggle
document.getElementById('toggle-code-preview').addEventListener('click', async () => {
    const btn = document.getElementById('toggle-code-preview');
    btn.classList.toggle('active');

    if (btn.classList.contains('active')) {
        // Show code preview
        exportCode();
    }
});

// Generate Code String for Export
function generateExportCode() {
    const skeleton = skeletons[config.skeleton];

    const navigationCode = config.navigation.map(item =>
        `                { label: '${item.label}', icon: IconManager.getIcon('${item.icon}'), href: '${item.href}' }`
    ).join(',\n');

    return `<!-- SSI Builders - SiteBuilder Configuration -->
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.header.title || skeleton.header.title}</title>

    <!-- SSI Builders CSS -->
    <link rel="stylesheet" href="/vendor/ssi-builders/src/shared.css">
    <link rel="stylesheet" href="/vendor/ssi-builders/src/SiteBuilder.css">
    <link rel="stylesheet" href="/vendor/ssi-builders/src/SidebarBuilder.css">
    <link rel="stylesheet" href="/vendor/ssi-builders/src/ListBuilder.css">
</head>
<body>
    <div id="app"></div>

    <script type="module">
        import { SiteBuilder, IconManager, GlobalConfig } from '/vendor/ssi-builders/src/index.js';

        // Configure Theme
        GlobalConfig.setThemeFromSeed('${config.theme.color}', ${config.theme.darkMode});

        // Create Site
        const site = new SiteBuilder({
            containerId: 'app',
            layout: '${skeleton.layout}',
            header: {
                title: '${config.header.title || skeleton.header.title}',
                subtitle: '${config.header.subtitle || ''}',
                ${config.header.logo ? `logo: '${config.header.logo}',` : '// logo: null,'}
                fixed: ${config.fixedHeader}
            },
            sidebar: {
                show: ${config.showSidebar},
                position: '${config.sidebarPosition}',
                navigation: [
${navigationCode}
                ]
            },
            content: {
                padding: ${config.spacingValue},
                maxWidth: '${config.maxWidth}'
            },
            footer: {
                show: ${config.showFooter},
                copyright: '© ${new Date().getFullYear()} Your Company'
            }
        });

        // Render your content
        site.renderContent(\`
            <h1>Welcome!</h1>
            <p>Your content goes here.</p>
        \`);
    </script>
</body>
</html>`;
}

// (Old Header Actions, Footer Links Editors removed - handled by FormBuilder)

// Undo/Redo Event Listeners
document.getElementById('undo-btn')?.addEventListener('click', undo);
document.getElementById('redo-btn')?.addEventListener('click', redo);

// Keyboard shortcuts for Undo/Redo
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
            redo();
        } else {
            undo();
        }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    }
});

// Reset Button
document.getElementById('reset-btn')?.addEventListener('click', async () => {
    const confirmed = await ModalBuilder.confirm({
        title: 'Reset Configuration',
        message: 'Are you sure you want to reset all settings to defaults? This cannot be undone.',
        danger: true
    });

    if (confirmed) {
        config = {
            skeleton: 'admin',
            spacingValue: 40,
            showSidebar: true,
            sidebarPosition: 'left',
            fixedHeader: false,
            showFooter: false,
            maxWidth: 'full',
            theme: { color: '#1a73e8', darkMode: false },
            header: { title: 'Admin Dashboard', subtitle: '', logo: '' },
            navigation: [
                { label: 'Dashboard', icon: 'home', href: '#' },
                { label: 'Content', icon: 'list', href: '#' },
                { label: 'Settings', icon: 'settings', href: '#' }
            ],
            headerActions: [{ label: 'New', icon: 'add', type: 'primary' }],
            footer: {
                copyright: '© 2025 SSI Solutions',
                links: [
                    { label: 'Privacy', href: '#privacy' },
                    { label: 'Terms', href: '#terms' }
                ]
            }
        };
        saveToHistory();
        applyConfigToUI();
        createPreview();
        ToastBuilder.success('Configuration reset to defaults');
    }
});

// Save/Load Configuration
function getSavedConfigs() {
    const saved = localStorage.getItem('sitebuilder-configs');
    return saved ? JSON.parse(saved) : {};
}

function saveConfigs(configs) {
    localStorage.setItem('sitebuilder-configs', JSON.stringify(configs));
}

function renderSavedConfigs() {
    const container = document.getElementById('saved-configs-list');
    if (!container) return;

    const configs = getSavedConfigs();
    const configNames = Object.keys(configs);

    if (configNames.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; color: #5f6368; text-align: center;">No saved configurations</p>';
        return;
    }

    container.innerHTML = configNames.map(name => `
        <div class="saved-config-item" data-name="${name}">
            <span class="saved-config-name">${name}</span>
            <div class="saved-config-actions">
                <button class="load-config-btn" title="Load">📂</button>
                <button class="delete-config-btn" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.saved-config-item').forEach(item => {
        const name = item.dataset.name;

        item.querySelector('.saved-config-name').addEventListener('click', () => loadConfigByName(name));
        item.querySelector('.load-config-btn').addEventListener('click', () => loadConfigByName(name));
        item.querySelector('.delete-config-btn').addEventListener('click', () => deleteConfig(name));
    });
}

function loadConfigByName(name) {
    const configs = getSavedConfigs();
    if (configs[name]) {
        config = JSON.parse(configs[name]);
        saveToHistory();
        applyConfigToUI();
        createPreview();
        ToastBuilder.success(`Loaded: ${name}`);
    }
}

function deleteConfig(name) {
    const configs = getSavedConfigs();
    delete configs[name];
    saveConfigs(configs);
    renderSavedConfigs();
    ToastBuilder.info(`Deleted: ${name}`);
}

// Save Configuration Function (called from FormBuilder storage buttons)
function saveConfiguration() {
    const name = config.configName?.trim() || `Config ${Date.now()}`;

    const configs = getSavedConfigs();
    configs[name] = JSON.stringify(config);
    saveConfigs(configs);
    renderSavedConfigs();
    ToastBuilder.success(`Saved: ${name}`);
}

// Show Load Modal Function
function showLoadModal() {
    const configs = getSavedConfigs();
    const configNames = Object.keys(configs);

    if (configNames.length === 0) {
        ToastBuilder.info('No saved configurations found');
        return;
    }

    // Show modal with config list
    const modal = new ModalBuilder({
        title: '📂 Load Configuration',
        size: 'small',
        content: `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${configNames.map(name => `
                    <button class="storage-btn load-modal-btn" data-name="${name}" style="text-align: left;">
                        ${name}
                    </button>
                `).join('')}
            </div>
        `,
        buttons: [{ label: 'Cancel', onClick: (m) => m.close() }]
    });

    modal.open();

    setTimeout(() => {
        document.querySelectorAll('.load-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                loadConfigByName(btn.dataset.name);
                modal.close();
            });
        });
    }, 100);
}

// Initial Render
saveToHistory(); // Save initial state
initElementTabs(); // Initialize element tab listeners
initElementForm('page'); // Initialize FormBuilder-based studio form for Page element
createPreview();
setupPreviewClickHandlers(); // Make preview elements clickable
