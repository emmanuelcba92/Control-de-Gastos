
import { db } from '../firebase/config';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    writeBatch
} from 'firebase/firestore';

export const dbService = {
    // --- EXPENSES ---
    // Escuchar gastos en tiempo real
    subscribeToExpenses: (uid, callback) => {
        const q = query(collection(db, 'users', uid, 'expenses'), orderBy('fecha_gasto', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(expenses);
        });
    },

    // Guardar/Actualizar gasto
    saveExpense: async (uid, expense) => {
        const expenseRef = doc(db, 'users', uid, 'expenses', expense.id);
        await setDoc(expenseRef, expense);
    },

    // Eliminar gasto
    deleteExpense: async (uid, expenseId) => {
        await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId));
    },

    // --- SETTINGS & CARDS ---
    // Guardar configuración
    saveSettings: async (uid, settings) => {
        await setDoc(doc(db, 'users', uid, 'metadata', 'settings'), settings);
    },

    subscribeToSettings: (uid, callback) => {
        return onSnapshot(doc(db, 'users', uid, 'metadata', 'settings'), (doc) => {
            if (doc.exists()) callback(doc.data());
        });
    },

    // Guardar tarjetas
    saveCreditCards: async (uid, cards) => {
        await setDoc(doc(db, 'users', uid, 'metadata', 'credit_cards'), { list: cards });
    },

    subscribeToCreditCards: (uid, callback) => {
        return onSnapshot(doc(db, 'users', uid, 'metadata', 'credit_cards'), (doc) => {
            if (doc.exists()) callback(doc.data().list || []);
        });
    },

    // Guardar categorías personalizadas
    saveCategories: async (uid, categories) => {
        await setDoc(doc(db, 'users', uid, 'metadata', 'categories'), { list: categories });
    },

    subscribeToCategories: (uid, callback) => {
        return onSnapshot(doc(db, 'users', uid, 'metadata', 'categories'), (doc) => {
            if (doc.exists()) callback(doc.data().list || []);
        });
    },

    // Guardar métodos de pago personalizados
    savePaymentMethods: async (uid, methods) => {
        await setDoc(doc(db, 'users', uid, 'metadata', 'payment_methods'), { list: methods });
    },

    subscribeToPaymentMethods: (uid, callback) => {
        return onSnapshot(doc(db, 'users', uid, 'metadata', 'payment_methods'), (doc) => {
            if (doc.exists()) callback(doc.data().list || []);
        });
    },

    // --- MIGRATION UTILS ---
    uploadLocalData: async (uid, { expenses, settings, creditCards, categories, paymentMethods }) => {
        const batch = writeBatch(db);

        // Expenses
        expenses.forEach(exp => {
            const ref = doc(db, 'users', uid, 'expenses', exp.id);
            batch.set(ref, exp);
        });

        // Settings
        if (settings) {
            const settingsRef = doc(db, 'users', uid, 'metadata', 'settings');
            batch.set(settingsRef, settings);
        }

        // Cards
        if (creditCards && creditCards.length > 0) {
            const cardsRef = doc(db, 'users', uid, 'metadata', 'credit_cards');
            batch.set(cardsRef, { list: creditCards });
        }

        // Categories
        if (categories && categories.length > 0) {
            const categoriesRef = doc(db, 'users', uid, 'metadata', 'categories');
            batch.set(categoriesRef, { list: categories });
        }

        // Payment Methods
        if (paymentMethods && paymentMethods.length > 0) {
            const methodsRef = doc(db, 'users', uid, 'metadata', 'payment_methods');
            batch.set(methodsRef, { list: paymentMethods });
        }

        await batch.commit();
    },

    // --- GENERAL NOTES ---
    saveGeneralNotes: async (uid, notes) => {
        await setDoc(doc(db, 'users', uid, 'metadata', 'general_notes'), { content: notes });
    },

    subscribeToGeneralNotes: (uid, callback) => {
        return onSnapshot(doc(db, 'users', uid, 'metadata', 'general_notes'), (doc) => {
            if (doc.exists()) callback(doc.data().content || '');
        });
    }
};
