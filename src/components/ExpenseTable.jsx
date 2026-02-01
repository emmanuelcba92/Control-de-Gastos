import { useState } from 'react';

const CATEGORY_LABELS = {
    suscripcion: '🎬 Suscripción',
    software: '💻 Software/IA',
    mercado_credito: '🛒 Mercado Crédito',
    servicios: '📱 Servicios',
    almacenamiento: '☁️ Almacenamiento',
    gaming: '🎮 Gaming',
    otro: '📦 Otro'
};

export function ExpenseTable({ expenses, onEdit, onDelete, total, settings = { currency: 'ARS' }, getSalaryPercentage, getStatusColor }) {
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'fecha_gasto', direction: 'desc' });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: settings.currency || 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const handleDeleteClick = (id) => {
        if (deleteConfirm === id) {
            onDelete(id);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedExpenses = [...expenses].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle specific fields
        if (sortConfig.key === 'fecha_gasto') {
            aValue = new Date(a.fecha_gasto || a.fecha_inicio).getTime();
            bValue = new Date(b.fecha_gasto || b.fecha_inicio).getTime();
        }

        // Handle nulls/undefined
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Handle strings (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
        }
        return '';
    };

    const getPaymentMethodEmoji = (method) => {
        const emojis = {
            'Tarjeta de crédito': '💳',
            'Tarjeta de débito': '💳',
            'PayPal': '🅿️',
            'Mercado Pago': '🟡',
            'Transferencia bancaria': '🏦',
            'Efectivo': '💵',
            'Criptomoneda': '₿',
            'Otro': '📝'
        };
        return emojis[method] || '📝';
    };

    // Calculate salary percentage for header display
    const salaryPercentage = getSalaryPercentage ? getSalaryPercentage(total) : 0;
    const statusColor = getStatusColor ? getStatusColor(salaryPercentage) : 'green';

    // Calculate expenses ending this month
    const expensesEnding = sortedExpenses.filter(e => e.cuotas > 1 && e.cuota_actual === e.cuotas);
    const totalEnding = expensesEnding.reduce((sum, e) => sum + e.monto, 0);

    if (sortedExpenses.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">No hay gastos registrados</h3>
                <p className="text-[var(--color-text-secondary)]">
                    Añade tu primer gasto digital para comenzar a gestionar tu coste de vida
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Card with Status Color */}
                <div className={`total-card ${statusColor === 'green' ? 'border-green-500' : statusColor === 'yellow' ? 'border-yellow-500' : 'border-red-500'}`} style={{ borderWidth: '3px', borderStyle: 'solid' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="label">Total Mensual</div>
                            <div className={`value ${statusColor === 'green' ? 'text-green-500' : statusColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                                {formatCurrency(total)}
                            </div>
                        </div>
                        {settings.salary > 0 && (
                            <div className={`text-right ${statusColor === 'green' ? 'text-green-500' : statusColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                                <div className="text-2xl font-bold">{salaryPercentage.toFixed(1)}%</div>
                                <div className="text-xs opacity-80">del sueldo</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ending Expenses Summary */}
                {totalEnding > 0 && (
                    <div className="total-card border-emerald-500" style={{ borderWidth: '1px', borderStyle: 'dashed', background: 'rgba(16, 185, 129, 0.05)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="label text-emerald-500">✨ Finalizan este mes</div>
                                <div className="value text-emerald-600">{formatCurrency(totalEnding)}</div>
                                <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    Se liberan el próximo mes
                                </div>
                            </div>
                            <div className="text-4xl">🏁</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('nombre')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)]">
                                    Servicio{getSortIndicator('nombre')}
                                </th>
                                <th onClick={() => requestSort('categoria')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)]">
                                    Categoría{getSortIndicator('categoria')}
                                </th>
                                <th onClick={() => requestSort('monto')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)] text-right">
                                    Monto{getSortIndicator('monto')}
                                </th>
                                <th onClick={() => requestSort('cuotas')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)]">
                                    Cuotas{getSortIndicator('cuotas')}
                                </th>
                                <th onClick={() => requestSort('metodo_pago')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)]">
                                    Método{getSortIndicator('metodo_pago')}
                                </th>
                                <th onClick={() => requestSort('tarjeta_credito')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)]">
                                    Tarjeta{getSortIndicator('tarjeta_credito')}
                                </th>
                                <th onClick={() => requestSort('fecha_gasto')} className="cursor-pointer hover:bg-[var(--color-bg-tertiary)]">
                                    Fecha{getSortIndicator('fecha_gasto')}
                                </th>
                                <th style={{ width: '100px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((expense) => {
                                const isEnding = expense.cuotas > 1 && expense.cuota_actual === expense.cuotas;
                                return (
                                    <tr key={expense.id} className={isEnding ? 'bg-emerald-500/10' : ''}>
                                        <td>
                                            <div className="font-medium flex items-center gap-2">
                                                {expense.nombre}
                                                {expense.is_shared && (
                                                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full flex items-center gap-1" title={`Compartido con ${expense.shared_with} ${expense.shared_with === 1 ? 'persona' : 'personas'}`}>
                                                        👥 {1 + (expense.shared_with || 1)}
                                                    </span>
                                                )}
                                                {isEnding && <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Finaliza</span>}
                                            </div>
                                            {expense.notas && (
                                                <div className="text-[10px] text-[var(--color-text-muted)] italic mt-0.5 max-w-[200px] truncate" title={expense.notas}>
                                                    📝 {expense.notas}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-sm">
                                                {CATEGORY_LABELS[expense.categoria] || expense.categoria || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-col items-end">
                                                <span className="amount-display amount-positive">
                                                    {formatCurrency(expense.monto)}
                                                </span>
                                                {expense.is_shared && (
                                                    <span className="text-[10px] text-[var(--color-text-muted)]">
                                                        Total: {formatCurrency(expense.monto_total || (expense.monto * (1 + (expense.shared_with || 1))))}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {expense.cuotas && expense.cuotas > 1 ? (
                                                <span className={`badge ${isEnding ? 'bg-emerald-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {expense.cuota_actual || 1}/{expense.cuotas}
                                                </span>
                                            ) : (
                                                <span className="text-[var(--color-text-muted)]">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge">
                                                {getPaymentMethodEmoji(expense.metodo_pago)} {expense.metodo_pago}
                                            </span>
                                        </td>
                                        <td>
                                            {expense.tarjeta_credito ? (
                                                <span className="text-sm text-indigo-400">{expense.tarjeta_credito}</span>
                                            ) : (
                                                <span className="text-[var(--color-text-muted)]">-</span>
                                            )}
                                        </td>
                                        <td className="text-[var(--color-text-secondary)] text-sm">
                                            {formatDate(expense.fecha_gasto || expense.fecha_inicio)}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => onEdit(expense)}
                                                    className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(expense.id)}
                                                    className={`p-2 rounded-lg transition-all ${deleteConfirm === expense.id
                                                        ? 'bg-red-500 text-white scale-110'
                                                        : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                                                        }`}
                                                    title={deleteConfirm === expense.id ? 'Confirmar' : 'Eliminar'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
