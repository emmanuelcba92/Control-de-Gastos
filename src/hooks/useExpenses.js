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
    const [categories, setCategories] = useState(['Suscripción', 'Compra', 'Servicios']);
    const [paymentMethods, setPaymentMethods] = useState([
        { name: 'Tarjeta de crédito', allowsInstallments: true },
        { name: 'Tarjeta de débito', allowsInstallments: false },
        { name: 'Mercado Crédito', allowsInstallments: true },
        { name: 'Transferencia bancaria', allowsInstallments: false },
        { name: 'Efectivo', allowsInstallments: false },
        { name: 'Otro', allowsInstallments: false }
    ]);

    // --- DATA LOADING ---
    useEffect(() => {
        setLoading(true);
        let unsubscribeExpenses = () => { };
        let unsubscribeSettings = () => { };
        let unsubscribeCards = () => { };
        let unsubscribeCategories = () => { };
        let unsubscribePaymentMethods = () => { };

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

            unsubscribeCategories = dbService.subscribeToCategories(user.uid, (data) => {
                if (data && data.length > 0) setCategories(data);
            });

            unsubscribePaymentMethods = dbService.subscribeToPaymentMethods(user.uid, (data) => {
                if (data && data.length > 0) {
                    const normalized = data.map(m => typeof m === 'string' ? { name: m, allowsInstallments: false } : m);
                    setPaymentMethods(normalized);
                }
            });

        } else {
            // OFFLINE MODE: Load from LocalStorage
            try {
                const savedExpenses = storage.getExpenses();
                const savedSettings = storage.getSettings();
                const savedCards = storage.getCreditCards();
                const savedCategories = storage.getCategories();
                const savedPaymentMethods = storage.getPaymentMethods();

                setExpenses(savedExpenses);
                setSettings(savedSettings);
                setCreditCards(savedCards);
                if (savedCategories.length > 0) setCategories(savedCategories);
                if (savedPaymentMethods.length > 0) {
                    const normalized = savedPaymentMethods.map(m => typeof m === 'string' ? { name: m, allowsInstallments: false } : m);
                    setPaymentMethods(normalized);
                }
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
            unsubscribeCategories();
            unsubscribePaymentMethods();
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

    useEffect(() => {
        if (!user && !loading) {
            storage.saveCategories(categories);
        }
    }, [categories, loading, user]);

    useEffect(() => {
        if (!user && !loading) {
            storage.savePaymentMethods(paymentMethods);
        }
    }, [paymentMethods, loading, user]);

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

    // Add category
    const addCategory = useCallback((name) => {
        const updated = [...new Set([...categories, name])];
        setCategories(updated);
        if (user) {
            dbService.saveCategories(user.uid, updated);
        }
    }, [categories, user]);

    // Add payment method
    const addPaymentMethod = useCallback((methodData) => {
        // methodData: { name, allowsInstallments }
        const normalizedMethod = typeof methodData === 'string' ? { name: methodData, allowsInstallments: false } : methodData;

        const exists = paymentMethods.some(m => m.name === normalizedMethod.name);
        if (exists) return;

        const updated = [...paymentMethods, normalizedMethod];
        setPaymentMethods(updated);
        if (user) {
            dbService.savePaymentMethods(user.uid, updated);
        }
    }, [paymentMethods, user]);

    // Update payment method (e.g. toggle installments)
    const updatePaymentMethod = useCallback((name, updates) => {
        const updated = paymentMethods.map(m => m.name === name ? { ...m, ...updates } : m);
        setPaymentMethods(updated);
        if (user) {
            dbService.savePaymentMethods(user.uid, updated);
        }
    }, [paymentMethods, user]);

    // Delete category
    const deleteCategory = useCallback((name) => {
        // Check if there are expenses using this category from current month onwards
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const hasExpenses = expenses.some(exp => {
            if (exp.categoria !== name) return false;

            const expStart = new Date(exp.fecha_inicio);
            const expYear = expStart.getFullYear();
            const expMonth = expStart.getMonth();
            const cuotas = exp.cuotas || 1;

            // Check if it's active now or in the future
            if (exp.is_recurring) {
                return (expYear < currentYear) || (expYear === currentYear && expMonth <= currentMonth) || (expYear >= currentYear);
                // Simplified: if it started, it's active in the future.
            } else {
                const monthsDiff = (currentYear - expYear) * 12 + (currentMonth - expMonth);
                return monthsDiff < cuotas;
            }
        });

        if (hasExpenses) {
            throw new Error(`No se puede eliminar la categoría "${name}" porque tiene gastos asociados activos o futuros.`);
        }

        const updated = categories.filter(c => c !== name);
        setCategories(updated);
        if (user) {
            dbService.saveCategories(user.uid, updated);
        }
    }, [categories, expenses, user]);

    // Delete payment method
    const deletePaymentMethod = useCallback((name) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const hasExpenses = expenses.some(exp => {
            if (exp.metodo_pago !== name) return false;

            const expStart = new Date(exp.fecha_inicio);
            const expYear = expStart.getFullYear();
            const expMonth = expStart.getMonth();
            const cuotas = exp.cuotas || 1;

            const monthsDiff = (currentYear - expYear) * 12 + (currentMonth - expMonth);
            return exp.is_recurring || monthsDiff < cuotas;
        });

        if (hasExpenses) {
            throw new Error(`No se puede eliminar el método "${name}" porque tiene gastos asociados activos o futuros.`);
        }

        const updated = paymentMethods.filter(m => m.name !== name);
        setPaymentMethods(updated);
        if (user) {
            dbService.savePaymentMethods(user.uid, updated);
        }
    }, [paymentMethods, expenses, user]);

    // Add new expense
    const addExpense = useCallback((expenseData) => {
        const newExpense = {
            id: uuidv4(),
            nombre: expenseData.nombre,
            monto: parseFloat(expenseData.monto),
            categoria: expenseData.categoria || 'Otro',
            metodo_pago: expenseData.metodo_pago,
            tarjeta_credito: expenseData.tarjeta_credito || null,
            fecha_inicio: expenseData.fecha_inicio,
            fecha_gasto: expenseData.fecha_gasto || expenseData.fecha_inicio,
            cuotas: parseInt(expenseData.cuotas) || 1,
            cuota_actual: parseInt(expenseData.cuota_actual) || 1,
            is_recurring: !!expenseData.is_recurring,
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
            categoria: expenseData.categoria || 'Otro',
            metodo_pago: expenseData.metodo_pago,
            tarjeta_credito: expenseData.tarjeta_credito || null,
            fecha_inicio: expenseData.fecha_inicio,
            fecha_gasto: expenseData.fecha_gasto || expenseData.fecha_inicio,
            cuotas: parseInt(expenseData.cuotas) || 1,
            cuota_actual: parseInt(expenseData.cuota_actual) || 1,
            is_recurring: !!expenseData.is_recurring,
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
    const getFilteredExpenses = useCallback((filterType, year, month = null, method = 'all', card = 'all', category = 'all') => {
        let filtered = [];

        expenses.forEach(expense => {
            if (category !== 'all' && expense.categoria !== category) return;
            if (method !== 'all' && expense.metodo_pago !== method) return;
            if (card !== 'all' && expense.tarjeta_credito !== card) return;
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
                if (monthsDiff >= 0 && (expense.is_recurring || monthsDiff < cuotas)) {
                    include = true;
                    currentCuota = monthsDiff + 1;
                }
            } else if (filterType === 'year') {
                // Check if active during this year
                const yearStart = new Date(year, 0, 1);
                const yearEnd = new Date(year, 11, 31);
                const expenseStart = new Date(startYear, startMonth, 1);

                // If recurring and started before end of year, it's included
                if (expense.is_recurring) {
                    if (expenseStart <= yearEnd) include = true;
                } else {
                    const endDate = new Date(startYear, startMonth + cuotas - 1, 1);
                    if (expenseStart <= yearEnd && endDate >= yearStart) {
                        include = true;
                    }
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
            const cat = expense.categoria || 'Otro';
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
                if (monthsDiff >= 0 && (expense.is_recurring || monthsDiff < cuotas)) {
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
        categories,
        paymentMethods,
        updateSettings,
        addCreditCard,
        removeCreditCard,
        addCategory,
        addPaymentMethod,
        updatePaymentMethod,
        deleteCategory,
        deletePaymentMethod,
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
