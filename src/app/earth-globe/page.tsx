import ConceptOverlay from "@/components/next/ConceptOverlay";
import TucSkipNav from "@/components/next/TucSkipNav";
import { Globe2 } from "lucide-react";

const EarthGlobeOverview = () => {
  return (
    <>
      <TucSkipNav />
      <main id="main-content" tabIndex={-1}>
        <ConceptOverlay
          title="THE RESOURCES WE NEED ALREADY EXIST"
          accentClass="bg-[hsl(var(--tuc-earth-blue))] text-background"
          icon={<Globe2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" aria-hidden="true" />}
          nextPath="/yellow-sticky-note"
          nextLabel="EXPLORE 2% SPARE BANDWIDTH"
        >
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                What if the missing resource isn&apos;t something we lack—but something we haven&apos;t connected?
              </h2>
              <p>
                Students with ideas, discoveries, or research efforts, disconnected from others around the world pursuing similar work—and the untapped potential of combining their knowledge, perspectives, and efforts.
              </p>
              <p>
                A retired professional with decades of experience and no one to share it with. Equipment sitting idle while someone nearby struggles without it. A successful solution in one community that another community has never heard of.
              </p>
              <p className="font-bold">
                The opportunities aren&apos;t always missing. Often, the connections are.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                What are we overlooking?
              </h2>
              <p>
                Significant value already exists in people, ideas, knowledge, places, tools, technology, time, infrastructure, and previous efforts. Much of that value remains difficult to find, inaccessible, disconnected, overlooked, or used for only a fraction of its potential.
              </p>
              <p>
                Some of the world&apos;s greatest underutilized resources may be people whose knowledge, abilities, experiences, and perspectives existing systems fail to recognize or include.
              </p>
              <p>
                Students. Elders. People with disabilities. Neurodivergent people. Marginalized and disenfranchised communities. Informal populations. People separated by geography, language, education, income, or circumstance.
              </p>
              <p>
                These aren&apos;t simply populations that need help. <span className="font-bold">They bring valuable perspectives, capabilities, and opportunities the world cannot afford to keep overlooking.</span>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                What becomes possible when we connect the missing pieces?
              </h2>
              <p>
                Imagine if underutilized equipment and infrastructure could find new purposes, experience could reach someone who needs it, and successful ideas could spread across communities without everyone having to start over.
              </p>
              <p>
                One connection could unlock an opportunity. One opportunity could create value for many others. And one successful solution could become the starting point for countless improvements.
              </p>
              <p>
                TUC is being designed to make more of these resources visible, accessible, and connected—so people and existing efforts can create greater value together.
              </p>
              <p>
                Through <span className="font-bold">practical learning—learning by doing, measuring results, sharing lessons, and building on experience</span>—each effort can create value beyond its original purpose.
              </p>
              <p className="font-bold">
                The goal isn&apos;t simply to use more resources. It&apos;s to help people and resources reach more of their potential—while creating more value than we consume.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                What could we accomplish with what we already have?
              </h2>
              <p>
                Before assuming we need more, TUC is building regenerative systems to help us recognize, connect, and unlock more of the value that already exists—and discover what&apos;s possible when we work better together.
              </p>
              <p className="font-bold bg-white/10 p-4 rounded-lg border border-white/20">
                Join us in being the change we want to see. Bring your ideas, perspectives, experiences, and curiosity. Explore what interests you, engage where you can, and help turn possibilities into meaningful results.
              </p>
            </section>
          </div>
        </ConceptOverlay>
      </main>
    </>
  );
};

export default EarthGlobeOverview;
