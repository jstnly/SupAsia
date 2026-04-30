"use client";

import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="text-5xl">😅</div>
            <div>
              <div className="font-display text-xl font-bold">Có lỗi xảy ra</div>
              <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] mt-1">
                Something went wrong — no progress was lost
              </div>
            </div>
            <button
              onClick={this.reset}
              className="flex items-center gap-2 rounded-full bg-[var(--color-jade-500)] px-5 py-2.5 font-display font-bold text-white shadow-[0_3px_0_0_rgba(26,20,35,0.2)]"
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
