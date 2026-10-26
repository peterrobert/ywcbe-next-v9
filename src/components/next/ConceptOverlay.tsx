"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConceptOverlayProps {
  title: string;
  accentClass: string; // e.g. "bg-[hsl(var(--tuc-yellow))]"
  icon: ReactNode;
  children: ReactNode;
  footerNote?: string;
  nextPath?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  customFooter?: ReactNode;
}

const ConceptOverlay = ({
  title,
  accentClass,
  icon,
  children,
  footerNote,
  nextPath,
  nextLabel,
  nextDisabled = false,
  customFooter,
}: ConceptOverlayProps) => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen w-full bg-background paper-texture flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        className="relative w-full max-w-xl sm:max-w-2xl bg-card border-2 sm:border-4 border-foreground ink-shadow rounded-sm p-5 sm:p-8 md:p-10"
      >
        {/* Header controls */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleNavigate("/")}
            aria-label="Back to TUC landing page"
            className="border-2 border-foreground rounded-sm ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNavigate("/")}
            aria-label="Close overlay"
            className="border-2 border-foreground rounded-sm ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center border-2 border-foreground ${accentClass}`}>
            {icon}
          </div>
        </div>

        <h1
          id="overlay-title"
          className="font-display text-2xl sm:text-3xl md:text-4xl text-center uppercase mb-4 sm:mb-6 text-foreground"
        >
          {title}
        </h1>

        <div className="text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80 space-y-4 max-w-prose mx-auto">
          {children}
        </div>

        {footerNote && (
          <p className="font-hand text-center text-base sm:text-lg mt-6 sm:mt-8 text-muted-foreground">
            {footerNote}
          </p>
        )}

        {customFooter ? (
          <div className="mt-12 pt-12 border-t border-foreground/10">
            {customFooter}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-12 pt-12 border-t border-foreground/10">
            <Button
              type="button"
              onClick={() => handleNavigate("/")}
              className="w-full sm:w-auto rounded-sm border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-3 px-6 sm:px-8 py-6 sm:py-7 min-h-[60px]"
            >
              <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="font-display text-lg sm:text-2xl uppercase tracking-tight">Back</span>
            </Button>

            {nextPath && (
              <Button
                type="button"
                aria-disabled={nextDisabled || undefined}
                onClick={nextDisabled ? undefined : () => handleNavigate(nextPath)}
                className="w-full sm:w-auto rounded-sm border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-3 px-6 sm:px-8 py-6 sm:py-7 min-h-[60px]"
              >
                <span className="font-display text-lg sm:text-2xl uppercase tracking-tight text-center leading-tight">{nextLabel || "Learn More"}</span>
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                {nextDisabled && <span className="sr-only"> (not available yet)</span>}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptOverlay;
