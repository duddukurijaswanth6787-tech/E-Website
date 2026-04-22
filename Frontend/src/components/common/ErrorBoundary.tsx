import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err?.message || 'Unknown error' };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('App error:', err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-950 text-white flex flex-col items-center justify-center p-8 font-sans">
          <h1 className="text-2xl font-serif mb-4">Something went wrong</h1>
          <pre className="text-sm text-primary-200 max-w-lg whitespace-pre-wrap break-words bg-black/20 p-4 rounded-lg">
            {this.state.message}
          </pre>
          <button
            type="button"
            className="mt-8 px-6 py-3 bg-accent text-primary-950 font-semibold rounded-lg"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
