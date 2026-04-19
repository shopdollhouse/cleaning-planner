import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`Error in ${this.props.sectionName}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl p-6 border border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-semibold text-destructive mb-1">
                {this.props.sectionName} encountered an error
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                We've logged this error. Try refreshing the page or going back to the home section.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs font-mono text-destructive/70 p-2 bg-background rounded">
                  {this.state.error?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
