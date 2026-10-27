"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MousePointerClick } from "lucide-react";

interface TucIconButtonProps {
  to?: string;
  href?: string;
  variant: "black-hand" | "yellow-sticky" | "globe" | "crumpled-paper" | "red-flag" | "suggestion-box";
  label: string;
  className?: string;
  children?: React.ReactNode;
}

interface IconButtonContentProps {
  variant: TucIconButtonProps["variant"];
  children?: React.ReactNode;
}

// Extracted from the legacy inline component so it keeps a stable identity
// across renders. The rendered markup is unchanged.
const IconButtonContent = ({ variant, children }: IconButtonContentProps) => {
  if (variant === "globe") {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-foreground ink-shadow">
          {/* eslint-disable-next-line @next/next/no-img-element -- legacy remote asset kept as-is */}
          <img
            className="w-full h-full object-cover"
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_88f00ba619_7ca58802f2a328bf.png"
            alt="photorealistic earth globe from space showing continents and oceans, dark blue and green, high detai"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <p className="text-sm md:text-base font-bold uppercase tracking-tight text-center leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-[140px] md:max-w-[180px]">
            The resources we need already exist.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "red-flag") {
    return (
      <div className="w-28 h-44 md:w-40 md:h-56 flex items-center justify-center relative">
        <svg
          viewBox="0 0 100 160"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          {/* Simple Black Pole - Slightly organic path */}
          <path
            d="M24 10 Q 25 80, 24 150"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Gently Waving Red Flag */}
          <path
            d="M26 15
               C 45 10, 65 25, 85 18
               C 82 35, 88 50, 85 62
               C 65 55, 45 70, 26 65
               Z"
            fill="hsl(var(--tuc-red))"
          />
        </svg>
        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <MousePointerClick className="w-4 h-4 text-[hsl(var(--tuc-red))]" />
        </div>
      </div>
    );
  }

  if (variant === "suggestion-box") {
    return (
      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rotate-[12deg]">
         <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
           {/* 3D Box Construction */}

           {/* Right Side - Depth */}
           <path d="M150 80 L180 50 L180 140 L150 170 Z" fill="#991b1b" />

           {/* Top Surface */}
           <path d="M40 80 L70 50 L180 50 L150 80 Z" fill="#ef4444" />

           {/* Papers in Slot */}
           <g transform="translate(100, 55) rotate(-5)">
             <rect x="-15" y="-30" width="30" height="45" fill="#f3f4f6" stroke="#991b1b" strokeWidth="0.5" rx="1" />
           </g>
           <g transform="translate(120, 50) rotate(8)">
             <rect x="-15" y="-30" width="32" height="50" fill="white" stroke="#991b1b" strokeWidth="0.5" rx="1" />
           </g>

           {/* Front Face */}
           <rect x="40" y="80" width="110" height="90" fill="#dc2626" rx="1" />

           {/* Slot on Top Surface */}
           <path d="M75 65 L145 65" stroke="#450a0a" strokeWidth="4" strokeLinecap="round" />

           {/* Text on Front Face */}
           <g className="font-sans select-none" pointerEvents="none">
             <text x="95" y="125" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" className="uppercase tracking-[0.15em] opacity-95">Submit a</text>
             <text x="95" y="148" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" className="uppercase tracking-tight">Suggestion</text>
           </g>
         </svg>
      </div>
    );
  }

  if (variant === "crumpled-paper") {
    return (
      <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- legacy remote asset kept as-is */}
        <img className="absolute inset-0 w-full h-full object-contain" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_e96766a1f9_a1482af51388d43e.png" alt="a single piece of white crumpled paper ball, isolated on white background, photorealistic texture" />
        <div className="relative z-10 px-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-w-[150px] md:min-w-[195px]">
      {children}
      {(variant === "black-hand" || variant === "yellow-sticky") && (
        <div className="absolute -top-10 -left-10 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity rotate-[-15deg]" aria-hidden="true">
           <svg width="80" height="80" viewBox="0 0 60 60" className="text-foreground fill-none">
              <path d="M10 40L25 25M5 35L20 20M15 45L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <text x="32" y="25" className="font-hand text-[10px] fill-current uppercase">click here</text>
           </svg>
        </div>
      )}
    </div>
  );
};

const TucIconButton = ({ to, href, variant, label, className, children }: TucIconButtonProps) => {
  const baseClasses = "group relative transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const variants = {
    "black-hand": "bg-foreground text-background rotate-[-2deg] p-8 md:p-12 ink-shadow border-2 border-foreground",
    "yellow-sticky": "bg-[hsl(var(--tuc-yellow))] text-foreground rotate-[1deg] p-6 md:p-9 ink-shadow border-2 border-foreground",
    "globe": "rounded-full hover:scale-105",
    "crumpled-paper": "relative hover:scale-110 transition-transform",
    "red-flag": "hover:scale-110 transition-transform",
    "suggestion-box": "hover:scale-110 transition-transform",
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClasses, variants[variant], className)}
        aria-label={label}
      >
        <IconButtonContent variant={variant}>{children}</IconButtonContent>
      </a>
    );
  }

  return (
    <Link href={to || "#"} className={cn(baseClasses, variants[variant], className)} aria-label={label}>
      <IconButtonContent variant={variant}>{children}</IconButtonContent>
    </Link>
  );
};

export default TucIconButton;