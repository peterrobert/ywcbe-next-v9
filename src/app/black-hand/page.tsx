import ConceptOverlay from "@/components/next/ConceptOverlay";
import TucSkipNav from "@/components/next/TucSkipNav";
import { Hand } from "lucide-react";

const BlackHandOverview = () => {
  return (
    <>
      <TucSkipNav />
      <main id="main-content" tabIndex={-1}>
        <ConceptOverlay
          title="WHAT IS TUC?"
          accentClass="bg-foreground text-background"
          icon={<Hand className="h-10 w-10" aria-hidden="true" />}
          nextPath="/earth-globe"
          nextLabel="EXPLORE TUC"
        >
          <div className="space-y-12 max-w-[700px] mx-auto text-left">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What if we stopped starting over?</h2>
              <p className="text-xl leading-relaxed">
                Every day, people around the world are working on the same problems, often unaware of each other&apos;s ideas, experiences, resources, and hard-earned lessons.
              </p>
              <p className="text-xl leading-relaxed">
                Imagine if every new effort could build on everything we&apos;ve already learned instead of repeating the same mistakes.
              </p>
              <p className="text-2xl font-bold">
                That&apos;s the opportunity TUC is being built to unlock.
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-foreground/10">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Not another app. A different way of getting things done.</h2>
              <p className="text-xl leading-relaxed">
                TUC (The Ultimate Collaboration) is being developed as a global connectivity and collaboration system—helping people and existing efforts find one another, combine strengths, overcome obstacles, and turn good ideas into meaningful results.
              </p>
              <p className="text-xl leading-relaxed">
                Instead of repeatedly starting from scratch, TUC aims to help us collaborate around our commonalities, respect and learn from our differences, align our passions, and build on what we can agree on.
              </p>
              <p className="text-2xl font-bold">
                Not replacing what works. Connecting it, improving it, and making it easier for others to build upon.
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-foreground/10">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">And who gets to participate?</h2>
              <p className="text-xl leading-relaxed italic">
                What about the people with extraordinary potential but without money, credentials, connections, or a seat at the table?
              </p>
              <p className="text-2xl font-bold">
                Opportunity shouldn&apos;t depend on who you know, where you live, or what you already have.
              </p>
              <p className="text-xl leading-relaxed">
                Enormous value already exists in people, knowledge, ideas, equipment, experience, time, and work already done. Too much of it remains overlooked, underused, or inaccessible.
              </p>
              <p className="text-xl leading-relaxed">
                TUC is being designed to make participation more accessible, connect these resources with where they&apos;re needed, and recognize the value people can bring—not just the resources they control.
              </p>
            </div>

            <div className="space-y-6 pt-12 border-t border-foreground/20">
              <p className="text-2xl sm:text-3xl font-bold leading-tight italic">
                The real question isn&apos;t whether we can do better. It&apos;s what becomes possible when we actually work better together.
              </p>
              <p className="text-xl opacity-70">
                Explore the ideas, projects, and people helping turn this vision into reality.
              </p>
            </div>
          </div>
        </ConceptOverlay>
      </main>
    </>
  );
};

export default BlackHandOverview;
