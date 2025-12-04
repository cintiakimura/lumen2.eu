import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Initializing Lumen Academy App...");

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#0a1410', color: '#fff', height: '100vh', fontFamily: 'monospace' }}>
          <h1>System Failure</h1>
          <p>Critical error in initialization.</p>
          <pre style={{ color: '#ff4444' }}>{this.state.error?.toString()}</pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', background: '#00c600', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);