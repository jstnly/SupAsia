"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-lacquer-grad min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <div className="text-7xl">😅</div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">Xin lỗi!</h1>
            <p className="mt-1 text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
              Something went wrong. Your progress is safe.
            </p>
            {error.digest && (
              <p className="mt-1 font-mono text-xs text-[color-mix(in_oklab,var(--color-lacquer)_40%,transparent)]">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-full bg-[var(--color-jade-500)] px-6 py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </body>
    </html>
  );
}
