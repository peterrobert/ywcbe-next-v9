"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

/**
 * `not-found.tsx` is statically prerendered, so the requested path is not
 * available while the HTML is generated. Reading it through
 * `useSyncExternalStore` keeps the prerendered markup stable (empty string) and
 * lets the client fill in the real path after hydration, without a hydration
 * mismatch and without a state update inside an effect.
 */
const subscribe = () => () => {};
const getPathname = () => window.location.pathname;
const getServerPathname = () => "";

const NotFound = () => {
  const pathname = useSyncExternalStore(
    subscribe,
    getPathname,
    getServerPathname
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="px-4 text-center">
        <h1 className="mb-2 text-6xl font-extrabold text-primary">404</h1>
        <p className="mb-6 text-2xl text-muted-foreground">
          Sorry, we couldn&apos;t find that page.
        </p>
        <span className="inline-block px-3 py-1 mb-6 text-sm rounded shadow bg-accent text-accent-foreground">
          The page <span className="font-mono">{pathname}</span> does not exist.
        </span>
        <div>
          <Link
            href="/"
            className="inline-block px-6 py-2 mt-6 font-semibold rounded shadow transition bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
