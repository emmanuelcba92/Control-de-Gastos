import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee', color: '#900', textAlign: 'center' }}>
                    <h2>Algo salió mal al cargar la aplicación.</h2>
                    <p>{this.state.error?.message || "Error desconocido"}</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '10px' }}>
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
