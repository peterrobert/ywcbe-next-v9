"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TucSkipNav from "@/components/next/TucSkipNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const StaticTop10POC = () => {
  const router = useRouter();

  const top10Lists = [
    "Top10 TUC Principles",
    "Top10 Problems TUC Is Designed to Address",
    "Top10 Things That Make TUC Different",
    "Top10 TUC Value Propositions",
    "Top10 Assumptions TUC Is Testing",
  ];

  const engagementWays = [
    {
      title: "Make a Suggestion 💡",
      availability: "Active",
      priority: 1,
      remixes: [
        "Remix 1: Suggest another way to engage",
        "Remix 2: Suggest an edit that would improve the copy",
        "Remix 3: Suggest something that's missing on ywcbe.com",
        "Remix 4: Suggest a solution to something that could work better",
      ],
    },
    {
      title: "Find Something That Could Be Better 🚩",
      availability: "Active",
      priority: 1,
      remixes: [
        "Remix 1: Find something confusing",
        "Remix 2: Identify a missed opportunity for making TUC easier to understand",
        "Remix 3: Question the Core Values or Principles",
      ],
    },
    {
      title: "Help Finish Building This Onboarding Experience 🧩",
      availability: "Active",
      priority: 1,
      remixes: [
        "Remix 1: Take a survey and give your feedback",
        "Remix 2: Improve an instruction or icon",
        "Remix 3: Help build the next version such as a short video",
      ],
    },
    {
      // `/open-items` is not migrated yet. Keep the card content but do not
      // navigate to a 404. Re-enable the click when that route lands.
      title: "Choose an OpenItem You Can Help Complete ✅",
      availability: "Active",
      priority: 1,
      remixes: [
        "Remix 1: Find where to access TUC's OpenItems list",
        "Remix 2: Try being an OpenItem reviewer",
        "Remix 3: Test the complete OpenItem flow: Suggestion ⏩ Full Potential",
      ],
    },
    {
      title: "Test Something TUC Is Building 🧪",
      availability: "Coming Soon",
      priority: 2,
      remixes: [
        "Remix 1: learn what it means to join an AlphaBeta team",
        "Remix 2: Test a feature or process to help get them approved",
        "Remix 3: Provide evidence about what worked or didn't with understanding TUC",
      ],
    },
    {
      title: "Remix Something 🔄",
      availability: "Coming Soon",
      priority: 2,
      remixes: [
        "Remix 1: Remix an idea, image, copy, system, module, feature ….🔄...",
        "Remix 2: Help develop or promote TUC’s Remix initiatives",
        "Remix 3: Tell someone you know about TUC’s Design Remix",
        "Remix 4: Remix the Copy about one of TUC’s strategies, Methods or Tactics",
        "Remix 5: Combine existing ideas into something new to reduce duplication",
      ],
    },
    {
      title: "Share a Skill or Expertise 🛠️",
      availability: "Coming Soon",
      priority: 2,
      remixes: [
        "Remix 1: Share a Resource",
        "Remix 2: Offer professional expertise or Review Something TUC is Planning to do",
        "Remix 3: Mentor TUC on how to achieve what ever might be in the works on an OpenItem",
        "Remix 4: Share a useful tool or technology",
        "Remix 5: Share available bandwidth to help set up TUC’s management team.",
        "Remix 6: Share useful piece of research or data that supports TUC’s plans to be a global entity to engage the worlds informal Population",
      ],
    },
    {
      title: "Connect Someone Who Could Help 🔗",
      availability: "Coming Soon",
      priority: 2,
      remixes: [
        "Remix 1: Introduce an expert that has a passion for modern cyber security or digital identities",
        "Remix 2: Connect an organization or potential partner that would be a perfect fit partner for TUC to reach its full potential",
        "Remix 3: tell an social economist friend who is always talking about regenerative systems at social events",
        "Remix 4: learn more about TUC’s practical learning Initiative to better understand how you can apply it to your advanced classes at your school",
      ],
    },
    {
      title: "Answer a Question TUC Is Trying to Solve ❓",
      availability: "Coming Soon",
      priority: 2,
      remixes: [
        "Remix 1: Research a question you have about a CloserLook",
        "Remix 2: ASK to edit or just remix a CloserLook",
      ],
    },
    {
      title: "Share or Promote TUC 📢",
      availability: "Coming Soon",
      priority: 2,
      remixes: [
        "Remix 1: Share the website with someone who is depressed or looking for some purpose",
        "Remix 2: Introduce TUC to your community or network who is struggling to manage their waste or have chronic issues with health",
      ],
    },
    {
      title: "Help Develop an Idea Into Something Real 🚀",
      availability: "Coming Soon",
      priority: 3,
      remixes: [
        "Remix 1: Research the no rules composting and help make community composting network a system more communities can easily adopt",
        "Remix 2: Prototype an advocacy group to promote empathy and respect so others can share it with the world",
        "Remix 3: Help execute or support a Community Connectivity Hub in your area",
        "Remix 4: Measure what happened when your community inventoried underutilized resources and dd the results to TUC’s CloserLook",
      ],
    },
    {
      title: "Join one of the steering committes",
      availability: "Coming Soon",
      priority: 3,
      remixes: [
        "Remix 1: wordsmithing is your thing? Join the writers corner and review copy in the 20 years of TUC documents",
        "Remix 2: Review and organize TUC financial documents which look more like notes",
        "Remix 3: Review an idea or proposal for how TUC will become a legal entity one day",
      ],
    },
    {
      title: "Golden Tickets 🎟️",
      availability: "Coming Soon",
      priority: 3,
      remixes: [
        "Remix 1: Engage to find a Golden Ticket",
        "Remix 2: Sponsor a Golden Ticket",
        "Remix 3: Suggest a Golden Ticket reward",
        "Remix 4: Create a Golden Ticket challenge",
      ],
    },
    {
      title: "Buy, Promote, or Remix a YesWeCan Design 👕",
      availability: "Coming Soon",
      priority: 3,
      remixes: [
        "Remix 1: Buy a t-shirt with a YesWeCan design",
        "Remix 2: Promote or start a design challenge",
        "Remix 3: Create a new revenue stream for the YesWeCan designs",
      ],
    },
    {
      title: "Help Create or Run a Challenge 🏆",
      availability: "Coming Soon",
      priority: 3,
      remixes: [
        "Remix 1: Suggest a challenge in your Community that is about to start in TUC.",
        "Remix 2: Help organize or run a puppet parade to brighten up your event",
        "Remix 3: Review submissions about Top10 Contests to ensure they are developed well enough to get the sponsors they need to reach their full potential",
      ],
    },
    {
      title: "Sponsor Something 💰",
      availability: "Coming Soon",
      priority: 3,
      remixes: [
        "Remix 1: Sponsor an Top10 Contest",
        "Remix 2: Sponsor a project overcoming the challenge of not having food security",
        "Remix 3: Sponsor a pilot project inspired by your previous efforts to build a self reliant community",
        "Remix 4: Donate a needed resource to the local Library of things or tool library",
      ],
    },
    {
      title: "Create Another Way to Engage ➕",
      availability: "Active",
      priority: 3,
      remixes: [
        "Remix 1: Improve, sponsor, remix one of these ways",
        "Remix 2: Create something we haven't thought of yet and add it to the suggestion box to be executed by other around the world",
      ],
    },
  ];

  const priorities = [
    { id: 1, title: "Priority 1 — Immediate Ways to Engage" },
    { id: 2, title: "Priority 2 — Additional Ways to Participate" },
    { id: 3, title: "Priority 3 — Developing and Specialized Opportunities" },
  ];

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
              Top10: Ways to Engage in TUC
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 pt-4">
            <div className="space-y-3 md:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Idea</h2>
              <p className="text-xl font-medium leading-relaxed">
                This is a static version of TUC’s already designed, built, and tested dynamic Top10 system, with a live POC in POC2. The system still needs to be properly addressed from an IP-protection perspective. If that’s your thing, there’s another way to engage. 🧩
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Purpose</h2>
              <p className="text-xl font-medium leading-relaxed">
                Make it easy for anyone to find a way to engage that fits their interests, skills, resources, or available time.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assumptions</h2>
              <ul className="text-lg font-medium leading-relaxed list-disc pl-5 space-y-2 opacity-90">
                <li>A fully functional dynamic Top10 would be much better here. This static version will have to do for now.</li>
                <li>This list is incomplete and expected to improve.</li>
                <li>The Remixes are examples, not limits.</li>
                <li>Some of the best ways to engage probably haven&apos;t been identified yet.</li>
                <li>You don&apos;t need to understand all of TUC to contribute something useful.</li>
              </ul>
            </div>
          </div>
        </header>

        <section className="space-y-20 mb-20">
          {priorities.map((priority) => (
            <div key={priority.id} className="space-y-10">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter border-b-2 border-foreground/5 pb-4">
                {priority.title}
              </h2>
              <div className="grid gap-12">
                {engagementWays
                  .filter((item) => item.priority === priority.id)
                  .map((item, index) => {
                    // Calculate global index for numbering
                    const globalIndex = engagementWays.findIndex(ew => ew.title === item.title) + 1;
                    return (
                      <div key={index} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="text-2xl font-black text-muted-foreground/30 tabular-nums pt-0.5 shrink-0">
                            {globalIndex.toString().padStart(2, '0')}
                          </span>
                          <div className="space-y-1">
                            <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                              Status: {item.availability}
                            </p>
                          </div>
                        </div>
                        <div className="pl-12 space-y-3">
                          {item.remixes.map((remix, rIndex) => (
                            <p
                              key={rIndex}
                              className="text-muted-foreground font-medium leading-relaxed border-l-2 border-foreground/5 pl-4 py-1"
                            >
                              {remix}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>

        <footer className="space-y-12 text-center pt-8 border-t border-foreground/10">
          <div className="flex flex-col items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-4xl hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                  aria-label="Explore TUC Through Top10s"
                >
                  🧩
                </button>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="sm:max-w-md bg-background border-foreground/10"
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-left">
                    Top10 Ways to Better Understand TUC
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  {top10Lists.map((list, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-colors text-left group"
                    >
                      <span className="font-bold tracking-tight">
                        {i + 1}. {list}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 p-4 text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Suggest another Top10
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Explore TUC Through Top10s
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              type="button"
              size="lg"
              className="group h-16 px-8 text-lg font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95"
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSfAliHmLu4qnbGVGoNC_YRnnqGPL-RXKjAlM2SE9ky4bVLl4A/viewform?usp=dialog", "_blank", "noopener,noreferrer")}
            >
              Make a Suggestion
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-16 px-8 text-lg font-bold tracking-tight hover:bg-transparent hover:underline underline-offset-8"
              onClick={() => {
                router.push("/");
                window.scrollTo(0, 0);
              }}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              BACK TO TUC
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default StaticTop10POC;
