import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
        window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 'var(--space-xl)', display: 'flex', justifyItems: 'center', width: '100%' }}>
          <div className="error-boundary-card">
            <AlertTriangle size={48} color="var(--color-danger)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-danger)' }}>Something went wrong</h3>
            <p style={{ margin: '0 0 24px 0', color: '#991B1B', textAlign: 'center', fontSize: '0.9rem' }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              className="btn btn-primary" 
              style={{ backgroundColor: 'var(--color-danger)', borderColor: '#991B1B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={this.handleRetry}
            >
              <RefreshCcw size={18} style={{ marginRight: '8px' }} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
