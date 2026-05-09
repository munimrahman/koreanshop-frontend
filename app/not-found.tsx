import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Korean Skincare Shop BD",
  description: "The page you are looking for could not be found. Return to our home page to continue shopping.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Search className="w-24 h-24 mx-auto text-pink-500/20 mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Page Not Found</p>
          <p className="text-gray-500 dark:text-gray-300 mb-8">
            Sorry, the page you're looking for doesn't exist. It might have been removed or the URL might be incorrect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Need Help?</p>
          <Link
            href="/contact"
            className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-semibold transition-colors"
          >
            Contact Our Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}
