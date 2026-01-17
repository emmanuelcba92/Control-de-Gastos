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
    const expensesEnding = expenses.filter(e => e.cuotas > 1 && e.cuota_actual === e.cuotas);
    const totalEnding = expensesEnding.reduce((sum, e) => sum + e.monto, 0);

    if (expenses.length === 0) {
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
                                <th>Servicio</th>
                                <th>Categoría</th>
                                <th>Monto</th>
                                <th>Cuotas</th>
                                <th>Método</th>
                                <th>Tarjeta</th>
                                <th>Fecha</th>
                                <th style={{ width: '100px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => {
                                const isEnding = expense.cuotas > 1 && expense.cuota_actual === expense.cuotas;
                                return (
                                    <tr key={expense.id} className={isEnding ? 'bg-emerald-500/10' : ''}>
                                        <td>
                                            <div className="font-medium flex items-center gap-2">
                                                {expense.nombre}
                                                {isEnding && <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Finaliza</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm">
                                                {CATEGORY_LABELS[expense.categoria] || expense.categoria || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="amount-display amount-positive">
                                                {formatCurrency(expense.monto)}
                                            </span>
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
