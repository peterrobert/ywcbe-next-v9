import React from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WelcomeWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeWorkspace = ({ isOpen, onClose }: WelcomeWorkspaceProps) => {
  const navigate = useNavigate();

  const onExplore = () => {
    onClose();
    navigate("/black-hand");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 paper-texture">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-xl sm:max-w-2xl bg-card border-2 sm:border-4 border-foreground ink-shadow rounded-sm p-5 sm:p-8 md:p-10 my-auto"
      >
        {/* Header controls */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Back to TUC landing page"
            className="border-2 border-foreground rounded-sm ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            aria-label="Close welcome overlay"
            className="border-2 border-foreground rounded-sm ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-col items-center pt-8 pb-12 border-b border-foreground/10 mb-12">
          <h1 id="welcome-title" className="font-display text-4xl sm:text-6xl md:text-7xl text-center uppercase text-foreground tracking-tighter leading-[0.9]">
            Welcome to TUC <br />
            <span className="text-xl sm:text-2xl md:text-3xl opacity-50 block mt-2 sm:mt-4 tracking-normal font-sans">(The Ultimate Collaboration)</span>
          </h1>
        </div>

        <div className="space-y-12 sm:space-y-16 max-w-prose mx-auto pb-12 sm:pb-20">
          <div className="space-y-4 text-center sm:text-left">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight italic font-serif">
              Enough is enough. It's time to do things differently.
            </p>
          </div>

          <div className="space-y-8 text-lg sm:text-xl md:text-2xl text-foreground/80 leading-relaxed font-medium text-center sm:text-left">
            <p>
              We keep reinventing the wheel, repeating mistakes, wasting resources, and passing problems from one generation to the next instead of addressing their root causes.
            </p>
            <p>
              The world doesn't lack ideas, knowledge, resources, or people willing to make a difference. We lack an effective way to overcome fragmentation, connect what already exists, build on what works, and turn possibilities into results—not more feel-good meetings, conferences, awards, and accolades with questionable returns on the resources invested.
            </p>
            <p className="font-bold text-foreground text-xl sm:text-2xl md:text-3xl leading-snug">
              It's time to reimagine "Think Globally, Act Locally"—aggregate what works, reimagine what doesn't, and create more opportunity for everyone, not just those with the greatest resources or connections.
            </p>
            <p>
              TUC is being built to increase the efficacy of existing efforts, reduce duplication, accelerate the spread of good ideas, and make solutions easier for communities everywhere to discover, adopt, adapt, improve, and build upon.
            </p>
            <p className="font-bold text-foreground text-xl sm:text-2xl md:text-3xl leading-snug pt-4 sm:pt-6 border-t-2 border-foreground/5">
              TUC is a global effort to be the change we want to see—exploring what becomes possible when we expand access, better connect people, ideas, knowledge, and resources globally, and follow through to achieve meaningful results locally.
            </p>
          </div>

          <div className="pt-12 border-t border-foreground/10 text-center sm:text-left">
            <p className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              The idea is ambitious. The possibilities are enormous. And we're just getting started.
            </p>
            <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed">
              Explore how TUC is being built to turn this vision into something practical—and discover where you fit in.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-12 pt-12 border-t border-foreground/10">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto rounded-sm border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-3 px-8 py-7"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="font-display text-xl sm:text-2xl uppercase tracking-tight">Back</span>
          </Button>

          <Button
            onClick={onExplore}
            className="w-full sm:w-auto rounded-sm border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background ink-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform gap-3 px-8 py-7"
          >
            <span className="font-display text-xl sm:text-2xl uppercase tracking-tight">Explore the Idea</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWorkspace;
