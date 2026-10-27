"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Info, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import TucSkipNav from "@/components/next/TucSkipNav";
import { useToast } from "@/hooks/use-toast";

const SUGGESTION_BOX_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfAliHmLu4qnbGVGoNC_YRnnqGPL-RXKjAlM2SE9ky4bVLl4A/viewform";

const OpenItems = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openItem = {
    taskId: "TUC-TASK-0002",
    suggestionId: "TUC-SB-0005",
    title: "Suggestion Box Loop Test",
    idea: "Simplify the Suggestion Box entry process and verify the end-to-end \"suggestion-to-learning\" loop.",
    purpose: "To ensure the core TUC feedback mechanism is intuitive and that every contribution leads to a documented result.",
    progress: "The revised question has been approved. Live implementation and end-to-end testing remain to be verified.",
    microTask: "Verify live form wording, submit a real test suggestion, and trace it through Suggestions → Task Tracker → Results → Learning.",
    helpNeeded: "UX/UI review, implementation, testing, and evidence documentation.",
    status: "Open / In follow-through"
  };

  // Set to true when ready to publish the first item
  const isPublished = true;

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopyId = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await navigator.clipboard.writeText(openItem.taskId);
    } catch {
      // Never report success when the browser did not actually copy the ID.
      setCopied(false);
      toast({
        title: "Copy Failed",
        description: `Could not copy ${openItem.taskId}. Please select and copy it manually.`,
        variant: "destructive",
      });
      return;
    }

    setCopied(true);
    toast({
      title: "ID Copied",
      description: `${openItem.taskId} copied to clipboard.`,
    });

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <TucSkipNav />

      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <header className="mb-16 space-y-8 border-b border-foreground/10 pb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              OpenItems
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Participation Opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 pt-4">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Idea</h2>
              <p className="text-xl font-medium leading-relaxed">
                Connect visitors with specific, actionable opportunities to help TUC and existing efforts reach their full potential.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Purpose</h2>
              <p className="text-xl font-medium leading-relaxed">
                Make it easy to find a task that matches your skills and interests—and see exactly how your contribution fits into the bigger picture.
              </p>
            </div>
          </div>
        </header>

        {isPublished ? (
          <section className="space-y-12">
            <div className="p-8 md:p-12 border-2 border-foreground rounded-3xl space-y-10 bg-foreground/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-6">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{openItem.title}</h3>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Task: {openItem.taskId}</span>
                    <span>Source: {openItem.suggestionId}</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                  {openItem.status}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The Idea</h4>
                  <p className="font-medium leading-relaxed">{openItem.idea}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Purpose</h4>
                  <p className="font-medium leading-relaxed">{openItem.purpose}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Progress</h4>
                  <p className="font-medium leading-relaxed text-primary">{openItem.progress}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Micro Task</h4>
                  <p className="font-medium leading-relaxed italic">{openItem.microTask}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-foreground/10 space-y-8">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What Help Is Needed</h4>
                  <p className="text-lg font-bold leading-relaxed">{openItem.helpNeeded}</p>
                </div>

                <div className="p-6 bg-primary/5 rounded-2xl space-y-6 border border-primary/10">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Participation Instructions</h4>
                    <p className="text-sm font-medium leading-relaxed">
                      Want to help complete this task? Include the reference <span className="font-bold underline decoration-primary/30 decoration-2">{openItem.taskId}</span> in your submission and describe how you can help.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-6 text-sm font-bold tracking-tight border-primary/20 hover:border-primary/40"
                      onClick={handleCopyId}
                    >
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied ? "COPIED" : `COPY TASK ID: ${openItem.taskId}`}
                    </Button>

                    <Button
                      size="lg"
                      className="h-14 px-10 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                      asChild
                    >
                      <a href={SUGGESTION_BOX_URL} target="_blank" rel="noopener noreferrer">
                        I CAN HELP
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Participation is tracked manually in the Attempts & Contributions log.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl space-y-6 bg-foreground/[0.01]">
            <div className="h-16 w-16 bg-foreground/5 rounded-full flex items-center justify-center">
              <Info className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold tracking-tight">Preparing for Participation</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                OpenItems are being prepared for public participation. Check back as opportunities become available.
              </p>
            </div>
          </section>
        )}

        <footer className="mt-20 pt-12 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="lg"
            className="h-16 px-8 text-lg font-bold tracking-tight hover:bg-transparent hover:underline underline-offset-8"
            onClick={() => handleNavigate("/top10-poc")}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            BACK TO TOP10
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="h-16 px-8 text-lg font-bold tracking-tight hover:bg-transparent hover:underline underline-offset-8"
            onClick={() => handleNavigate("/")}
          >
            <Home className="mr-2 h-5 w-5" />
            HOME
          </Button>
        </footer>
      </main>
    </div>
  );
};

export default OpenItems;
