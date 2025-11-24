/**
 * SSI Builders - Professional UI Component Library
 * Material Design 3 | Production-Ready
 *
 * @version 2.1.0
 * @author SSI Solutions
 */

// Import all builders first (so they're available in local scope)
import { ListBuilder } from './ListBuilder.js';
import { FormBuilder } from './FormBuilder.js';
import { ModalBuilder } from './ModalBuilder.js';
import { ChartBuilder } from './ChartBuilder.js';
import { TabBuilder } from './TabBuilder.js';
import { MenuBuilder } from './MenuBuilder.js';
import { SidebarBuilder } from './SidebarBuilder.js';
import { getVersion, createVersionBadge } from './version.js';
import { IconManager } from './IconManager.js';
import { GlobalConfig } from './GlobalConfig.js';
import { SiteBuilder } from './SiteBuilder.js';

// Named exports
export { ListBuilder };
export { FormBuilder };
export { ModalBuilder };
export { ChartBuilder };
export { TabBuilder };
export { MenuBuilder };
export { SidebarBuilder };
export { getVersion, createVersionBadge };
export { IconManager };
export { GlobalConfig };
export { SiteBuilder };

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
export const VERSION = '2.1.0';
export const LIBRARY_NAME = 'SSI Builders';
