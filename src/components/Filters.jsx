export function Filters({
    filterType,
    year,
    month,
    onFilterTypeChange,
    onYearChange,
    onMonthChange,
    paymentMethods = [],
    categories = [],
    creditCards = [],
    selectedMethod = 'all',
    selectedCard = 'all',
    selectedCategory = 'all',
    onMethodChange,
    onCardChange,
    onCategoryChange
}) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // We use the paymentMethods passed via props

    // Merge standard methods with any custom ones (though currently implementation uses standard)
    // or just use the passed unique list + standard ones if needed.
    // For simplicity, let's use the provided `paymentMethods` if available, or fallback/merge.
    // Actually, simpler: provide the standard list + 'all'. 

    return (
        <div className="glass-card p-4 mb-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                {/* Filter Type Toggle */}
                <div className="flex w-full sm:w-auto rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <button
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-all text-center ${filterType === 'all'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                            }`}
                        onClick={() => onFilterTypeChange('all')}
                    >
                        Todos
                    </button>
                    <button
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-all text-center ${filterType === 'year'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                            }`}
                        onClick={() => onFilterTypeChange('year')}
                    >
                        Por Año
                    </button>
                    <button
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-all text-center ${filterType === 'month'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                            }`}
                        onClick={() => onFilterTypeChange('month')}
                    >
                        Por Mes
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Year Selector */}
                    {(filterType === 'year' || filterType === 'month') && (
                        <select
                            className="form-input w-full sm:w-auto min-w-[100px]"
                            value={year}
                            onChange={(e) => onYearChange(parseInt(e.target.value))}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    )}

                    {/* Month Selector */}
                    {filterType === 'month' && (
                        <select
                            className="form-input w-full sm:w-auto min-w-[130px]"
                            value={month}
                            onChange={(e) => onMonthChange(parseInt(e.target.value))}
                        >
                            {months.map((m, index) => (
                                <option key={index} value={index}>{m}</option>
                            ))}
                        </select>
                    )}

                    {/* Category Selector */}
                    <select
                        className="form-input w-full sm:w-auto min-w-[150px]"
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <option value="all">📁 Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <div className="h-8 w-px bg-[var(--color-border)] mx-2 hidden sm:block"></div>

                    {/* Payment Method Selector */}
                    <select
                        className="form-input w-full sm:w-auto min-w-[150px]"
                        value={selectedMethod}
                        onChange={(e) => onMethodChange(e.target.value)}
                    >
                        <option value="all">💳 Todos los métodos</option>
                        {paymentMethods.map(method => {
                            const methodName = typeof method === 'string' ? method : method.name;
                            return <option key={methodName} value={methodName}>{methodName}</option>;
                        })}
                    </select>

                    {/* Credit Card Selector - Only if Credit Card is selected */}
                    {selectedMethod === 'Tarjeta de crédito' && (
                        <select
                            className="form-input w-full sm:w-auto min-w-[150px]"
                            value={selectedCard}
                            onChange={(e) => onCardChange(e.target.value)}
                        >
                            <option value="all">🏦 Todas las tarjetas</option>
                            {creditCards.map(card => (
                                <option key={card} value={card}>{card}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}
