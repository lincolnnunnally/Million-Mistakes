import React from 'react';
import { Flame } from 'lucide-react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 ember-gradient">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(18,92%,52%)] shadow-[var(--shadow-ember)] mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Something Went Wrong</h1>
            <p className="text-[hsl(22,12%,40%)] mb-6">
              Even apps make mistakes! Don't worry, just try again.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/home';
              }}
              className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-6 font-display"
            >
              Back to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
