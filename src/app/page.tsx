"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { toast } = useToast();

  return (
    <main className="min-h-screen bg-background text-foreground paper-texture flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tighter text-center">
        Next migration shell
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Milestone 1 smoke test. This temporary page verifies Next.js, Tailwind,
        React Query, the tooltip provider, and toasts.
      </p>
      <Button
        onClick={() =>
          toast({
            title: "Smoke test",
            description: "Providers are working.",
          })
        }
      >
        Show toast
      </Button>
    </main>
  );
}
