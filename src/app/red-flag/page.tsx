import type { Metadata } from "next";
import ConceptOverlay from "@/components/next/ConceptOverlay";
import TucSkipNav from "@/components/next/TucSkipNav";
import { Flag } from "lucide-react";

const description =
  "Noticing what others missed can create value. TUC treats observations and concerns as useful signals worth sharing rather than problems you must solve alone.";

export const metadata: Metadata = {
  title: "Red Flags",
  description,
  openGraph: { title: "Red Flags | TUC", description },
};

const RedFlagOverview = () => {
  return (
    <>
      <TucSkipNav />
      <main id="main-content" tabIndex={-1}>
        <ConceptOverlay
          title="🚩 Red Flags"
          accentClass="bg-white text-[hsl(var(--tuc-red))]"
          icon={<Flag className="h-8 w-8 sm:h-10 sm:w-10 fill-current" aria-hidden="true" />}
          nextPath="/crumpled-paper"
        >
          <div className="space-y-6 text-left">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">What if noticing something others missed could change everything?</h2>
              <p>
                Sometimes the difference between an idea succeeding or failing isn&apos;t more funding, more people, or more effort.
              </p>
              <p>
                <strong>It&apos;s identifying one missing piece before it becomes a bigger problem—or a missed opportunity.</strong>
              </p>
            </section>

            <section className="space-y-3">
              <p className="font-medium">A Red Flag might be:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>An overlooked opportunity or underutilized resource.</li>
                <li>A missing perspective or key stakeholder.</li>
                <li>A confusing message that could be communicated more clearly.</li>
                <li>An assumption that needs to be questioned.</li>
                <li>A potential risk or unintended consequence.</li>
                <li>A connection that could make an existing effort more effective.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">You don&apos;t have to solve the problem to create value.</h2>
              <p>
                Simply identifying something worth another look could be the tipping point that helps an idea succeed.
              </p>
              <p>
                And you don&apos;t have to be an expert. Sometimes a fresh perspective sees what years of familiarity have overlooked.
              </p>
              <p>
                <strong>One observation can lead to one improvement. One improvement can unlock possibilities far beyond the original idea.</strong>
              </p>
            </section>

            <section className="space-y-4 border-t border-[hsl(var(--tuc-red))/0.2] pt-6">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">See something? Say something. Suggest something.</h2>
              <p>
                Red Flags aren&apos;t about finding fault or assigning blame. They&apos;re about recognizing opportunities to learn, improve, and prevent avoidable mistakes.
              </p>
              <p>
                <strong>Your perspective might be the missing piece.</strong>
              </p>
              <p>
                Explore what others have noticed, raise a Red Flag, or help turn one into an opportunity.
              </p>
            </section>
          </div>
        </ConceptOverlay>
      </main>
    </>
  );
};

export default RedFlagOverview;
