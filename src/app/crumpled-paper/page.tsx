import ConceptOverlay from "@/components/next/ConceptOverlay";
import TucSkipNav from "@/components/next/TucSkipNav";
import { Trash2 } from "lucide-react";

const CrumpledPaperOverview = () => {
  return (
    <>
      <TucSkipNav />
      <main id="main-content" tabIndex={-1}>
        <ConceptOverlay
          title="🗑️ Another App?"
          accentClass="bg-muted text-foreground"
          icon={<Trash2 className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />}
          nextPath="/top10-poc"
          nextLabel="EXPLORE WAYS TO ENGAGE"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <p>
                At first glance, TUC can look like another app or another collection of tools that already exist elsewhere.
              </p>
              <p className="font-bold">
                Most of those tools already do exist. That’s the point.
              </p>
              <p>
                TUC isn’t being built to replace every useful platform, organization, system, or tool with a TUC version.
              </p>
              <p>
                The opportunity is to connect more of what already works so that the people, knowledge, resources, and activity within one system can create value somewhere else.
              </p>
              <div className="space-y-1 py-2">
                <p>A suggestion might become a decision.</p>
                <p>A decision might become a project.</p>
                <p>A project can produce results.</p>
                <p>Those results create evidence and practical learning that someone else can improve, remix, share, and adopt.</p>
              </div>
              <p>
                The same principle applies beyond software. An existing organization, community program, piece of research, unused building, useful technology, or time-tested solution shouldn’t have to be recreated simply because the people who need it don’t know it exists or can’t easily connect to it.
              </p>
              <p className="font-bold">
                Instead of repeatedly starting from scratch, TUC is designed to help us find, connect, improve, and build on what already exists.
              </p>
              <p className="font-bold">
                The pieces don’t all need to belong to TUC.
              </p>
              <p className="font-bold">
                The connection is the point.
              </p>
            </div>
          </div>
        </ConceptOverlay>
      </main>
    </>
  );
};

export default CrumpledPaperOverview;
