/**
 * SSI Builders - Professional UI Component Library
 * Material Design 3 | Production-Ready
 *
 * @version 2.6.0
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
// i18n System (v2.5.0)
import { i18n } from './i18n.js';
// Theme System (v2.6.0)
import { ThemeBuilder } from './ThemeBuilder.js';
// Message System (v2.6.0)
import { MessageBuilder } from './MessageBuilder.js';
// Card/Segment System (v2.6.0)
import { CardBuilder } from './CardBuilder.js';
// Header System (v2.7.0)
import { HeaderBuilder } from './HeaderBuilder.js';

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
    whatsNewVersion,
    // i18n System (v2.5.0)
    i18n,
    // Theme System (v2.6.0)
    ThemeBuilder,
    // Message System (v2.6.0)
    MessageBuilder,
    // Card/Segment System (v2.6.0)
    CardBuilder,
    // Header System (v2.7.0)
    HeaderBuilder
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
    SiteBuilder,
    i18n,
    ThemeBuilder,
    MessageBuilder,
    CardBuilder,
    HeaderBuilder
};

// Version info
export const VERSION = '2.6.0';
export const LIBRARY_NAME = 'SSI Builders';
