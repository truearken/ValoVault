"use client";

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="loading-screen d-flex flex-column justify-content-center align-items-center vh-100 p-4">
                    <div className="text-center" style={{ maxWidth: '600px' }}>
                        <p className="section-label" style={{ color: 'var(--pulse)', justifyContent: 'center', display: 'flex' }}>System error</p>
                        <h1 className="mb-4" style={{ color: 'var(--bone)', fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Something went wrong</h1>
                        <p className="mb-3" style={{ color: 'var(--ash)' }}>
                            The application encountered an unexpected error. This might be caused by:
                        </p>
                        <ul className="text-start mb-4" style={{ color: 'var(--ash)' }}>
                            <li>A recent Valorant update that changed the game data</li>
                            <li>Network connectivity issues</li>
                            <li>The Valorant client not running properly</li>
                        </ul>
                        <div className="alert alert-secondary text-start mb-4" style={{ wordBreak: 'break-word' }}>
                            <strong>Error details:</strong>
                            <pre className="mb-0 mt-2" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', fontFamily: 'var(--font-plex-mono)' }}>
                                {this.state.error?.message || 'Unknown error'}
                            </pre>
                            {this.state.error?.stack && (
                                <details className="mt-2">
                                    <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
                                    <pre className="mt-2" style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', fontFamily: 'var(--font-plex-mono)' }}>
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                        <div className="d-flex gap-3 justify-content-center">
                            <button className="btn btn-primary" onClick={this.handleReload}>
                                Reload Application
                            </button>
                            <a
                                href="https://github.com/truearken/valovault/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-secondary"
                            >
                                Report Issue
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
