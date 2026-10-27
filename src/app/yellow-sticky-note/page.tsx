import type { Metadata } from "next";
import ConceptOverlay from "@/components/next/ConceptOverlay";
import TucSkipNav from "@/components/next/TucSkipNav";
import { StickyNote } from "lucide-react";

const description =
  "TUC asks for a small fraction of existing capacity: a few minutes, a useful introduction, specialized knowledge, or access to a resource that is already there.";

export const metadata: Metadata = {
  title: "2% Spare Bandwidth",
  description,
  openGraph: { title: "2% Spare Bandwidth | TUC", description },
};

const YellowStickyNoteOverview = () => {
  return (
    <>
      <TucSkipNav />
      <main id="main-content" tabIndex={-1}>
        <ConceptOverlay
          title="⏳ 2% SPARE BANDWIDTH"
          accentClass="bg-[hsl(var(--tuc-yellow))] text-foreground"
          icon={<StickyNote className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />}
          nextPath="/red-flag"
          nextLabel="EXPLORE RED FLAGS →"
        >
          <div className="space-y-6">
            <p>
              TUC doesn&apos;t require a massive commitment—or even 2% of everyone&apos;s time or money.
            </p>
            <p>
              The idea is to connect and make better use of a small fraction of humanity&apos;s existing, underutilized capacity.
            </p>
            <p>
              <strong className="block mb-1 text-lg">For hyper-busy people and organizations:</strong>
              Businesses, nonprofits, foundations and institutions don&apos;t need to change their core operations. A few minutes, a useful introduction, specialized knowledge, access to an existing resource, or simply pointing something in the right direction can create value.
            </p>
            <p>
              <strong className="block mb-1 text-lg">For the global community:</strong>
              Students, elders, independent contributors, marginalized communities and people in the informal sector have enormous amounts of knowledge, experience, perspectives, local awareness, relationships and capacity that existing systems often fail to reach or connect.
            </p>
            <div className="bg-foreground/5 p-6 rounded-lg">
              <p className="font-bold mb-3 text-lg">What spare bandwidth can look like:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Keeping an eye out for a problem or opportunity.",
                  "Identifying an underused resource.",
                  "Answering a question.",
                  "Sharing time-tested knowledge or experience.",
                  "Making a useful introduction.",
                  "Sharing what worked, what didn't, and what others could learn from it."
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[hsl(var(--tuc-yellow))] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p>
              One five-minute contribution may seem insignificant. But when small contributions from millions of different people begin to connect, they can compound, ripple and create opportunities far beyond the original contribution.
            </p>
            <p className="italic font-medium border-t pt-6 border-foreground/10 text-center">
              The 2% Ripple Effect: Small contributions can connect, compound and become something much bigger.
            </p>
          </div>
        </ConceptOverlay>
      </main>
    </>
  );
};

export default YellowStickyNoteOverview;
