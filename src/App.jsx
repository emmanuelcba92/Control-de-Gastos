import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseForm } from './components/ExpenseForm';
import { Filters } from './components/Filters';
import { Charts } from './components/Charts';
import { NotesView } from './components/NotesView';
import { SettingsModal } from './components/SettingsModal';
import { NotificationManager } from './components/NotificationManager';
import { useExpenses } from './hooks/useExpenses';

function App() {
  const [activeTab, setActiveTab] = useState('gastos');
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterCard, setFilterCard] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterShared, setFilterShared] = useState('all');

  const {
    expenses,
    loading,
    settings,
    creditCards,
    categories,
    paymentMethods,
    updateSettings,
    addCreditCard,
    removeCreditCard,
    addCategory,
    addPaymentMethod,
    deleteCategory,
    deletePaymentMethod,
    updatePaymentMethod,
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
    getStatusColor,
    generalNotes,
    updateGeneralNotes,
  } = useExpenses();

  // Get filtered expenses based on current filter
  const filteredExpenses = useMemo(() => {
    return getFilteredExpenses(filterType, selectedYear, selectedMonth, filterMethod, filterCard, filterCategory, filterShared);
  }, [expenses, filterType, selectedYear, selectedMonth, filterMethod, filterCard, filterCategory, filterShared, getFilteredExpenses]);

  const total = useMemo(() => calculateTotal(filteredExpenses), [filteredExpenses, calculateTotal]);

  const monthlyTotals = useMemo(
    () => getMonthlyTotals(selectedYear, filterMethod, filterCard, filterCategory, filterShared),
    [selectedYear, filterMethod, filterCard, filterCategory, filterShared, getMonthlyTotals]
  );

  const expensesByMethod = useMemo(
    () => getExpensesByPaymentMethod(filteredExpenses),
    [filteredExpenses, getExpensesByPaymentMethod]
  );

  const expensesByCategory = useMemo(
    () => getExpensesByCategory(filteredExpenses),
    [filteredExpenses, getExpensesByCategory]
  );

  const expensesByCreditCard = useMemo(
    () => getExpensesByCreditCard(filteredExpenses),
    [filteredExpenses, getExpensesByCreditCard]
  );

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleSaveExpense = (formData) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
    } else {
      addExpense(formData);
    }
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">💰</div>
          <p className="text-[var(--color-text-secondary)]">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenSettings={() => setShowSettings(true)}
      settings={settings}
    >
      <NotificationManager settings={settings} onUpdateSettings={updateSettings} />
      {(activeTab === 'gastos' || activeTab === 'graficos') && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Filters
              filterType={filterType}
              year={selectedYear}
              month={selectedMonth}
              paymentMethods={paymentMethods}
              categories={categories}
              creditCards={creditCards}
              selectedMethod={filterMethod}
              selectedCard={filterCard}
              selectedCategory={filterCategory}
              selectedShared={filterShared}
              onFilterTypeChange={setFilterType}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              onMethodChange={setFilterMethod}
              onCardChange={setFilterCard}
              onCategoryChange={setFilterCategory}
              onSharedChange={setFilterShared}
            />
          </div>
          {activeTab === 'gastos' && (
            <button
              onClick={handleAddExpense}
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap h-[42px]"
            >
              <span>➕</span>
              <span>Añadir Gasto</span>
            </button>
          )}
        </div>
      )}

      {activeTab === 'gastos' && (
        <ExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={deleteExpense}
          total={total}
          settings={settings}
          getSalaryPercentage={getSalaryPercentage}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'graficos' && (
        <Charts
          expenses={filteredExpenses}
          monthlyTotals={monthlyTotals}
          expensesByMethod={expensesByMethod}
          expensesByCategory={expensesByCategory}
          expensesByCreditCard={expensesByCreditCard}
          year={selectedYear}
          settings={settings}
          getSalaryPercentage={getSalaryPercentage}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'notas' && (
        <NotesView
          notes={generalNotes}
          onSave={updateGeneralNotes}
        />
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSave={handleSaveExpense}
          onCancel={handleCloseForm}
          creditCards={creditCards}
          onAddCreditCard={addCreditCard}
          categories={categories}
          paymentMethods={paymentMethods}
          onAddCategory={addCategory}
          onAddPaymentMethod={addPaymentMethod}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          creditCards={creditCards}
          categories={categories}
          paymentMethods={paymentMethods}
          onSave={updateSettings}
          onRemoveCreditCard={removeCreditCard}
          onDeleteCategory={deleteCategory}
          onDeletePaymentMethod={deletePaymentMethod}
          onUpdatePaymentMethod={updatePaymentMethod}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Layout>
  );
}

export default App;
