import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    // Surface the crash in the console for debugging.
    // eslint-disable-next-line no-console
    console.error('App render error:', error, errorInfo);
  }

  render() {
    const { error, errorInfo } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-blue-950 text-white p-6">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
          <p className="text-blue-100 text-sm mb-4">
            A rendering error occurred. Reload the page and try again. If it persists, send the error details below.
          </p>
          <div className="bg-black/40 rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap max-h-60 overflow-auto border border-white/10">
            {error.message}
            {errorInfo?.componentStack ? `\n\n${errorInfo.componentStack}` : ''}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
