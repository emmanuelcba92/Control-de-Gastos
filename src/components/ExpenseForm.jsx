import { useState } from 'react';

export function ExpenseForm({ expense, onSave, onCancel, creditCards = [], onAddCreditCard }) {
    const [formData, setFormData] = useState({
        nombre: expense?.nombre || '',
        monto: expense?.monto?.toString() || '',
        categoria: expense?.categoria || 'suscripcion',
        metodo_pago: expense?.metodo_pago || '',
        tarjeta_credito: expense?.tarjeta_credito || '',
        fecha_inicio: expense?.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_gasto: expense?.fecha_gasto || new Date().toISOString().split('T')[0],
        cuotas: expense?.cuotas?.toString() || '1',
        cuota_actual: expense?.cuota_actual?.toString() || '1'
    });

    const [errors, setErrors] = useState({});
    const [showNewCardInput, setShowNewCardInput] = useState(false);
    const [newCardName, setNewCardName] = useState('');
    const [amountType, setAmountType] = useState('quota'); // 'quota' or 'total'

    const categories = [
        { value: 'suscripcion', label: '🎬 Suscripción (Netflix, Spotify, etc.)' },
        { value: 'software', label: '💻 Software/IA (ChatGPT, GitHub, etc.)' },
        { value: 'mercado_credito', label: '🛒 Mercado Crédito' },
        { value: 'servicios', label: '📱 Servicios Digitales' },
        { value: 'almacenamiento', label: '☁️ Almacenamiento (iCloud, Drive)' },
        { value: 'gaming', label: '🎮 Gaming (Xbox, PlayStation, Steam)' },
        { value: 'otro', label: '📦 Otro' }
    ];

    const paymentMethods = [
        'Tarjeta de crédito',
        'Tarjeta de débito',
        'PayPal',
        'Mercado Pago',
        'Transferencia bancaria',
        'Efectivo',
        'Criptomoneda',
        'Otro'
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.monto || parseFloat(formData.monto) <= 0) {
            newErrors.monto = 'El monto debe ser mayor a 0';
        }

        if (!formData.metodo_pago) {
            newErrors.metodo_pago = 'Selecciona un método de pago';
        }

        if (formData.metodo_pago === 'Tarjeta de crédito' && !formData.tarjeta_credito) {
            newErrors.tarjeta_credito = 'Selecciona o añade una tarjeta de crédito';
        }

        if (!formData.fecha_gasto) {
            newErrors.fecha_gasto = 'La fecha del gasto es requerida';
        }

        if (parseInt(formData.cuotas) > 1 && parseInt(formData.cuota_actual) > parseInt(formData.cuotas)) {
            newErrors.cuota_actual = 'La cuota actual no puede ser mayor al total';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            let finalAmount = parseFloat(formData.monto);
            const cuotas = parseInt(formData.cuotas) || 1;

            // If user entered Total Amount, divide by quotas to get monthly amount
            if (amountType === 'total' && cuotas > 1) {
                finalAmount = finalAmount / cuotas;
            }

            onSave({
                ...formData,
                monto: finalAmount, // Always save as monthly amount
                cuotas: cuotas,
                cuota_actual: parseInt(formData.cuota_actual) || 1
            });
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleAddNewCard = () => {
        if (newCardName.trim() && onAddCreditCard) {
            onAddCreditCard(newCardName.trim());
            setFormData(prev => ({ ...prev, tarjeta_credito: newCardName.trim() }));
            setNewCardName('');
            setShowNewCardInput(false);
        }
    };

    const showInstallments = formData.metodo_pago === 'Tarjeta de crédito';

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Nombre del servicio
                        </label>
                        <input
                            type="text"
                            className={`form-input ${errors.nombre ? 'border-red-500' : ''}`}
                            placeholder="Netflix, Spotify, ChatGPT..."
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Categoría
                        </label>
                        <select
                            className="form-input"
                            value={formData.categoria}
                            onChange={(e) => handleChange('categoria', e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Monto */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                Monto
                            </label>
                            {showInstallments && parseInt(formData.cuotas) > 1 && (
                                <div className="flex bg-[var(--color-bg-tertiary)] rounded-lg p-0.5">
                                    <button
                                        type="button"
                                        className={`px-2 py-0.5 text-xs rounded-md transition-all ${amountType === 'quota'
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                            }`}
                                        onClick={() => setAmountType('quota')}
                                    >
                                        Por Cuota
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-2 py-0.5 text-xs rounded-md transition-all ${amountType === 'total'
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                            }`}
                                        onClick={() => setAmountType('total')}
                                    >
                                        Total
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={`form-input ${errors.monto ? 'border-red-500' : ''}`}
                                placeholder="0.00"
                                value={formData.monto}
                                onChange={(e) => handleChange('monto', e.target.value)}
                            />
                            {showInstallments && parseInt(formData.cuotas) > 1 && formData.monto > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">
                                    {amountType === 'total'
                                        ? `~ ${(parseFloat(formData.monto) / parseInt(formData.cuotas)).toFixed(2)} / cuota`
                                        : `Total: ${(parseFloat(formData.monto) * parseInt(formData.cuotas)).toFixed(2)}`
                                    }
                                </div>
                            )}
                        </div>
                        {errors.monto && (
                            <p className="text-red-500 text-sm mt-1">{errors.monto}</p>
                        )}
                    </div>

                    {/* Método de pago */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Método de pago
                        </label>
                        <select
                            className={`form-input ${errors.metodo_pago ? 'border-red-500' : ''}`}
                            value={formData.metodo_pago}
                            onChange={(e) => handleChange('metodo_pago', e.target.value)}
                        >
                            <option value="">Seleccionar método</option>
                            {paymentMethods.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                        {errors.metodo_pago && (
                            <p className="text-red-500 text-sm mt-1">{errors.metodo_pago}</p>
                        )}
                    </div>

                    {/* Tarjeta de crédito (condicional) */}
                    {formData.metodo_pago === 'Tarjeta de crédito' && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                                Tarjeta de Crédito
                            </label>
                            {!showNewCardInput ? (
                                <>
                                    <select
                                        className={`form-input ${errors.tarjeta_credito ? 'border-red-500' : ''}`}
                                        value={formData.tarjeta_credito}
                                        onChange={(e) => handleChange('tarjeta_credito', e.target.value)}
                                    >
                                        <option value="">Seleccionar tarjeta</option>
                                        {creditCards.map(card => (
                                            <option key={card} value={card}>{card}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="text-sm text-indigo-500 hover:text-indigo-400 mt-2"
                                        onClick={() => setShowNewCardInput(true)}
                                    >
                                        + Añadir nueva tarjeta
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Ej: VISA Galicia ****1234"
                                        value={newCardName}
                                        onChange={(e) => setNewCardName(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn-primary text-sm px-3"
                                        onClick={handleAddNewCard}
                                    >
                                        Añadir
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary text-sm px-3"
                                        onClick={() => setShowNewCardInput(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            {errors.tarjeta_credito && (
                                <p className="text-red-500 text-sm mt-1">{errors.tarjeta_credito}</p>
                            )}
                        </div>
                    )}

                    {/* Cuotas (condicional - solo tarjeta de crédito) */}
                    {showInstallments && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                                    Cantidad de Cuotas
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="48"
                                    className="form-input"
                                    value={formData.cuotas}
                                    onChange={(e) => handleChange('cuotas', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                                    Cuota Actual
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={formData.cuotas}
                                    className={`form-input ${errors.cuota_actual ? 'border-red-500' : ''}`}
                                    value={formData.cuota_actual}
                                    onChange={(e) => handleChange('cuota_actual', e.target.value)}
                                />
                                {errors.cuota_actual && (
                                    <p className="text-red-500 text-sm mt-1">{errors.cuota_actual}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                                Fecha del Gasto
                            </label>
                            <input
                                type="date"
                                className={`form-input ${errors.fecha_gasto ? 'border-red-500' : ''}`}
                                value={formData.fecha_gasto}
                                onChange={(e) => handleChange('fecha_gasto', e.target.value)}
                            />
                            {errors.fecha_gasto && (
                                <p className="text-red-500 text-sm mt-1">{errors.fecha_gasto}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                                Fecha de Inicio
                            </label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.fecha_inicio}
                                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {expense ? 'Guardar Cambios' : 'Añadir Gasto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
