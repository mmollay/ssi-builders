/**
 * i18n.js - Internationalization System for SSI Builders
 *
 * Provides multi-language support for all UI strings across all builders.
 * Default language: German (de)
 *
 * Usage:
 * import { i18n } from './i18n.js';
 *
 * // Get translated string
 * const label = i18n.t('form.submit');
 *
 * // Change language
 * i18n.setLanguage('en');
 *
 * // Get current language
 * const lang = i18n.getLanguage();
 *
 * @version 1.0.0
 */

/**
 * Translation dictionaries for all supported languages
 */
const translations = {
    // ============================================
    // GERMAN (Default)
    // ============================================
    de: {
        // Form Builder
        form: {
            submit: 'Speichern',
            cancel: 'Abbrechen',
            reset: 'Zurücksetzen',
            previous: '← Zurück',
            next: 'Weiter →',
            search: 'Suchen...',
            required: 'Pflichtfeld',
            optional: 'Optional',
            stepOf: 'Schritt {current} von {total}',
            uploadFile: 'Datei hochladen',
            chooseFile: 'Datei auswählen',
            noFileChosen: 'Keine Datei ausgewählt',
            dragDropHint: 'Dateien hierher ziehen oder klicken',
            maxFiles: 'Maximal {max} Dateien',
            // Number stepper
            decreaseValue: 'Wert verringern',
            increaseValue: 'Wert erhöhen',
            // Password
            togglePassword: 'Passwort anzeigen/verbergen',
            showPassword: 'Passwort anzeigen',
            hidePassword: 'Passwort verbergen',
            // Validation messages
            validation: {
                required: 'Dieses Feld ist erforderlich',
                email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                minLength: 'Mindestens {min} Zeichen erforderlich',
                maxLength: 'Maximal {max} Zeichen erlaubt',
                min: 'Der Wert muss mindestens {min} sein',
                max: 'Der Wert darf maximal {max} sein',
                pattern: 'Ungültiges Format',
                passwordMismatch: 'Passwörter stimmen nicht überein',
                phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
                url: 'Bitte geben Sie eine gültige URL ein'
            }
        },

        // Modal Builder
        modal: {
            close: 'Schließen',
            confirm: 'Bestätigen',
            cancel: 'Abbrechen',
            ok: 'OK',
            yes: 'Ja',
            no: 'Nein',
            // Default titles
            confirmTitle: 'Bestätigung',
            alertTitle: 'Hinweis',
            promptTitle: 'Eingabe',
            errorTitle: 'Fehler',
            successTitle: 'Erfolg',
            warningTitle: 'Warnung',
            // Form modal
            formTitle: 'Formular',
            loading: 'Lädt...',
            loadError: 'Fehler beim Laden der Daten',
            // Delete modal
            delete: 'Löschen',
            deleteTitle: 'Löschen bestätigen',
            deleteConfirm: 'Möchten Sie',
            deleteConfirmEnd: 'wirklich löschen?',
            deleteGeneric: 'Möchten Sie diesen Eintrag wirklich löschen?',
            deleting: 'Löschen...',
            deleteError: 'Fehler beim Löschen'
        },

        // List Builder
        list: {
            search: 'Suchen...',
            columns: 'Spalten',
            delete: 'Löschen',
            deleteSelected: 'Löschen ({count})',
            empty: 'Keine Daten vorhanden',
            loading: 'Lade Daten...',
            noResults: 'Keine Ergebnisse gefunden',
            all: 'Alle',
            selected: '{count} ausgewählt',
            itemsPerPage: 'Einträge pro Seite',
            page: 'Seite {current} von {total}',
            first: 'Erste',
            last: 'Letzte',
            previous: 'Zurück',
            next: 'Weiter',
            refresh: 'Aktualisieren',
            export: 'Exportieren',
            filter: 'Filtern',
            clearFilters: 'Filter zurücksetzen',
            sortAsc: 'Aufsteigend sortieren',
            sortDesc: 'Absteigend sortieren'
        },

        // Dropdown / Select
        dropdown: {
            select: 'Auswählen',
            placeholder: 'Option auswählen',
            search: 'Suchen...',
            searchOptions: 'Optionen durchsuchen',
            noResults: 'Keine Ergebnisse',
            loading: 'Wird geladen...',
            clear: 'Löschen',
            clearSearch: 'Suche löschen',
            remove: 'Entfernen',
            selectAll: 'Alle auswählen',
            deselectAll: 'Alle abwählen'
        },

        // Toast / Notifications
        toast: {
            success: 'Erfolg',
            error: 'Fehler',
            warning: 'Warnung',
            info: 'Info'
        },

        // Date Picker
        datePicker: {
            selectDate: 'Datum auswählen',
            today: 'Heute',
            clear: 'Löschen',
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
        },

        // Time Range Picker
        timeRange: {
            today: 'Heute',
            yesterday: 'Gestern',
            last7Days: 'Letzte 7 Tage',
            last30Days: 'Letzte 30 Tage',
            thisMonth: 'Dieser Monat',
            lastMonth: 'Letzter Monat',
            thisQuarter: 'Dieses Quartal',
            thisYear: 'Dieses Jahr',
            custom: 'Benutzerdefiniert',
            from: 'Von',
            to: 'Bis',
            apply: 'Anwenden',
            previousPeriod: 'Vorperiode',
            vsPreviousPeriod: 'vs. Vorperiode'
        },

        // Filter Bar
        filterBar: {
            filters: 'Filter',
            activeFilters: '{count} aktive Filter',
            clearAll: 'Alle löschen',
            apply: 'Anwenden',
            reset: 'Zurücksetzen'
        },

        // Code Snippet
        codeSnippet: {
            copy: 'Kopieren',
            copied: 'Kopiert!',
            expand: 'Erweitern',
            collapse: 'Einklappen'
        },

        // Sidebar
        sidebar: {
            search: 'Suchen...',
            expand: 'Sidebar erweitern',
            collapse: 'Sidebar einklappen'
        },

        // Chart
        chart: {
            noData: 'Keine Daten verfügbar',
            loading: 'Lade Diagramm...',
            total: 'Gesamt'
        },

        // Tabs
        tabs: {
            moreOptions: 'Mehr Optionen'
        },

        // Message
        message: {
            dismiss: 'Schließen'
        },

        // Card
        card: {
            action: 'Aktion',
            toggleCollapse: 'Auf-/Zuklappen'
        },

        // Common actions
        actions: {
            save: 'Speichern',
            edit: 'Bearbeiten',
            delete: 'Löschen',
            cancel: 'Abbrechen',
            close: 'Schließen',
            back: 'Zurück',
            next: 'Weiter',
            finish: 'Fertig',
            add: 'Hinzufügen',
            remove: 'Entfernen',
            create: 'Erstellen',
            update: 'Aktualisieren',
            view: 'Ansehen',
            download: 'Herunterladen',
            upload: 'Hochladen',
            print: 'Drucken',
            share: 'Teilen',
            copy: 'Kopieren',
            paste: 'Einfügen',
            undo: 'Rückgängig',
            redo: 'Wiederholen',
            settings: 'Einstellungen',
            help: 'Hilfe',
            logout: 'Abmelden',
            login: 'Anmelden',
            register: 'Registrieren'
        },

        // Common status
        status: {
            loading: 'Wird geladen...',
            saving: 'Wird gespeichert...',
            saved: 'Gespeichert',
            error: 'Fehler',
            success: 'Erfolgreich',
            pending: 'Ausstehend',
            active: 'Aktiv',
            inactive: 'Inaktiv',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert'
        }
    },

    // ============================================
    // ENGLISH
    // ============================================
    en: {
        // Form Builder
        form: {
            submit: 'Save',
            cancel: 'Cancel',
            reset: 'Reset',
            previous: '← Back',
            next: 'Next →',
            search: 'Search...',
            required: 'Required',
            optional: 'Optional',
            stepOf: 'Step {current} of {total}',
            uploadFile: 'Upload file',
            chooseFile: 'Choose file',
            noFileChosen: 'No file chosen',
            dragDropHint: 'Drag files here or click',
            maxFiles: 'Maximum {max} files',
            // Number stepper
            decreaseValue: 'Decrease value',
            increaseValue: 'Increase value',
            // Password
            togglePassword: 'Toggle password visibility',
            showPassword: 'Show password',
            hidePassword: 'Hide password',
            validation: {
                required: 'This field is required',
                email: 'Please enter a valid email address',
                minLength: 'Minimum {min} characters required',
                maxLength: 'Maximum {max} characters allowed',
                min: 'Value must be at least {min}',
                max: 'Value must not exceed {max}',
                pattern: 'Invalid format',
                passwordMismatch: 'Passwords do not match',
                phone: 'Please enter a valid phone number',
                url: 'Please enter a valid URL'
            }
        },

        // Modal Builder
        modal: {
            close: 'Close',
            confirm: 'Confirm',
            cancel: 'Cancel',
            ok: 'OK',
            yes: 'Yes',
            no: 'No',
            confirmTitle: 'Confirmation',
            alertTitle: 'Notice',
            promptTitle: 'Input',
            errorTitle: 'Error',
            successTitle: 'Success',
            warningTitle: 'Warning',
            // Form modal
            formTitle: 'Form',
            loading: 'Loading...',
            loadError: 'Error loading data',
            // Delete modal
            delete: 'Delete',
            deleteTitle: 'Confirm Delete',
            deleteConfirm: 'Do you want to delete',
            deleteConfirmEnd: '?',
            deleteGeneric: 'Do you really want to delete this entry?',
            deleting: 'Deleting...',
            deleteError: 'Error while deleting'
        },

        // List Builder
        list: {
            search: 'Search...',
            columns: 'Columns',
            delete: 'Delete',
            deleteSelected: 'Delete ({count})',
            empty: 'No data available',
            loading: 'Loading data...',
            noResults: 'No results found',
            all: 'All',
            selected: '{count} selected',
            itemsPerPage: 'Items per page',
            page: 'Page {current} of {total}',
            first: 'First',
            last: 'Last',
            previous: 'Previous',
            next: 'Next',
            refresh: 'Refresh',
            export: 'Export',
            filter: 'Filter',
            clearFilters: 'Clear filters',
            sortAsc: 'Sort ascending',
            sortDesc: 'Sort descending'
        },

        // Dropdown / Select
        dropdown: {
            select: 'Select',
            placeholder: 'Choose an option',
            search: 'Search...',
            searchOptions: 'Search options',
            noResults: 'No results found',
            loading: 'Loading...',
            clear: 'Clear',
            clearSearch: 'Clear search',
            remove: 'Remove',
            selectAll: 'Select all',
            deselectAll: 'Deselect all'
        },

        // Toast / Notifications
        toast: {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        },

        // Date Picker
        datePicker: {
            selectDate: 'Select date',
            today: 'Today',
            clear: 'Clear',
            months: ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        },

        // Time Range Picker
        timeRange: {
            today: 'Today',
            yesterday: 'Yesterday',
            last7Days: 'Last 7 days',
            last30Days: 'Last 30 days',
            thisMonth: 'This month',
            lastMonth: 'Last month',
            thisQuarter: 'This quarter',
            thisYear: 'This year',
            custom: 'Custom',
            from: 'From',
            to: 'To',
            apply: 'Apply',
            previousPeriod: 'Previous period',
            vsPreviousPeriod: 'vs. Previous period'
        },

        // Filter Bar
        filterBar: {
            filters: 'Filters',
            activeFilters: '{count} active filters',
            clearAll: 'Clear all',
            apply: 'Apply',
            reset: 'Reset'
        },

        // Code Snippet
        codeSnippet: {
            copy: 'Copy',
            copied: 'Copied!',
            expand: 'Expand',
            collapse: 'Collapse'
        },

        // Sidebar
        sidebar: {
            search: 'Search...',
            expand: 'Expand sidebar',
            collapse: 'Collapse sidebar'
        },

        // Chart
        chart: {
            noData: 'No data available',
            loading: 'Loading chart...',
            total: 'Total'
        },

        // Tabs
        tabs: {
            moreOptions: 'More options'
        },

        // Message
        message: {
            dismiss: 'Dismiss'
        },

        // Card
        card: {
            action: 'Action',
            toggleCollapse: 'Toggle collapse'
        },

        // Common actions
        actions: {
            save: 'Save',
            edit: 'Edit',
            delete: 'Delete',
            cancel: 'Cancel',
            close: 'Close',
            back: 'Back',
            next: 'Next',
            finish: 'Finish',
            add: 'Add',
            remove: 'Remove',
            create: 'Create',
            update: 'Update',
            view: 'View',
            download: 'Download',
            upload: 'Upload',
            print: 'Print',
            share: 'Share',
            copy: 'Copy',
            paste: 'Paste',
            undo: 'Undo',
            redo: 'Redo',
            settings: 'Settings',
            help: 'Help',
            logout: 'Log out',
            login: 'Log in',
            register: 'Register'
        },

        // Common status
        status: {
            loading: 'Loading...',
            saving: 'Saving...',
            saved: 'Saved',
            error: 'Error',
            success: 'Success',
            pending: 'Pending',
            active: 'Active',
            inactive: 'Inactive',
            enabled: 'Enabled',
            disabled: 'Disabled'
        }
    },

    // ============================================
    // FRENCH
    // ============================================
    fr: {
        // Form Builder
        form: {
            submit: 'Enregistrer',
            cancel: 'Annuler',
            reset: 'Réinitialiser',
            previous: '← Précédent',
            next: 'Suivant →',
            search: 'Rechercher...',
            required: 'Obligatoire',
            optional: 'Facultatif',
            stepOf: 'Étape {current} sur {total}',
            uploadFile: 'Téléverser un fichier',
            chooseFile: 'Choisir un fichier',
            noFileChosen: 'Aucun fichier sélectionné',
            dragDropHint: 'Glissez les fichiers ici ou cliquez',
            maxFiles: 'Maximum {max} fichiers',
            // Number stepper
            decreaseValue: 'Diminuer la valeur',
            increaseValue: 'Augmenter la valeur',
            // Password
            togglePassword: 'Afficher/masquer le mot de passe',
            showPassword: 'Afficher le mot de passe',
            hidePassword: 'Masquer le mot de passe',
            validation: {
                required: 'Ce champ est obligatoire',
                email: 'Veuillez entrer une adresse e-mail valide',
                minLength: 'Minimum {min} caractères requis',
                maxLength: 'Maximum {max} caractères autorisés',
                min: 'La valeur doit être au moins {min}',
                max: 'La valeur ne doit pas dépasser {max}',
                pattern: 'Format invalide',
                passwordMismatch: 'Les mots de passe ne correspondent pas',
                phone: 'Veuillez entrer un numéro de téléphone valide',
                url: 'Veuillez entrer une URL valide'
            }
        },

        // Modal Builder
        modal: {
            close: 'Fermer',
            confirm: 'Confirmer',
            cancel: 'Annuler',
            ok: 'OK',
            yes: 'Oui',
            no: 'Non',
            confirmTitle: 'Confirmation',
            alertTitle: 'Avis',
            promptTitle: 'Saisie',
            errorTitle: 'Erreur',
            successTitle: 'Succès',
            warningTitle: 'Avertissement',
            // Form modal
            formTitle: 'Formulaire',
            loading: 'Chargement...',
            loadError: 'Erreur lors du chargement des données',
            // Delete modal
            delete: 'Supprimer',
            deleteTitle: 'Confirmer la suppression',
            deleteConfirm: 'Voulez-vous supprimer',
            deleteConfirmEnd: '?',
            deleteGeneric: 'Voulez-vous vraiment supprimer cette entrée?',
            deleting: 'Suppression...',
            deleteError: 'Erreur lors de la suppression'
        },

        // List Builder
        list: {
            search: 'Rechercher...',
            columns: 'Colonnes',
            delete: 'Supprimer',
            deleteSelected: 'Supprimer ({count})',
            empty: 'Aucune donnée disponible',
            loading: 'Chargement des données...',
            noResults: 'Aucun résultat trouvé',
            all: 'Tous',
            selected: '{count} sélectionné(s)',
            itemsPerPage: 'Éléments par page',
            page: 'Page {current} sur {total}',
            first: 'Premier',
            last: 'Dernier',
            previous: 'Précédent',
            next: 'Suivant',
            refresh: 'Actualiser',
            export: 'Exporter',
            filter: 'Filtrer',
            clearFilters: 'Effacer les filtres',
            sortAsc: 'Tri croissant',
            sortDesc: 'Tri décroissant'
        },

        // Dropdown / Select
        dropdown: {
            select: 'Sélectionner',
            placeholder: 'Choisir une option',
            search: 'Rechercher...',
            searchOptions: 'Rechercher des options',
            noResults: 'Aucun résultat',
            loading: 'Chargement...',
            clear: 'Effacer',
            clearSearch: 'Effacer la recherche',
            remove: 'Supprimer',
            selectAll: 'Tout sélectionner',
            deselectAll: 'Tout désélectionner'
        },

        // Toast / Notifications
        toast: {
            success: 'Succès',
            error: 'Erreur',
            warning: 'Avertissement',
            info: 'Info'
        },

        // Date Picker
        datePicker: {
            selectDate: 'Sélectionner une date',
            today: "Aujourd'hui",
            clear: 'Effacer',
            months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                     'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            monthsShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                          'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
            weekdaysMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
        },

        // Time Range Picker
        timeRange: {
            today: "Aujourd'hui",
            yesterday: 'Hier',
            last7Days: '7 derniers jours',
            last30Days: '30 derniers jours',
            thisMonth: 'Ce mois',
            lastMonth: 'Mois dernier',
            thisQuarter: 'Ce trimestre',
            thisYear: 'Cette année',
            custom: 'Personnalisé',
            from: 'De',
            to: 'À',
            apply: 'Appliquer',
            previousPeriod: 'Période précédente',
            vsPreviousPeriod: 'vs. Période précédente'
        },

        // Filter Bar
        filterBar: {
            filters: 'Filtres',
            activeFilters: '{count} filtres actifs',
            clearAll: 'Tout effacer',
            apply: 'Appliquer',
            reset: 'Réinitialiser'
        },

        // Code Snippet
        codeSnippet: {
            copy: 'Copier',
            copied: 'Copié !',
            expand: 'Développer',
            collapse: 'Réduire'
        },

        // Sidebar
        sidebar: {
            search: 'Rechercher...',
            expand: 'Développer la barre latérale',
            collapse: 'Réduire la barre latérale'
        },

        // Chart
        chart: {
            noData: 'Aucune donnée disponible',
            loading: 'Chargement du graphique...',
            total: 'Total'
        },

        // Tabs
        tabs: {
            moreOptions: 'Plus d\'options'
        },

        // Message
        message: {
            dismiss: 'Fermer'
        },

        // Card
        card: {
            action: 'Action',
            toggleCollapse: 'Ouvrir/Fermer'
        },

        // Common actions
        actions: {
            save: 'Enregistrer',
            edit: 'Modifier',
            delete: 'Supprimer',
            cancel: 'Annuler',
            close: 'Fermer',
            back: 'Retour',
            next: 'Suivant',
            finish: 'Terminer',
            add: 'Ajouter',
            remove: 'Supprimer',
            create: 'Créer',
            update: 'Mettre à jour',
            view: 'Voir',
            download: 'Télécharger',
            upload: 'Téléverser',
            print: 'Imprimer',
            share: 'Partager',
            copy: 'Copier',
            paste: 'Coller',
            undo: 'Annuler',
            redo: 'Rétablir',
            settings: 'Paramètres',
            help: 'Aide',
            logout: 'Déconnexion',
            login: 'Connexion',
            register: "S'inscrire"
        },

        // Common status
        status: {
            loading: 'Chargement...',
            saving: 'Enregistrement...',
            saved: 'Enregistré',
            error: 'Erreur',
            success: 'Succès',
            pending: 'En attente',
            active: 'Actif',
            inactive: 'Inactif',
            enabled: 'Activé',
            disabled: 'Désactivé'
        }
    }
};

