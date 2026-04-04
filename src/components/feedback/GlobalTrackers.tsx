'use client';

/**
 * GlobalTrackers Component
 *
 * Sets up global tracking for console errors, API requests, and navigation history
 * to support the feedback system's smart context capture.
 *
 * Data is stored in window globals:
 * - window.__feedbackErrors: Last 50 console errors
 * - window.__feedbackApiRequests: Last 20 API requests/responses
 * - window.__feedbackNavHistory: Last 10 pages visited
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __feedbackErrors?: Array<{
      message: string;
      timestamp: string;
      stack?: string;
    }>;
    __feedbackApiRequests?: Array<{
      url: string;
      method: string;
      status: number;
      duration_ms: number;
      timestamp: string;
      error: string | null;
    }>;
    __feedbackNavHistory?: Array<{
      path: string;
      timestamp: string;
    }>;
  }
}

export function GlobalTrackers() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Setup Console Error Listener
  useEffect(() => {
    const errors: typeof window.__feedbackErrors = [];
    const originalError = console.error;
    const originalWarn = console.warn;

    // Intercept console.error
    console.error = (...args: unknown[]) => {
      errors.push({
        message: args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });

      // Keep only last 50 errors
      if (errors.length > 50) errors.shift();

      window.__feedbackErrors = errors;
      originalError.apply(console, args);
    };

    // Also capture warnings (they often indicate issues)
    console.warn = (...args: unknown[]) => {
      errors.push({
        message: '[WARN] ' + args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });

      if (errors.length > 50) errors.shift();

      window.__feedbackErrors = errors;
      originalWarn.apply(console, args);
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errors.push({
        message: `[Unhandled Promise] ${event.reason}`,
        timestamp: new Date().toISOString(),
        stack: event.reason?.stack || new Error().stack
      });

      if (errors.length > 50) errors.shift();
      window.__feedbackErrors = errors;
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Initialize array
    window.__feedbackErrors = errors;

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Setup API Request Tracker
  useEffect(() => {
    const requests: typeof window.__feedbackApiRequests = [];
    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = Math.round(performance.now() - startTime);

        requests.push({
          url,
          method,
          status: response.status,
          duration_ms: duration,
          timestamp: new Date().toISOString(),
          error: null
        });

        // Keep only last 20 requests
        if (requests.length > 20) requests.shift();

        window.__feedbackApiRequests = requests;
        return response;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);

        requests.push({
          url,
          method,
          status: 0,
          duration_ms: duration,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (requests.length > 20) requests.shift();

        window.__feedbackApiRequests = requests;
        throw error;
      }
    };

    // Initialize array
    window.__feedbackApiRequests = requests;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Setup Navigation History Tracker
  useEffect(() => {
    if (!window.__feedbackNavHistory) {
      window.__feedbackNavHistory = [];
    }

    const history = window.__feedbackNavHistory;
    const search = searchParams?.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;

    // Track current page
    history.push({
      path: fullPath,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 pages
    if (history.length > 10) history.shift();

    window.__feedbackNavHistory = history;
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}
