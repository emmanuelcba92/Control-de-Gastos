import { useState } from 'react';

export function ExpenseForm({
    expense,
    onSave,
    onCancel,
    creditCards = [],
    onAddCreditCard,
    categories = [],
    paymentMethods = [],
    onAddCategory,
    onAddPaymentMethod
}) {
    const [formData, setFormData] = useState({
        nombre: expense?.nombre || '',
        monto: expense?.monto?.toString() || '',
        categoria: expense?.categoria || (categories[0] || 'Suscripción'),
        metodo_pago: expense?.metodo_pago || '',
        tarjeta_credito: expense?.tarjeta_credito || '',
        fecha_inicio: expense?.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_gasto: expense?.fecha_gasto || new Date().toISOString().split('T')[0],
        cuotas: expense?.cuotas?.toString() || '1',
        cuota_actual: expense?.cuota_actual?.toString() || '1',
        is_recurring: expense?.is_recurring || false,
        is_shared: expense?.is_shared || false,
        shared_with: expense?.shared_with?.toString() || '1',
        notas: expense?.notas || '',
        notify_expiration: expense?.notify_expiration || false
    });

    const [errors, setErrors] = useState({});
    const [showNewCardInput, setShowNewCardInput] = useState(false);
    const [newCardName, setNewCardName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewMethodInput, setShowNewMethodInput] = useState(false);
    const [newMethodName, setNewMethodName] = useState('');
    const [newMethodAllowsInstallments, setNewMethodAllowsInstallments] = useState(false);
    const [amountType, setAmountType] = useState('quota'); // 'quota' or 'total'

    // We use the categories and paymentMethods passed via props

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
            let originalMonto = parseFloat(formData.monto);
            let finalAmount = originalMonto;
            const cuotas = parseInt(formData.cuotas) || 1;

            // If user entered Total Amount, divide by quotas to get monthly amount
            if (amountType === 'total' && cuotas > 1) {
                finalAmount = finalAmount / cuotas;
            }

            // Adjust for shared expenses (divide by user + shared_with)
            if (formData.is_shared) {
                const totalPeople = 1 + (parseInt(formData.shared_with) || 0);
                finalAmount = finalAmount / totalPeople;
            }

            onSave({
                ...formData,
                monto: finalAmount, // Always save as monthly amount and user's portion
                monto_total: originalMonto, // Keep reference to original total amount
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

    const handleAddNewCategory = () => {
        if (newCategoryName.trim() && onAddCategory) {
            onAddCategory(newCategoryName.trim());
            setFormData(prev => ({ ...prev, categoria: newCategoryName.trim() }));
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        }
    };

    const handleAddNewMethod = () => {
        if (newMethodName.trim() && onAddPaymentMethod) {
            onAddPaymentMethod({
                name: newMethodName.trim(),
                allowsInstallments: newMethodAllowsInstallments
            });
            setFormData(prev => ({ ...prev, metodo_pago: newMethodName.trim() }));
            setNewMethodName('');
            setNewMethodAllowsInstallments(false);
            setShowNewMethodInput(false);
        }
    };

    const currentMethod = paymentMethods.find(m => m.name === formData.metodo_pago);
    const showInstallments = formData.metodo_pago === 'Tarjeta de crédito' ||
        formData.metodo_pago === 'Mercado Crédito' ||
        (currentMethod && currentMethod.allowsInstallments);

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
                        {!showNewCategoryInput ? (
                            <div className="flex gap-2">
                                <select
                                    className="form-input flex-1"
                                    value={formData.categoria}
                                    onChange={(e) => {
                                        if (e.target.value === 'ADD_NEW') {
                                            setShowNewCategoryInput(true);
                                        } else {
                                            handleChange('categoria', e.target.value);
                                        }
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="ADD_NEW">✨ Añadir nueva categoría...</option>
                                </select>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="form-input flex-1"
                                    placeholder="Nombre de la categoría"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="btn-primary text-sm px-3"
                                    onClick={handleAddNewCategory}
                                >
                                    Añadir
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary text-sm px-3"
                                    onClick={() => setShowNewCategoryInput(false)}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Repetir Mensualmente (Suscripción o Servicios) */}
                    {(formData.categoria === 'Suscripción' || formData.categoria === 'Servicios') && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <input
                                    type="checkbox"
                                    id="is_recurring"
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={formData.is_recurring}
                                    onChange={(e) => handleChange('is_recurring', e.target.checked)}
                                />
                                <label htmlFor="is_recurring" className="text-sm font-medium text-indigo-200 cursor-pointer">
                                    Repetir cada mes indefinidamente
                                </label>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <input
                                    type="checkbox"
                                    id="notify_expiration"
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    checked={formData.notify_expiration}
                                    onChange={(e) => handleChange('notify_expiration', e.target.checked)}
                                />
                                <label htmlFor="notify_expiration" className="text-sm font-medium text-purple-200 cursor-pointer">
                                    🔔 Notificar vencimiento (Navegador y Email)
                                </label>
                            </div>
                        </div>
                    )}

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
                        {!showNewMethodInput ? (
                            <select
                                className={`form-input ${errors.metodo_pago ? 'border-red-500' : ''}`}
                                value={formData.metodo_pago}
                                onChange={(e) => {
                                    if (e.target.value === 'Otro') {
                                        setShowNewMethodInput(true);
                                    } else {
                                        handleChange('metodo_pago', e.target.value);
                                    }
                                }}
                            >
                                <option value="">Seleccionar método</option>
                                {paymentMethods.map(method => {
                                    const name = typeof method === 'string' ? method : method.name;
                                    return <option key={name} value={name}>{name}</option>;
                                })}
                                <option value="Otro">➕ Otro (Añadir nuevo...)</option>
                            </select>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Nombre del método"
                                        value={newMethodName}
                                        onChange={(e) => setNewMethodName(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="btn-primary text-sm px-3"
                                        onClick={handleAddNewMethod}
                                    >
                                        Añadir
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary text-sm px-3"
                                        onClick={() => setShowNewMethodInput(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        type="checkbox"
                                        id="newMethodAllowsInstallments"
                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={newMethodAllowsInstallments}
                                        onChange={(e) => setNewMethodAllowsInstallments(e.target.checked)}
                                    />
                                    <label htmlFor="newMethodAllowsInstallments" className="text-xs text-[var(--color-text-secondary)] cursor-pointer">
                                        Este método permite pagos en cuotas
                                    </label>
                                </div>
                            </div>
                        )}
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

                    {/* Gastos Compartidos */}
                    <div className="space-y-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={formData.is_shared}
                                    onChange={(e) => handleChange('is_shared', e.target.checked)}
                                />
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Compartir este gasto
                                </span>
                            </label>
                            {formData.is_shared && (
                                <span className="text-xs text-indigo-400 font-medium">
                                    Dividiremos el monto por {1 + parseInt(formData.shared_with)}
                                </span>
                            )}
                        </div>

                        {formData.is_shared && (
                            <div className="flex items-center gap-3 pl-6">
                                <label className="text-xs text-[var(--color-text-secondary)]">Dividir con:</label>
                                <select
                                    className="form-input text-xs py-1 px-2 w-auto"
                                    value={formData.shared_with}
                                    onChange={(e) => handleChange('shared_with', e.target.value)}
                                >
                                    <option value="1">1 persona más</option>
                                    <option value="2">2 personas más</option>
                                    <option value="3">3 personas más</option>
                                    <option value="4">4 personas más</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                            Notas o anotaciones (opcional)
                        </label>
                        <textarea
                            className="form-input min-h-[80px] py-2 resize-none"
                            placeholder="Escribe aquí algún recordatorio o detalle..."
                            value={formData.notas}
                            onChange={(e) => handleChange('notas', e.target.value)}
                        />
                    </div>

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
