"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import TucSkipNav from "@/components/next/TucSkipNav";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DeepLinkCard } from "@/components/CloserLookWorkspace/DeepLinkCard";

const CloserLookWorkspace = () => {
  const router = useRouter();
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 md:p-12 flex flex-col items-center">
      <TucSkipNav />

      {/* Main Container */}
      <main
        id="main-content"
        tabIndex={-1}
        className="w-full max-w-2xl sm:max-w-3xl bg-card border-2 sm:border-4 border-foreground ink-shadow rounded-sm p-5 sm:p-8 md:p-10 relative"
      >

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="border-2 border-foreground ink-shadow-sm hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all font-bold uppercase tracking-tight"
            aria-label="Return to previous view"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-3 px-4 py-1 border-2 border-foreground rounded-full mb-4">
            <Search className="w-5 h-5" />
            <h1 className="font-display uppercase text-lg sm:text-xl tracking-tighter">
              CloserLook@
            </h1>
          </div>
          <p className="text-muted-foreground font-medium italic">
            Deeper information, one click away.
          </p>
        </div>

        {/* Perspectives Section */}
        <div className="mb-12">
          <Accordion
            type="single"
            collapsible
            value={openItem}
            onValueChange={setOpenItem}
            className="border-2 border-foreground rounded-sm px-4"
          >
            <AccordionItem value="perspectives" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4 font-display uppercase text-left cursor-pointer">
                Perspectives
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  TUC can be understood differently depending on where someone is coming from. No single perspective is assumed to be the correct one.
                </p>
                <ul className="space-y-3">
                  <li className="flex flex-col sm:flex-row sm:gap-3">
                    <span className="font-bold min-w-[120px] uppercase text-[10px] tracking-widest text-primary pt-1">Individual</span>
                    <span className="text-sm">What could TUC help me discover, understand, contribute to or build on?</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:gap-3">
                    <span className="font-bold min-w-[120px] uppercase text-[10px] tracking-widest text-primary pt-1">Community</span>
                    <span className="text-sm">How could existing people, knowledge and resources become more visible, connected and useful?</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:gap-3">
                    <span className="font-bold min-w-[120px] uppercase text-[10px] tracking-widest text-primary pt-1">Organization</span>
                    <span className="text-sm">Could TUC reduce fragmentation, duplication and wasted effort while increasing access to useful knowledge and resources?</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:gap-3">
                    <span className="font-bold min-w-[120px] uppercase text-[10px] tracking-widest text-primary pt-1">C-Level</span>
                    <span className="text-sm">What could TUC mean from strategic, operational, financial, technological and other leadership perspectives?</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Deeper Information Grid */}
        <div className="space-y-4">
          <h2 className="font-display uppercase text-sm tracking-widest text-muted-foreground mb-4">
            Deeper Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DeepLinkCard
              title="Why TUC Matters"
              description="The clearest explanation of why TUC could matter and what it is attempting to accomplish."
              href="https://docs.google.com/document/d/1b_pysDmZdCqtHms3-nme4h7JmlU7wvDWUNtAo36qU3k/edit?usp=sharing"
              linkLabel="Why TUC Matters Google Doc"
              iconColor="bg-blue-600"
            />
            <DeepLinkCard
              title="C-Level Perspectives"
              description="Explore TUC from different organizational and professional perspectives."
              href="https://docs.google.com/document/d/1JbjlU4S-IvXrwp5z4piatwVYdKP5K0GxW3TWWIGM52w/edit?tab=t.8h58bqwrwo7z"
              iconColor="bg-purple-600"
            />
            <DeepLinkCard
              title="White Paper"
              description="TUC's current model, systems, principles and assumptions."
              href="https://docs.google.com/document/d/1mKajfyW4qiPXF-O0LUXq1RHaq7048I2i2zTej9impz8/edit?usp=sharing"
              iconColor="bg-red-600"
            />
            <DeepLinkCard
              title="Grey Paper"
              description="Unresolved questions, risks, tensions, experiments and areas still being tested."
              href="https://docs.google.com/document/d/1A4jlADhoSdn0BZpT8LTQ-0Vzjs0jK1mcIh_2QEqYdsM/edit?usp=sharing"
              iconColor="bg-gray-600"
            />
            <DeepLinkCard
              title="Founder’s Notes"
              description="Context, history & current thinking"
              href="https://docs.google.com/document/d/1-pAQRa1Os5gTCzb6UuppVtMVZgTf8cIJmJdyMtvKX8c/edit?usp=sharing"
              iconColor="bg-emerald-600"
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-dashed border-muted-foreground/30 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            This workspace stays open until you close it.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CloserLookWorkspace;
