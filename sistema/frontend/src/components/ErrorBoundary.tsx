import React from "react";

interface Props {
  children: React.ReactNode;
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
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error details:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "36px 28px",
          maxWidth: 1024,
          margin: "0 auto",
        }}>
          <div style={{
            background: "var(--color-error-bg)",
            border: "1px solid var(--color-error-border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
          }}>
            <h2 style={{ margin: "0 0 12px", color: "var(--color-danger)", fontSize: "1rem" }}>
              Something went wrong
            </h2>
            <p style={{ margin: "0 0 12px", color: "var(--color-text)" }}>
              {this.state.error?.message}
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Check the browser console for more details. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 12 }}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
