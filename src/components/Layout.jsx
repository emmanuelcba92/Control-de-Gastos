import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export function Layout({ children, activeTab, onTabChange, onOpenSettings, settings }) {
    const { user, loginWithGoogle, logout } = useAuth();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        console.log("Layout mounted, viewport:", window.innerWidth, "x", window.innerHeight);
    }, []);

    useEffect(() => {
        const savedTheme = storage.getTheme();
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        storage.saveTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const currencySymbols = { ARS: '$', USD: 'US$', EUR: '€', BRL: 'R$' };
    const currencySymbol = currencySymbols[settings?.currency] || '$';

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-6 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
                            💰
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                                Coste de Vida Digital
                            </h1>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Gestiona tus gastos digitales {currencySymbol && `(${currencySymbol})`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* User Auth */}
                        {user ? (
                            <div className="flex items-center gap-2 mr-2 bg-[var(--color-bg-tertiary)] rounded-full pl-1 pr-3 py-1">
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full border border-[var(--color-border)]"
                                    title={user.displayName}
                                />
                                <button
                                    onClick={logout}
                                    className="text-xs font-medium text-red-500 hover:text-red-400"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={loginWithGoogle}
                                className="px-4 py-2 mr-2 rounded-xl bg-white text-gray-700 border border-gray-200 shadow-sm text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
                            >
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    className="w-4 h-4"
                                    alt="G"
                                />
                                <span>Entrar</span>
                            </button>
                        )}

                        {/* Settings Button */}
                        <button
                            onClick={onOpenSettings}
                            className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xl hover:scale-110 transition-transform"
                            title="Configuración"
                        >
                            ⚙️
                        </button>
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xl hover:scale-110 transition-transform"
                            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex gap-2 mt-6 border-b border-[var(--color-border)]">
                    <button
                        className={`tab-button ${activeTab === 'gastos' ? 'active' : ''}`}
                        onClick={() => onTabChange('gastos')}
                    >
                        📊 Gastos
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'graficos' ? 'active' : ''}`}
                        onClick={() => onTabChange('graficos')}
                    >
                        📈 Gráficos
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="mx-4">
                {children}
            </main>
        </div>
    );
}
