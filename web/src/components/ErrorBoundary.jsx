import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="shell flex min-h-screen items-center justify-center py-10">
          <section className="panel w-full max-w-2xl p-8 text-center md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
              PressGo
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Something went wrong
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
              Please refresh the page or return home.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary w-full sm:w-auto"
              >
                Refresh Page
              </button>
              <Link to="/" className="btn-secondary w-full sm:w-auto">
                Return Home
              </Link>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
