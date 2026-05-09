"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import type { Metadata } from "next";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <AlertCircle className="w-24 h-24 mx-auto text-red-500/20 mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Something went wrong
          </p>
          <p className="text-gray-500 dark:text-gray-300 mb-8">
            We encountered an unexpected error. Please try again or contact our support team if the problem persists.
          </p>
        </div>

        {error.digest && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-8 text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Need Help?</p>
          <Link
            href="/support"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
