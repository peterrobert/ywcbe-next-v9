"use client";

import { useState } from "react";
import Link from "next/link";
import TucSkipNav from "@/components/next/TucSkipNav";
import TucIconButton from "@/components/next/TucIconButton";
import WelcomeWorkspace from "@/components/next/WelcomeWorkspace";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 md:p-12 relative overflow-x-hidden paper-texture">
      <TucSkipNav />

      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "w-full max-w-7xl mx-auto flex flex-col items-center gap-16 md:gap-24 transition-all duration-500",
          isWelcomeOpen && "lg:mr-[300px] xl:mr-[400px] opacity-50 lg:opacity-100"
        )}
      >
        {/* Desktop Layout - Kept unchanged */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 items-center w-full">

          {/* Left Column */}
          <div className="flex flex-col gap-16 md:gap-40 items-center md:items-end order-2 md:order-1">
            <TucIconButton
              to="/black-hand"
              variant="black-hand"
              label="What is TUC?"
              className="md:-translate-y-[163px] lg:-translate-y-[195px] md:-translate-x-[25px]"
            >
              <span className="font-hand text-2xl md:text-3xl underline decoration-2 underline-offset-4 uppercase">
                What is TUC?
              </span>
            </TucIconButton>

            <TucIconButton
              to="/yellow-sticky-note"
              variant="yellow-sticky"
              label="2% Spare Bandwidth"
              className="md:-translate-y-[220px] lg:-translate-y-[240px] md:-translate-x-[10px]"
            >
              <div className="flex flex-col items-center">
                <span className="font-hand text-5xl md:text-7xl font-bold">2%</span>
                <div className="w-16 h-1 bg-foreground mt-1 mb-2" />
                <span className="font-hand text-lg md:text-xl uppercase text-center leading-tight tracking-tight">
                  Spare<br />Bandwidth
                </span>
              </div>
            </TucIconButton>
          </div>

          {/* Center Column */}
          <div className="flex flex-col items-center order-1 md:order-2 gap-16 md:gap-32">
            <Link
              href="/top10-poc"
              onClick={() => window.scrollTo(0, 0)}
              className="px-10 py-3 rounded-full border border-foreground bg-white text-foreground hover:bg-foreground hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-50 mb-0 md:mb-[-4rem]"
              aria-label="Navigate to Top10 Lists"
            >
              <span className="font-serif text-2xl md:text-3xl font-medium tracking-tight whitespace-nowrap">Top10 Lists</span>
            </Link>

            <button
              onClick={() => setIsWelcomeOpen(true)}
              className="text-center z-40 hover:scale-[1.02] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-2"
              aria-label="Open Welcome to TUC"
            >
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-[-1rem] md:mb-[-1.5rem]">
                Welcome To
              </p>
              <h1 className="font-display text-8xl md:text-[12rem] lg:text-[14rem] leading-none tracking-tighter uppercase select-none">
                TUC
              </h1>
              <p className="mt-8 md:mt-12 text-sm md:text-base font-medium tracking-tight text-foreground">
                👉 Click anything that makes you curious.
              </p>
            </button>

            <div className="relative flex flex-col md:flex-row items-center justify-center w-full">
              <Link
                href="/survey-poc"
                onClick={() => window.scrollTo(0, 0)}
                className="absolute -top-24 -left-12 md:-top-40 md:-left-24 text-4xl md:text-5xl hover:scale-110 transition-transform z-50 select-none cursor-pointer"
                aria-label="Take TUC Survey"
              >
                🙂
              </Link>
              <Link
                href="/closerlook"
                className="md:absolute md:right-[105%] lg:right-[120%] md:top-1/2 md:-translate-y-1/2 whitespace-nowrap group flex items-center gap-3 px-10 py-4 rounded-full border-2 border-foreground hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Navigate to CloserLook Workspace"
              >
                <Search className="w-6 h-6" />
                <span className="italic font-serif text-2xl md:text-3xl font-medium tracking-tight">CloserLook@</span>
              </Link>
              <TucIconButton
                to="/red-flag"
                variant="red-flag"
                label="Red Flag Overview"
                className="md:-translate-y-[145px]"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-16 md:gap-40 items-center md:items-start order-3">
            <TucIconButton
              to="/earth-globe"
              variant="globe"
              label="Earth Globe Overview"
            />

            <div className="flex flex-col items-center md:items-start gap-12">
              <TucIconButton
                href="https://docs.google.com/forms/d/e/1FAIpQLSfAliHmLu4qnbGVGoNC_YRnnqGPL-RXKjAlM2SE9ky4bVLl4A/viewform?usp=dialog"
                variant="suggestion-box"
                label="Submit a Suggestion"
                className="md:-translate-y-[160px]"
              />

              <TucIconButton
                to="/crumpled-paper"
                variant="crumpled-paper"
                label="Another App?"
                className="md:-translate-y-[160px] md:-translate-x-[160px]"
              >
                <span className="font-hand text-2xl md:text-3xl underline decoration-2 underline-offset-4 uppercase text-center max-w-[120px] leading-tight">
                  ANOTHER APP?
                </span>
              </TucIconButton>
            </div>
          </div>
        </div>

        {/* Mobile Layout - New Reorganized Order */}
        <div className="md:hidden flex flex-col items-center gap-16 w-full pb-12">
          {/* 1. Welcome to TUC */}
          <button
            onClick={() => setIsWelcomeOpen(true)}
            className="text-center z-40 hover:scale-[1.02] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-2 relative"
            aria-label="Open Welcome to TUC"
          >
            {/* Handwritten "CLICK" indicator - Mobile only */}
            <div className="absolute -top-10 -left-12 pointer-events-none opacity-90 rotate-[-15deg] md:hidden z-50" aria-hidden="true">
              <svg width="90" height="90" viewBox="0 0 60 60" className="text-foreground fill-none">
                <path d="M10 40L25 25M5 35L20 20M15 45L30 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <text x="32" y="25" className="font-hand text-[11px] fill-current uppercase font-bold">click here</text>
              </svg>
            </div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-[-0.75rem]">
              Welcome To
            </p>
            <h1 className="font-display text-[6.5rem] leading-none tracking-tighter uppercase select-none">
              TUC
            </h1>
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm font-medium tracking-tight text-foreground">
                👉 Click anything that makes you curious.
              </p>
              <Link
                href="/survey-poc"
                onClick={() => window.scrollTo(0, 0)}
                className="text-4xl mt-2 hover:scale-110 transition-transform inline-block"
                aria-label="Take TUC Survey"
              >
                🙂
              </Link>
            </div>
          </button>

          {/* 2. What Is TUC? */}
          <TucIconButton
            to="/black-hand"
            variant="black-hand"
            label="What is TUC?"
          >
            <span className="font-hand text-2xl underline decoration-2 underline-offset-4 uppercase">
              What is TUC?
            </span>
          </TucIconButton>

          {/* 3. The Resources We Need Already Exist */}
          <TucIconButton
            to="/earth-globe"
            variant="globe"
            label="Earth Globe Overview"
          />

          {/* 4. 2% Spare Bandwidth */}
          <TucIconButton
            to="/yellow-sticky-note"
            variant="yellow-sticky"
            label="2% Spare Bandwidth"
          >
            <div className="flex flex-col items-center">
              <span className="font-hand text-5xl font-bold">2%</span>
              <div className="w-12 h-1 bg-foreground mt-1 mb-2" />
              <span className="font-hand text-lg uppercase text-center leading-tight tracking-tight">
                Spare<br />Bandwidth
              </span>
            </div>
          </TucIconButton>

          {/* 5. Red Flags */}
          <TucIconButton
            to="/red-flag"
            variant="red-flag"
            label="Red Flag Overview"
          />

          {/* 6. Another App? */}
          <TucIconButton
            to="/crumpled-paper"
            variant="crumpled-paper"
            label="Another App?"
          >
            <span className="font-hand text-2xl underline decoration-2 underline-offset-4 uppercase text-center max-w-[120px] leading-tight">
              ANOTHER APP?
            </span>
          </TucIconButton>

          {/* 7. Top10 Lists */}
          <Link
            href="/top10-poc"
            onClick={() => window.scrollTo(0, 0)}
            className="px-10 py-4 rounded-full border-2 border-foreground bg-white text-foreground hover:bg-foreground hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Navigate to Top10 Lists"
          >
            <span className="font-serif text-2xl font-medium tracking-tight whitespace-nowrap">Top10 Lists</span>
          </Link>

          {/* 8. Submit a Suggestion */}
          <TucIconButton
            href="https://docs.google.com/forms/d/e/1FAIpQLSfAliHmLu4qnbGVGoNC_YRnnqGPL-RXKjAlM2SE9ky4bVLl4A/viewform?usp=dialog"
            variant="suggestion-box"
            label="Submit a Suggestion"
          />

          {/* 9. CloserLook@ */}
          <Link
            href="/closerlook"
            className="whitespace-nowrap group flex items-center gap-3 px-10 py-4 rounded-full border-2 border-foreground hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Navigate to CloserLook Workspace"
          >
            <Search className="w-6 h-6" />
            <span className="italic font-serif text-2xl font-medium tracking-tight">CloserLook@</span>
          </Link>
        </div>
      </main>

      <WelcomeWorkspace
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />
    </div>
  );
};

export default Index;