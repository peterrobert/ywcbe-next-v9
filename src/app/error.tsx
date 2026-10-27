"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const getDigest = (error: unknown) => {
  if (typeof error !== "object" || error === null) return undefined;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" ? digest : undefined;
};

const ErrorPage = ({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) => {
  useEffect(() => {
    // Only the digest is safe to log: it correlates with server logs without
    // exposing error messages, stack traces, or user data.
    console.error("[tuc] route render error", { digest: getDigest(error) });
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 md:p-12 paper-texture">
      <div
        role="alert"
        className="w-full max-w-2xl bg-card border-2 sm:border-4 border-foreground ink-shadow rounded-sm p-6 sm:p-10 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter leading-[0.95] mt-4">
          This view didn&apos;t load.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          The page hit an unexpected problem. Try loading it again, or head back
          to the TUC landing page.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            type="button"
            onClick={() => retry()}
            className="w-full sm:w-auto rounded-sm border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-2 px-6 py-6"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            <span className="font-display text-xl uppercase tracking-tight">
              Try again
            </span>
          </Button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform px-6 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="font-display text-xl uppercase tracking-tight">
              Back to TUC
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
