/**
 * SSI Builders - Professional UI Component Library
 * Material Design 3 | Production-Ready
 *
 * @version 1.0.0
 * @author SSI Solutions
 */

export { ListBuilder } from './ListBuilder.js';
export { FormBuilder } from './FormBuilder.js';
export { ModalBuilder } from './ModalBuilder.js';
export { ChartBuilder } from './ChartBuilder.js';
export { TabBuilder } from './TabBuilder.js';
export { MenuBuilder } from './MenuBuilder.js';
export { SidebarBuilder } from './SidebarBuilder.js';
export { getVersion, createVersionBadge } from './version.js';
export { IconManager } from './IconManager.js';
export { GlobalConfig } from './GlobalConfig.js';
export { SiteBuilder } from './SiteBuilder.js';

// Default export for convenience
export default {
    ListBuilder,
    FormBuilder,
    ModalBuilder,
    ChartBuilder,
    TabBuilder,
    MenuBuilder,
    SidebarBuilder
};

// Version info
export const VERSION = '1.2.0';
export const LIBRARY_NAME = 'SSI Builders';
