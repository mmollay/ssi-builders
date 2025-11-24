/**
 * SSI Builders - Professional UI Component Library
 * Material Design 3 | Production-Ready
 *
 * @version 2.2.0
 * @author SSI Solutions
 */

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
import { ToastBuilder } from './ToastBuilder.js';
import { TooltipBuilder } from './TooltipBuilder.js';
import { CodeSnippetBuilder } from './CodeSnippetBuilder.js';

export {
    ListBuilder,
    FormBuilder,
    ModalBuilder,
    ChartBuilder,
    TabBuilder,
    MenuBuilder,
    SidebarBuilder,
    getVersion,
    createVersionBadge,
    IconManager,
    GlobalConfig,
    SiteBuilder,
    ToastBuilder,
    TooltipBuilder,
    CodeSnippetBuilder
};

// Default export for convenience
export default {
    ListBuilder,
    FormBuilder,
    ModalBuilder,
    ChartBuilder,
    TabBuilder,
    MenuBuilder,
    SidebarBuilder,
    ToastBuilder,
    TooltipBuilder,
    CodeSnippetBuilder,
    getVersion,
    createVersionBadge,
    IconManager,
    GlobalConfig,
    SiteBuilder
};

// Version info
export const VERSION = '2.2.0';
export const LIBRARY_NAME = 'SSI Builders';
