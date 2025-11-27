/**
 * M3DatePicker - Material Design 3 Date Picker
 * SSI Builders v2.5.0
 *
 * Features:
 * - Modal calendar view
 * - Month/Year navigation
 * - Today highlight
 * - Selected date highlight
 * - Keyboard navigation
 * - Min/Max date constraints
 * - Localization support (German default)
 */

import { IconManager } from './IconManager.js';

export class M3DatePicker {
    constructor(config) {
        this.container = typeof config.container === 'string'
            ? document.getElementById(config.container)
            : config.container;

        if (!this.container) {
            console.error('M3DatePicker: Container not found');
            return;
        }

        // Configuration
        this.label = config.label || 'Datum';
        this.value = config.value ? new Date(config.value) : null;
        this.minDate = config.minDate ? new Date(config.minDate) : null;
        this.maxDate = config.maxDate ? new Date(config.maxDate) : null;
        this.required = config.required || false;
        this.disabled = config.disabled || false;
        this.placeholder = config.placeholder || 'TT.MM.JJJJ';
        this.variant = config.variant || 'outlined'; // filled, outlined
        this.locale = config.locale || 'de-DE';
        this.firstDayOfWeek = config.firstDayOfWeek ?? 1; // 0=Sunday, 1=Monday
        this.onChange = config.onChange || (() => {});

        // State
        this.isOpen = false;
        this.viewDate = this.value ? new Date(this.value) : new Date();
        this.viewMode = 'days'; // days, months, years

        // Localization
        this.weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        this.months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        this.monthsShort = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

        this.render();
        this.attachEvents();
    }

    render() {
        const variantClass = this.variant === 'filled' ? 'm3-date-picker--filled' : 'm3-date-picker--outlined';
        const disabledClass = this.disabled ? 'm3-date-picker--disabled' : '';
        const hasValue = this.value !== null;

        this.container.innerHTML = `
            <div class="m3-date-picker ${variantClass} ${disabledClass}">
                <button type="button" class="m3-date-picker__trigger" ${this.disabled ? 'disabled' : ''}>
                    <div class="m3-date-picker__content">
                        <span class="m3-date-picker__label ${hasValue ? 'm3-date-picker__label--float' : ''}">
                            ${this.label}${this.required ? '<span class="m3-date-picker__required">*</span>' : ''}
                        </span>
                        <span class="m3-date-picker__value">${hasValue ? this.formatDate(this.value) : ''}</span>
                    </div>
                    <span class="m3-date-picker__icon">
                        ${this.getCalendarIcon()}
                    </span>
                    ${this.variant === 'filled' ? '<span class="m3-date-picker__active-indicator"></span>' : ''}
                </button>
                <div class="m3-date-picker__calendar"></div>
            </div>
        `;

        this.triggerEl = this.container.querySelector('.m3-date-picker__trigger');
        this.calendarEl = this.container.querySelector('.m3-date-picker__calendar');
        this.labelEl = this.container.querySelector('.m3-date-picker__label');
        this.valueEl = this.container.querySelector('.m3-date-picker__value');
    }

    getCalendarIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>`;
    }

    renderCalendar() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();

        this.calendarEl.innerHTML = `
            <div class="m3-calendar">
                <div class="m3-calendar__header">
                    <button type="button" class="m3-calendar__nav m3-calendar__nav--prev" aria-label="Vorheriger Monat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button type="button" class="m3-calendar__title" aria-label="Monat/Jahr wählen">
                        <span class="m3-calendar__month">${this.months[month]}</span>
                        <span class="m3-calendar__year">${year}</span>
                    </button>
                    <button type="button" class="m3-calendar__nav m3-calendar__nav--next" aria-label="Nächster Monat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
                ${this.viewMode === 'days' ? this.renderDaysView(year, month) : ''}
                ${this.viewMode === 'months' ? this.renderMonthsView(year) : ''}
                ${this.viewMode === 'years' ? this.renderYearsView(year) : ''}
                <div class="m3-calendar__footer">
                    <button type="button" class="m3-calendar__btn m3-calendar__btn--cancel">Abbrechen</button>
                    <button type="button" class="m3-calendar__btn m3-calendar__btn--today">Heute</button>
                    <button type="button" class="m3-calendar__btn m3-calendar__btn--ok m3-calendar__btn--primary">OK</button>
                </div>
            </div>
        `;

        this.attachCalendarEvents();
    }

    renderDaysView(year, month) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = (firstDay.getDay() - this.firstDayOfWeek + 7) % 7;

        // Reorder weekdays based on firstDayOfWeek
        const orderedWeekdays = [...this.weekdays.slice(this.firstDayOfWeek), ...this.weekdays.slice(0, this.firstDayOfWeek)];

        let html = `
            <div class="m3-calendar__weekdays">
                ${orderedWeekdays.map(day => `<span class="m3-calendar__weekday">${day}</span>`).join('')}
            </div>
            <div class="m3-calendar__days">
        `;

        // Previous month days
        const prevMonth = new Date(year, month, 0);
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonth.getDate() - i;
            html += `<button type="button" class="m3-calendar__day m3-calendar__day--other" disabled>${day}</button>`;
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const isToday = date.getTime() === today.getTime();
            const isSelected = this.value && date.getTime() === new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate()).getTime();
            const isDisabled = this.isDateDisabled(date);

            const classes = [
                'm3-calendar__day',
                isToday ? 'm3-calendar__day--today' : '',
                isSelected ? 'm3-calendar__day--selected' : '',
                isDisabled ? 'm3-calendar__day--disabled' : ''
            ].filter(Boolean).join(' ');

            html += `<button type="button" class="${classes}" data-date="${date.toISOString()}" ${isDisabled ? 'disabled' : ''}>${day}</button>`;
        }

        // Next month days
        const remainingDays = 42 - (startDay + lastDay.getDate());
        for (let day = 1; day <= remainingDays; day++) {
            html += `<button type="button" class="m3-calendar__day m3-calendar__day--other" disabled>${day}</button>`;
        }

        html += '</div>';
        return html;
    }

    renderMonthsView(year) {
        let html = '<div class="m3-calendar__months">';

        for (let i = 0; i < 12; i++) {
            const isSelected = this.value && this.value.getMonth() === i && this.value.getFullYear() === year;
            const isCurrent = new Date().getMonth() === i && new Date().getFullYear() === year;

            const classes = [
                'm3-calendar__month-btn',
                isSelected ? 'm3-calendar__month-btn--selected' : '',
                isCurrent ? 'm3-calendar__month-btn--current' : ''
            ].filter(Boolean).join(' ');

            html += `<button type="button" class="${classes}" data-month="${i}">${this.monthsShort[i]}</button>`;
        }

        html += '</div>';
        return html;
    }

    renderYearsView(centerYear) {
        const startYear = centerYear - 6;
        let html = '<div class="m3-calendar__years">';

        for (let i = 0; i < 12; i++) {
            const year = startYear + i;
            const isSelected = this.value && this.value.getFullYear() === year;
            const isCurrent = new Date().getFullYear() === year;

            const classes = [
                'm3-calendar__year-btn',
                isSelected ? 'm3-calendar__year-btn--selected' : '',
                isCurrent ? 'm3-calendar__year-btn--current' : ''
            ].filter(Boolean).join(' ');

            html += `<button type="button" class="${classes}" data-year="${year}">${year}</button>`;
        }

        html += '</div>';
        return html;
    }

    isDateDisabled(date) {
        if (this.minDate && date < this.minDate) return true;
        if (this.maxDate && date > this.maxDate) return true;
        return false;
    }

    formatDate(date) {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    parseDate(str) {
        const parts = str.split('.');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) return null;
        return date;
    }

    open() {
        if (this.disabled) return;
        this.isOpen = true;
        this.viewDate = this.value ? new Date(this.value) : new Date();
        this.viewMode = 'days';
        this.container.querySelector('.m3-date-picker').classList.add('m3-date-picker--open');
        this.renderCalendar();
    }

    close() {
        this.isOpen = false;
        this.container.querySelector('.m3-date-picker').classList.remove('m3-date-picker--open');
    }

    selectDate(date) {
        this.value = date;
        this.valueEl.textContent = this.formatDate(date);
        this.labelEl.classList.add('m3-date-picker__label--float');
        this.onChange(date);
    }

    navigateMonth(delta) {
        this.viewDate.setMonth(this.viewDate.getMonth() + delta);
        this.renderCalendar();
    }

    navigateYear(delta) {
        this.viewDate.setFullYear(this.viewDate.getFullYear() + delta);
        this.renderCalendar();
    }

    setToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!this.isDateDisabled(today)) {
            this.selectDate(today);
            this.viewDate = new Date(today);
            this.renderCalendar();
        }
    }

    attachEvents() {
        // Toggle calendar
        this.triggerEl.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.close();
            }
        });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            switch (e.key) {
                case 'Escape':
                    this.close();
                    this.triggerEl.focus();
                    break;
                case 'ArrowLeft':
                    if (this.viewMode === 'days') this.navigateMonth(-1);
                    break;
                case 'ArrowRight':
                    if (this.viewMode === 'days') this.navigateMonth(1);
                    break;
            }
        });
    }

    attachCalendarEvents() {
        const calendar = this.calendarEl.querySelector('.m3-calendar');
        if (!calendar) return;

        // Navigation buttons
        calendar.querySelector('.m3-calendar__nav--prev')?.addEventListener('click', () => {
            if (this.viewMode === 'days') this.navigateMonth(-1);
            else if (this.viewMode === 'years') this.navigateYear(-12);
        });

        calendar.querySelector('.m3-calendar__nav--next')?.addEventListener('click', () => {
            if (this.viewMode === 'days') this.navigateMonth(1);
            else if (this.viewMode === 'years') this.navigateYear(12);
        });

        // Title click - switch view mode
        calendar.querySelector('.m3-calendar__title')?.addEventListener('click', () => {
            if (this.viewMode === 'days') {
                this.viewMode = 'months';
            } else if (this.viewMode === 'months') {
                this.viewMode = 'years';
            } else {
                this.viewMode = 'days';
            }
            this.renderCalendar();
        });

        // Day selection
        calendar.querySelectorAll('.m3-calendar__day:not(.m3-calendar__day--other):not(.m3-calendar__day--disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const date = new Date(btn.dataset.date);
                this.selectDate(date);
                this.renderCalendar();
            });
        });

        // Month selection
        calendar.querySelectorAll('.m3-calendar__month-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewDate.setMonth(parseInt(btn.dataset.month, 10));
                this.viewMode = 'days';
                this.renderCalendar();
            });
        });

        // Year selection
        calendar.querySelectorAll('.m3-calendar__year-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewDate.setFullYear(parseInt(btn.dataset.year, 10));
                this.viewMode = 'months';
                this.renderCalendar();
            });
        });

        // Footer buttons
        calendar.querySelector('.m3-calendar__btn--cancel')?.addEventListener('click', () => {
            this.close();
        });

        calendar.querySelector('.m3-calendar__btn--today')?.addEventListener('click', () => {
            this.setToday();
        });

        calendar.querySelector('.m3-calendar__btn--ok')?.addEventListener('click', () => {
            this.close();
        });
    }

    getValue() {
        return this.value;
    }

    setValue(date) {
        this.value = date ? new Date(date) : null;
        if (this.value) {
            this.valueEl.textContent = this.formatDate(this.value);
            this.labelEl.classList.add('m3-date-picker__label--float');
        } else {
            this.valueEl.textContent = '';
            this.labelEl.classList.remove('m3-date-picker__label--float');
        }
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
