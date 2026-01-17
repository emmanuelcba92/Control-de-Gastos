import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';

export function useExpenses() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [settings, setSettings] = useState({ salary: 0, currency: 'ARS' });
    const [creditCards, setCreditCards] = useState([]);

    // --- DATA LOADING ---
    useEffect(() => {
        setLoading(true);
        let unsubscribeExpenses = () => { };
        let unsubscribeSettings = () => { };
        let unsubscribeCards = () => { };

        if (user) {
            // ONLINE MODE: Subscribe to Firestore
            unsubscribeExpenses = dbService.subscribeToExpenses(user.uid, (data) => {
                setExpenses(data);

                // MIGRATION LOIGC (Simple auto-upload if cloud is empty)
                if (data.length === 0) {
                    const localExpenses = storage.getExpenses();
                    if (localExpenses.length > 0) {
                        console.log("Migrating local data to cloud...");
                        const localSettings = storage.getSettings();
                        const localCards = storage.getCreditCards();
                        dbService.uploadLocalData(user.uid, {
                            expenses: localExpenses,
                            settings: localSettings,
                            creditCards: localCards
                        });
                        // We don't clear local storage immediately effectively serving as backup
                    }
                }
                setLoading(false);
            });

            unsubscribeSettings = dbService.subscribeToSettings(user.uid, (data) => {
                if (data) setSettings(data);
            });

            unsubscribeCards = dbService.subscribeToCreditCards(user.uid, (data) => {
                if (data) setCreditCards(data);
            });

        } else {
            // OFFLINE MODE: Load from LocalStorage
            try {
                const savedExpenses = storage.getExpenses();
                const savedSettings = storage.getSettings();
                const savedCards = storage.getCreditCards();
                setExpenses(savedExpenses);
                setSettings(savedSettings);
                setCreditCards(savedCards);
            } catch (err) {
                setError('Error al cargar los gastos');
            } finally {
                setLoading(false);
            }
        }

        return () => {
            unsubscribeExpenses();
            unsubscribeSettings();
            unsubscribeCards();
        };
    }, [user]);

    // --- DATA SAVING (Offline only) ---
    // If online, saving is handled by the action functions (addExpense, etc.) calling DB directly.
    // We only need effects to sync state -> localstorage when offline.

    useEffect(() => {
        if (!user && !loading) {
            storage.saveExpenses(expenses);
        }
    }, [expenses, loading, user]);

    useEffect(() => {
        if (!user && !loading) {
            storage.saveSettings(settings);
        }
    }, [settings, loading, user]);

    useEffect(() => {
        if (!user && !loading) {
            storage.saveCreditCards(creditCards);
        }
    }, [creditCards, loading, user]);

    // --- ACTIONS ---

    // Update settings
    const updateSettings = useCallback((newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated); // Optimistic UI
        if (user) {
            dbService.saveSettings(user.uid, updated);
        }
    }, [settings, user]);

    // Add credit card
    const addCreditCard = useCallback((cardName) => {
        const updated = [...new Set([...creditCards, cardName])];
        setCreditCards(updated);
        if (user) {
            dbService.saveCreditCards(user.uid, updated);
        }
    }, [creditCards, user]);

    // Remove credit card
    const removeCreditCard = useCallback((cardName) => {
        const updated = creditCards.filter(c => c !== cardName);
        setCreditCards(updated);
        if (user) {
            dbService.saveCreditCards(user.uid, updated);
        }
    }, [creditCards, user]);

    // Add new expense
    const addExpense = useCallback((expenseData) => {
        const newExpense = {
            id: uuidv4(),
            nombre: expenseData.nombre,
            monto: parseFloat(expenseData.monto),
            categoria: expenseData.categoria || 'otro',
            metodo_pago: expenseData.metodo_pago,
            tarjeta_credito: expenseData.tarjeta_credito || null,
            fecha_inicio: expenseData.fecha_inicio,
            fecha_gasto: expenseData.fecha_gasto || expenseData.fecha_inicio,
            cuotas: parseInt(expenseData.cuotas) || 1,
            cuota_actual: parseInt(expenseData.cuota_actual) || 1,
            createdAt: new Date().toISOString()
        };

        if (user) {
            dbService.saveExpense(user.uid, newExpense);
            // No need to setExpenses, subscription will update it
        } else {
            setExpenses(prev => [...prev, newExpense]);
        }
        return newExpense;
    }, [user]);

    // Update expense
    const updateExpense = useCallback((id, expenseData) => {
        const updatedExpense = {
            id,
            nombre: expenseData.nombre,
            monto: parseFloat(expenseData.monto),
            categoria: expenseData.categoria || 'otro',
            metodo_pago: expenseData.metodo_pago,
            tarjeta_credito: expenseData.tarjeta_credito || null,
            fecha_inicio: expenseData.fecha_inicio,
            fecha_gasto: expenseData.fecha_gasto || expenseData.fecha_inicio,
            cuotas: parseInt(expenseData.cuotas) || 1,
            cuota_actual: parseInt(expenseData.cuota_actual) || 1,
            updatedAt: new Date().toISOString()
        };

        if (user) {
            // For updates, we need to merge with existing non-editable fields if any, 
            // but here we basically replace the doc. 
            // We reuse the ID.
            dbService.saveExpense(user.uid, updatedExpense);
        } else {
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpense } : e));
        }
    }, [user]);

    // Delete expense
    const deleteExpense = useCallback((id) => {
        if (user) {
            dbService.deleteExpense(user.uid, id);
        } else {
            setExpenses(prev => prev.filter(expense => expense.id !== id));
        }
    }, [user]);

    // --- CALCULATIONS (Same as before) ---
    // Get filtered expenses by date range
    const getFilteredExpenses = useCallback((filterType, year, month = null, method = 'all', card = 'all') => {
        let filtered = [];

        expenses.forEach(expense => {
            const startDate = new Date(expense.fecha_inicio);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const cuotas = expense.cuotas || 1;

            // Filter by Date (Projection)
            let include = false;
            let currentCuota = 1;

            if (filterType === 'month' && month !== null) {
                // Calculate if active in this month
                const monthsDiff = (year - startYear) * 12 + (month - startMonth);
                if (monthsDiff >= 0 && monthsDiff < cuotas) {
                    include = true;
                    currentCuota = monthsDiff + 1;
                }
            } else if (filterType === 'year') {
                // Check if active during this year
                const yearStart = new Date(year, 0, 1);
                const yearEnd = new Date(year, 11, 31);
                const endDate = new Date(startYear, startMonth + cuotas - 1, 1);
                const expenseStart = new Date(startYear, startMonth, 1);

                if (expenseStart <= yearEnd && endDate >= yearStart) {
                    include = true;
                }
            } else {
                include = true;
            }

            if (include) {
                if (method !== 'all' && expense.metodo_pago !== method) return;
                if (card !== 'all' && expense.tarjeta_credito !== card) return;

                if (filterType === 'month') {
                    filtered.push({ ...expense, cuota_actual: currentCuota });
                } else {
                    filtered.push(expense);
                }
            }
        });

        return filtered;
    }, [expenses]);

    const calculateTotal = useCallback((expenseList = expenses) => {
        return expenseList.reduce((sum, expense) => sum + expense.monto, 0);
    }, []);

    const getExpensesByPaymentMethod = useCallback((expenseList = expenses) => {
        const grouped = {};
        expenseList.forEach(expense => {
            const method = expense.metodo_pago || 'Sin método';
            if (!grouped[method]) {
                grouped[method] = 0;
            }
            grouped[method] += expense.monto;
        });
        return grouped;
    }, []);

    const getExpensesByCategory = useCallback((expenseList = expenses) => {
        const grouped = {};
        expenseList.forEach(expense => {
            const cat = expense.categoria || 'otro';
            if (!grouped[cat]) {
                grouped[cat] = 0;
            }
            grouped[cat] += expense.monto;
        });
        return grouped;
    }, []);

    const getExpensesByCreditCard = useCallback((expenseList = expenses) => {
        const grouped = {};
        expenseList.forEach(expense => {
            if (expense.tarjeta_credito) {
                if (!grouped[expense.tarjeta_credito]) {
                    grouped[expense.tarjeta_credito] = 0;
                }
                grouped[expense.tarjeta_credito] += expense.monto;
            }
        });
        return grouped;
    }, []);

    const getMonthlyTotals = useCallback((year) => {
        const monthlyTotals = Array(12).fill(0);
        expenses.forEach(expense => {
            const startDate = new Date(expense.fecha_inicio);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const cuotas = expense.cuotas || 1;
            const amount = expense.monto;

            for (let month = 0; month < 12; month++) {
                const monthsDiff = (year - startYear) * 12 + (month - startMonth);
                if (monthsDiff >= 0 && monthsDiff < cuotas) {
                    monthlyTotals[month] += amount;
                }
            }
        });
        return monthlyTotals;
    }, [expenses]);

    const getSalaryPercentage = useCallback((total) => {
        if (!settings.salary || settings.salary <= 0) return 0;
        return (total / settings.salary) * 100;
    }, [settings.salary]);

    const getStatusColor = useCallback((percentage) => {
        if (percentage <= 25) return 'green';
        if (percentage <= 50) return 'yellow';
        return 'red';
    }, []);

    return {
        expenses,
        loading,
        error,
        settings,
        creditCards,
        updateSettings,
        addCreditCard,
        removeCreditCard,
        addExpense,
        updateExpense,
        deleteExpense,
        getFilteredExpenses,
        calculateTotal,
        getExpensesByPaymentMethod,
        getExpensesByCategory,
        getExpensesByCreditCard,
        getMonthlyTotals,
        getSalaryPercentage,
        getStatusColor
    };
}
