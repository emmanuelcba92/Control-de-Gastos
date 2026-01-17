import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const CURRENCIES = [
    { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
    { code: 'USD', symbol: 'US$', name: 'Dólar Estadounidense' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' }
];

export function SettingsModal({ settings, creditCards, onSave, onRemoveCreditCard, onClose }) {
    const [formData, setFormData] = useState({
        salary: settings?.salary || 0,
        currency: settings?.currency || 'ARS'
    });

    useEffect(() => {
        setFormData({
            salary: settings?.salary || 0,
            currency: settings?.currency || 'ARS'
        });
    }, [settings]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            salary: parseFloat(formData.salary) || 0,
            currency: formData.currency
        });
        onClose();
    };

    const handleExport = () => {
        const data = storage.exportData();
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `coste-vida-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (storage.importData(data)) {
                        alert('Datos importados correctamente. La página se recargará.');
                        window.location.reload();
                    } else {
                        alert('Error al importar los datos. El formato no es válido.');
                    }
                } catch (error) {
                    console.error(error);
                    alert('Error al leer el archivo.');
                }
            };
            reader.readAsText(file);
        }
    };

    const getCurrencySymbol = () => {
        return CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    ⚙️ Configuración
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Moneda */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Moneda
                        </label>
                        <select
                            className="form-input"
                            value={formData.currency}
                            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        >
                            {CURRENCIES.map(cur => (
                                <option key={cur.code} value={cur.code}>
                                    {cur.symbol} - {cur.name} ({cur.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sueldo */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Sueldo mensual ({getCurrencySymbol()})
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input"
                            placeholder="0.00"
                            value={formData.salary}
                            onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            Se usará para calcular el porcentaje de tus gastos
                        </p>
                    </div>

                    {/* Tarjetas de Crédito */}
                    {creditCards.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                                Tarjetas de Crédito Guardadas
                            </label>
                            <div className="space-y-2">
                                {creditCards.map(card => (
                                    <div key={card} className="flex items-center justify-between bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                                        <span className="text-sm">💳 {card}</span>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveCreditCard(card)}
                                            className="text-red-500 hover:text-red-400 text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gestión de Datos */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Gestión de Datos (Respaldo)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-sm"
                            >
                                <span>📥</span> Exportar Datos
                            </button>
                            <label className="cursor-pointer flex items-center justify-center gap-2 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-sm">
                                <span>📤</span> Importar Datos
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImport}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                            Exporta un archivo JSON para guardar tus datos o transferirlos a otro dispositivo.
                        </p>
                    </div>

                    {/* Info sobre colores */}
                    <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <h4 className="font-medium mb-2">📊 Indicador de Gastos</h4>
                        <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span>Verde: hasta 25% del sueldo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span>Amarillo: hasta 50% del sueldo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span>Rojo: más del 50% del sueldo</span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" className="btn-secondary flex-1" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            Guardar Configuración
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
