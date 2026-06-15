import { Component, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b0b14",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}>
          <div style={{ maxWidth: 560 }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ opacity: 0.8, marginBottom: 16 }}>
              The app hit an unexpected error while loading. Try a hard refresh
              (Ctrl/Cmd&nbsp;+&nbsp;Shift&nbsp;+&nbsp;R). If it keeps happening,
              the details below will help debug.
            </p>
            <pre style={{
              background: "#15151f",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 12,
              maxHeight: 240,
            }}>{String(this.state.error?.stack || this.state.error?.message)}</pre>
            <button
              onClick={() => { localStorage.clear(); location.reload(); }}
              style={{
                marginTop: 16,
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #333",
                background: "#1f1f2e",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Reset app & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