/**
 * i18n Singleton Class
 * Handles all internationalization functionality
 */
class I18n {
    constructor() {
        // Default language is German
        this.fallbackLanguage = 'en';
        this.translations = translations;
        this.listeners = [];

        // Try to restore language from localStorage
        if (typeof localStorage !== 'undefined') {
            const savedLang = localStorage.getItem('ssi-language');
            if (savedLang && this.translations[savedLang]) {
                this.currentLanguage = savedLang;
            } else {
                this.currentLanguage = 'de';
            }
        } else {
            this.currentLanguage = 'de';
        }
    }

    /**
     * Get available languages
     * @returns {Array} List of language codes
     */
    getLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Get language display names
     * @returns {Object} Language codes mapped to display names
     */
    getLanguageNames() {
        return {
            de: 'Deutsch',
            en: 'English',
            fr: 'Français'
        };
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Set current language
     * @param {string} lang - Language code ('de', 'en', 'fr')
     */
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`[i18n] Language "${lang}" not supported. Available: ${this.getLanguages().join(', ')}`);
            return false;
        }

        const previousLang = this.currentLanguage;
        this.currentLanguage = lang;

        // Notify listeners
        this.listeners.forEach(callback => {
            try {
                callback(lang, previousLang);
            } catch (e) {
                console.error('[i18n] Listener error:', e);
            }
        });

        // Dispatch custom event for components that listen to DOM events
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('ssi-language-change', {
                detail: { language: lang, previousLanguage: previousLang }
            }));
        }

        return true;
    }

    /**
     * Translate a key with optional interpolation
     * @param {string} key - Dot-notation key (e.g., 'form.submit')
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated string
     */
    t(key, params = {}) {
        let value = this._getNestedValue(this.translations[this.currentLanguage], key);

        // Fallback to fallback language
        if (value === undefined && this.currentLanguage !== this.fallbackLanguage) {
            value = this._getNestedValue(this.translations[this.fallbackLanguage], key);
        }

        // Return key if not found
        if (value === undefined) {
            console.warn(`[i18n] Missing translation for key: "${key}"`);
            return key;
        }

        // Interpolate parameters {param}
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
            });
        }

        return value;
    }

    /**
     * Check if a translation key exists
     * @param {string} key - Dot-notation key
     * @returns {boolean}
     */
    has(key) {
        return this._getNestedValue(this.translations[this.currentLanguage], key) !== undefined;
    }

    /**
     * Add a language change listener
     * @param {Function} callback - Function(newLang, oldLang)
     * @returns {Function} Unsubscribe function
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Add custom translations for a language
     * @param {string} lang - Language code
     * @param {Object} customTranslations - Translation object to merge
     */
    extend(lang, customTranslations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang] = this._deepMerge(this.translations[lang], customTranslations);
    }

    /**
     * Get nested value by dot-notation path
     * @private
     */
    _getNestedValue(obj, path) {
        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Deep merge two objects
     * @private
     */
    _deepMerge(target, source) {
        const output = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                output[key] = this._deepMerge(output[key] || {}, source[key]);
            } else {
                output[key] = source[key];
            }
        }

        return output;
    }
}

// Export singleton instance
export const i18n = new I18n();

// Also export class for testing
export { I18n };
