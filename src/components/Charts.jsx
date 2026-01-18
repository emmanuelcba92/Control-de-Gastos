import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const CATEGORY_LABELS = {
    suscripcion: '🎬 Suscripciones',
    software: '💻 Software/IA',
    mercado_credito: '🛒 Mercado Crédito',
    servicios: '📱 Servicios Digitales',
    almacenamiento: '☁️ Almacenamiento',
    gaming: '🎮 Gaming',
    otro: '📦 Otros'
};

export function Charts({
    expenses,
    monthlyTotals,
    expensesByMethod,
    expensesByCategory = {},
    expensesByCreditCard = {},
    year,
    settings = { salary: 0, currency: 'ARS' },
    getSalaryPercentage,
    getStatusColor
}) {
    const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const currencySymbols = { ARS: '$', USD: 'US$', EUR: '€', BRL: 'R$' };
    const currencySymbol = currencySymbols[settings.currency] || '$';

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: settings.currency || 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Colors for charts
    const gradientColors = [
        'rgba(99, 102, 241, 0.8)',   // Indigo
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(6, 182, 212, 0.8)',    // Cyan
        'rgba(16, 185, 129, 0.8)',   // Emerald
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(239, 68, 68, 0.8)',    // Red
    ];

    const borderColors = [
        'rgba(99, 102, 241, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(6, 182, 212, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
    ];

    const totalMonthly = expenses.reduce((sum, exp) => sum + exp.monto, 0);
    const totalYearly = totalMonthly * 12;
    const salaryPercentage = getSalaryPercentage ? getSalaryPercentage(totalMonthly) : 0;
    const statusColor = getStatusColor ? getStatusColor(salaryPercentage) : 'green';

    // Bar colors based on salary percentage
    const getBarColor = (value) => {
        if (!settings.salary || settings.salary <= 0) return 'rgba(99, 102, 241, 0.7)';
        const pct = (value / settings.salary) * 100;
        if (pct <= 25) return 'rgba(16, 185, 129, 0.8)'; // Green
        if (pct <= 50) return 'rgba(245, 158, 11, 0.8)'; // Yellow
        return 'rgba(239, 68, 68, 0.8)'; // Red
    };

    // Bar chart data - Monthly totals with dynamic colors
    const barChartData = {
        labels: months,
        datasets: [
            {
                label: `Gastos Mensuales ${year}`,
                data: monthlyTotals,
                backgroundColor: monthlyTotals.map(v => getBarColor(v)),
                borderColor: monthlyTotals.map(v => getBarColor(v).replace('0.8', '1')),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => formatCurrency(context.raw),
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(156, 163, 175, 1)', font: { size: 12 } },
            },
            y: {
                grid: { color: 'rgba(156, 163, 175, 0.2)' },
                ticks: {
                    color: 'rgba(156, 163, 175, 1)',
                    font: { size: 12 },
                    callback: (value) => formatCurrency(value),
                },
            },
        },
    };

    // Doughnut chart data - By payment method
    const methodLabels = Object.keys(expensesByMethod);
    const methodValues = Object.values(expensesByMethod);

    const doughnutChartData = {
        labels: methodLabels,
        datasets: [{
            data: methodValues,
            backgroundColor: gradientColors.slice(0, methodLabels.length),
            borderColor: borderColors.slice(0, methodLabels.length),
            borderWidth: 2,
            hoverOffset: 10,
        }],
    };

    // Category chart data
    const categoryLabels = Object.keys(expensesByCategory).map(k => CATEGORY_LABELS[k] || k);
    const categoryValues = Object.values(expensesByCategory);

    const categoryChartData = {
        labels: categoryLabels,
        datasets: [{
            data: categoryValues,
            backgroundColor: gradientColors.slice(0, categoryLabels.length),
            borderColor: borderColors.slice(0, categoryLabels.length),
            borderWidth: 2,
            hoverOffset: 10,
        }],
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'rgba(156, 163, 175, 1)',
                    font: { size: 11 },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${formatCurrency(context.raw)} (${percentage}%)`;
                    },
                },
            },
        },
        cutout: '65%',
    };

    // Credit card totals
    const creditCardEntries = Object.entries(expensesByCreditCard);

    if (expenses.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Sin datos para mostrar</h3>
                <p className="text-[var(--color-text-secondary)]">
                    Añade gastos para ver los gráficos de análisis
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards with Salary Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`total-card ${statusColor === 'green' ? 'border-green-500' : statusColor === 'yellow' ? 'border-yellow-500' : 'border-red-500'}`} style={{ borderWidth: '3px', borderStyle: 'solid' }}>
                    <div className="label">
                        {expenses.some(e => e.cuotas > 1) ? 'Total Filtrado' : 'Total Mensual'}
                    </div>
                    <div className="value">{formatCurrency(totalMonthly)}</div>
                    {settings.salary > 0 && (
                        <div className={`text-xs mt-1 font-medium ${statusColor === 'green' ? 'text-green-500' : statusColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                            {salaryPercentage.toFixed(1)}% del sueldo
                        </div>
                    )}
                </div>
                <div className="glass-card p-6">
                    <div className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                        Estimado Anual
                    </div>
                    <div className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">
                        {formatCurrency(totalYearly)}
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                        Servicios Activos
                    </div>
                    <div className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">
                        {expenses.length}
                    </div>
                </div>
                {settings.salary > 0 && (
                    <div className="glass-card p-6">
                        <div className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                            Sueldo Mensual
                        </div>
                        <div className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">
                            {formatCurrency(settings.salary)}
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        📈 Gastos por Mes ({year})
                    </h3>
                    <div className="h-[300px]">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* By Category */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        📂 Por Categoría
                    </h3>
                    <div className="h-[300px]">
                        {categoryLabels.length > 0 ? (
                            <Doughnut data={categoryChartData} options={doughnutChartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
                                Sin datos de categorías
                            </div>
                        )}
                    </div>
                </div>

                {/* By Payment Method */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        💳 Por Método de Pago
                    </h3>
                    <div className="h-[300px]">
                        {methodLabels.length > 0 ? (
                            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
                                Sin datos de métodos de pago
                            </div>
                        )}
                    </div>
                </div>

                {/* Credit Card Breakdown */}
                {creditCardEntries.length > 0 && (
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            🏦 Por Tarjeta de Crédito
                        </h3>
                        <div className="space-y-3">
                            {creditCardEntries.map(([card, total], idx) => (
                                <div key={card} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: gradientColors[idx % gradientColors.length].replace('0.8', '1') }}>
                                            💳
                                        </span>
                                        <span className="font-medium">{card}</span>
                                    </div>
                                    <span className="font-bold text-indigo-500">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mt-2">
                                <span className="font-semibold">Total Tarjetas</span>
                                <span className="font-bold text-lg text-indigo-400">
                                    {formatCurrency(creditCardEntries.reduce((sum, [, v]) => sum + v, 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Category Breakdown Table */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Detalle por Categoría</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm">Categoría</th>
                                <th className="text-right py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm">Monto</th>
                                <th className="text-right py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(expensesByCategory).map(([cat, amount]) => (
                                <tr key={cat} className="border-b border-[var(--color-border)]/50">
                                    <td className="py-3 px-4">{CATEGORY_LABELS[cat] || cat}</td>
                                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(amount)}</td>
                                    <td className="py-3 px-4 text-right text-[var(--color-text-secondary)]">
                                        {((amount / totalMonthly) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-[var(--color-bg-tertiary)] font-semibold">
                                <td className="py-3 px-4">Total</td>
                                <td className="py-3 px-4 text-right">{formatCurrency(totalMonthly)}</td>
                                <td className="py-3 px-4 text-right">100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Expenses */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                    🔝 Mayores Gastos
                </h3>
                <div className="space-y-3">
                    {expenses
                        .sort((a, b) => b.monto - a.monto)
                        .slice(0, 5)
                        .map((expense, index) => (
                            <div
                                key={expense.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <span className="font-medium">{expense.nombre}</span>
                                        <span className="text-xs text-[var(--color-text-muted)] ml-2">
                                            {CATEGORY_LABELS[expense.categoria] || ''}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-bold text-indigo-500">
                                    {formatCurrency(expense.monto)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
