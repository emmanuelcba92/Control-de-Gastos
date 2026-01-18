// Storage utility for localStorage operations

const STORAGE_KEY = 'coste-vida-digital-expenses';
const THEME_KEY = 'coste-vida-digital-theme';
const SETTINGS_KEY = 'coste-vida-digital-settings';
const CREDIT_CARDS_KEY = 'coste-vida-digital-credit-cards';
const CATEGORIES_KEY = 'coste-vida-digital-categories';
const PAYMENT_METHODS_KEY = 'coste-vida-digital-payment-methods';
const GENERAL_NOTES_KEY = 'coste-vida-digital-general-notes';

export const storage = {
    // Get all expenses from localStorage
    getExpenses: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading expenses from storage:', error);
            return [];
        }
    },

    // Save expenses to localStorage
    saveExpenses: (expenses) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
            return true;
        } catch (error) {
            console.error('Error saving expenses to storage:', error);
            return false;
        }
    },

    // Get theme preference
    getTheme: () => {
        try {
            return localStorage.getItem(THEME_KEY) || 'light';
        } catch (error) {
            return 'light';
        }
    },

    // Save theme preference
    saveTheme: (theme) => {
        try {
            localStorage.setItem(THEME_KEY, theme);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Clear all data
    clearAll: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get settings (salary, currency)
    getSettings: () => {
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            return data ? JSON.parse(data) : { salary: 0, currency: 'ARS' };
        } catch (error) {
            return { salary: 0, currency: 'ARS' };
        }
    },

    // Save settings
    saveSettings: (settings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get credit cards
    getCreditCards: () => {
        try {
            const data = localStorage.getItem(CREDIT_CARDS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    // Save credit cards
    saveCreditCards: (cards) => {
        try {
            localStorage.setItem(CREDIT_CARDS_KEY, JSON.stringify(cards));
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get categories
    getCategories: () => {
        try {
            const data = localStorage.getItem(CATEGORIES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    // Save categories
    saveCategories: (categories) => {
        try {
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get payment methods
    getPaymentMethods: () => {
        try {
            const data = localStorage.getItem(PAYMENT_METHODS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    // Save payment methods
    savePaymentMethods: (methods) => {
        try {
            localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get general notes
    getGeneralNotes: () => {
        try {
            return localStorage.getItem(GENERAL_NOTES_KEY) || '';
        } catch (error) {
            return '';
        }
    },

    // Save general notes
    saveGeneralNotes: (notes) => {
        try {
            localStorage.setItem(GENERAL_NOTES_KEY, notes);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Export all data
    exportData: () => {
        try {
            return {
                expenses: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
                settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"salary":0,"currency":"ARS"}'),
                creditCards: JSON.parse(localStorage.getItem(CREDIT_CARDS_KEY) || '[]'),
                categories: JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]'),
                paymentMethods: JSON.parse(localStorage.getItem(PAYMENT_METHODS_KEY) || '[]'),
                theme: localStorage.getItem(THEME_KEY) || 'light',
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    },

    // Import data
    importData: (data) => {
        try {
            if (!data || !data.expenses) {
                throw new Error('Formato de archivo inválido');
            }

            // Save all keys
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.expenses));
            if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
            if (data.creditCards) localStorage.setItem(CREDIT_CARDS_KEY, JSON.stringify(data.creditCards));
            if (data.categories) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
            if (data.paymentMethods) localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(data.paymentMethods));
            if (data.theme) localStorage.setItem(THEME_KEY, data.theme);

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};
