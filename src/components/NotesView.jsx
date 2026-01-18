import { useState, useEffect } from 'react';

export function NotesView({ notes, onSave }) {
    const [localNotes, setLocalNotes] = useState(notes);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);

    const handleSave = () => {
        setIsSaving(true);
        onSave(localNotes);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        📝 Mis Notas y Anotaciones
                    </h2>
                    <button
                        onClick={handleSave}
                        className={`btn-primary text-sm px-6 py-2 flex items-center gap-2 ${isSaving ? 'opacity-75 scale-95' : ''}`}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin text-lg">⏳</span>
                                <span>Guardado...</span>
                            </>
                        ) : (
                            <>
                                <span>💾</span>
                                <span>Guardar Notas</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <textarea
                        className="form-input min-h-[60vh] py-4 px-6 leading-relaxed resize-none bg-[var(--color-bg-tertiary)]/30"
                        placeholder="Escribe aquí tus recordatorios, objetivos financieros, o cualquier cosa que quieras tener a mano..."
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-[var(--color-text-muted)]">
                        {localNotes.length} caracteres
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Tus notas se guardan automáticamente en la nube y puedes verlas desde cualquier dispositivo al iniciar sesión.
                    </p>
                </div>
            </div>
        </div>
    );
}
