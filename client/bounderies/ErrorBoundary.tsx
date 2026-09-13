import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode };

// React error boundaries require a class. State and game behavior use hooks.
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
