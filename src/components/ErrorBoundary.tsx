import React, { ReactNode, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-50 p-4">
          <div className="max-w-md w-full rounded-3xl p-8 bg-white shadow-2xl border border-red-200">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-100">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-center text-gray-600 mb-4">
              The planner encountered an unexpected error. Don't worry — your data is safe in your browser.
            </p>

            {this.state.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs font-mono text-red-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.reset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold hover:shadow-lg transition-shadow"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('dollhouse_appState');
                  window.location.reload();
                }}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Reset to Factory Defaults
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              If this persists, try clearing your browser cache or using an incognito window.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
