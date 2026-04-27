'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics service
    console.error('Root Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-12 shadow-xl border border-stone-100 text-center">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">Something went wrong</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          The server encountered an issue while rendering this page.
          {error.digest && (
            <span className="block mt-2 text-xs font-mono text-stone-400">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-colors shadow-lg"
          >
            Try again
          </button>
          
          <Link 
            href="/"
            className="w-full py-4 bg-stone-100 text-stone-600 rounded-full font-bold hover:bg-stone-200 transition-colors"
          >
            Return Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 text-left rounded-xl overflow-auto max-h-40 text-xs font-mono">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
