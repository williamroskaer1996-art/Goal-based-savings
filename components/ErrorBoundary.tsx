'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-sm font-semibold text-grounded-green">Something went wrong</p>
          <p className="text-xs text-charcoal/50">{this.state.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, message: '' });
              window.location.href = '/home';
            }}
            className="mt-2 rounded-xl bg-grounded-green px-6 py-3 text-sm font-semibold text-white transition active:scale-95"
          >
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
