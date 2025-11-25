/**
 * SSI Builders - Professional UI Component Library
 * Material Design 3 | Production-Ready
 *
 * @version 2.3.0
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
// Analytics Components (v2.3.0)
import { AnalyticsCard, AnalyticsCardGrid } from './AnalyticsCard.js';
import { FilterBar } from './FilterBar.js';
import { TimeRangePicker } from './TimeRangePicker.js';

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
    CodeSnippetBuilder,
    // Analytics Components (v2.3.0)
    AnalyticsCard,
    AnalyticsCardGrid,
    FilterBar,
    TimeRangePicker
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
    AnalyticsCard,
    AnalyticsCardGrid,
    FilterBar,
    TimeRangePicker,
    getVersion,
    createVersionBadge,
    IconManager,
    GlobalConfig,
    SiteBuilder
};

// Version info
export const VERSION = '2.3.0';
export const LIBRARY_NAME = 'SSI Builders';
