/**
 * SSI Builders - Professional UI Component Library
 * Material Design 3 | Production-Ready
 *
 * @version 2.4.4
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
// M3 Components (v2.4.0)
import { M3DropdownMenu } from './M3DropdownMenu.js';
import { M3Slider } from './M3Slider.js';
import { M3ColorPicker } from './M3ColorPicker.js';
import { ChangelogBuilder } from './ChangelogBuilder.js';
// What's New System (v2.4.4)
import WhatsNew, { isNew, getNewBadge, currentVersion as whatsNewVersion } from './whats-new.js';

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
    TimeRangePicker,
    // M3 Components (v2.4.0)
    M3DropdownMenu,
    M3Slider,
    M3ColorPicker,
    ChangelogBuilder,
    // What's New System (v2.4.4)
    WhatsNew,
    isNew,
    getNewBadge,
    whatsNewVersion
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
    M3DropdownMenu,
    M3Slider,
    M3ColorPicker,
    ChangelogBuilder,
    getVersion,
    createVersionBadge,
    IconManager,
    GlobalConfig,
    SiteBuilder
};

// Version info
export const VERSION = '2.4.4';
export const LIBRARY_NAME = 'SSI Builders';
