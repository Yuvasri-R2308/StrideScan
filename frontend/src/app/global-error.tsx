"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4 text-center">
          <h2 className="text-xl font-bold text-rose-400">Clinical System Error</h2>
          <p className="text-xs text-slate-300">
            {error?.message || "An unexpected error occurred during rendering."}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
