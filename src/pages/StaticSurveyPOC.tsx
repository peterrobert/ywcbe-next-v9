import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, HelpCircle, Heart, Share2, MessageSquare, User, Mail, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import TucSkipNav from "@/components/TucSkipNav";
import { cn } from "@/lib/utils";

const PASS_OPTION = "PASS 🧩 (Maybe I'll answer next time!)";

const StaticSurveyPOC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [q1History, setQ1History] = useState<string[]>([]);
  const [q1Other, setQ1Other] = useState("");
  const [q1CompletedBefore, setQ1CompletedBefore] = useState("");

  const [q2Connect, setQ2Connect] = useState<string[]>([]);
  const [q2Other, setQ2Other] = useState("");

  const [q3Sparked, setQ3Sparked] = useState("");
  const [q3Explanation, setQ3Explanation] = useState("");

  const [q4Understanding, setQ4Understanding] = useState("");
  const [q4Other, setQ4Other] = useState("");

  const [q5StandsOut, setQ5StandsOut] = useState<string[]>([]);
  const [q5Other, setQ5Other] = useState("");

  const [q6EngagedSoFar, setQ6EngagedSoFar] = useState<string[]>([]);
  const [q6Other, setQ6Other] = useState("");

  const [q7FutureInterests, setQ7FutureInterests] = useState<string[]>([]);
  const [q7Other, setQ7Other] = useState("");
  const [q7ImagineEngaging, setQ7ImagineEngaging] = useState("");

  const [q8PerspectiveChange, setQ8PerspectiveChange] = useState<string[]>([]);
  const [q8Other, setQ8Other] = useState("");

  const [q9EasterEggs, setQ9EasterEggs] = useState("");
  const [q9Details, setQ9Details] = useState("");

  const [q10Puzzle, setQ10Puzzle] = useState("");
  const [q10Interpretation, setQ10Interpretation] = useState("");

  const [q11Mind, setQ11Mind] = useState("");
  const [q12Question, setQ12Question] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [followUp, setFollowUp] = useState("");

  const handleBackToTuc = () => {
    window.scrollTo(0, 0);
    navigate("/");
  };

  const toggleMultiSelect = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (value === PASS_OPTION) {
      setter([PASS_OPTION]);
      return;
    }
    const filtered = current.filter(v => v !== PASS_OPTION);
    if (filtered.includes(value)) {
      setter(filtered.filter(v => v !== value));
    } else {
      setter([...filtered, value]);
    }
  };

  const getPassedQuestions = () => {
    const passed: string[] = [];
    if (q1History.includes(PASS_OPTION)) passed.push("Q1 History");
    if (q1CompletedBefore === PASS_OPTION) passed.push("Q1 Completed Before");
    if (q2Connect.includes(PASS_OPTION)) passed.push("Q2 First Connection");
    if (q3Sparked === PASS_OPTION) passed.push("Q3 Sparked Interest");
    if (q4Understanding === PASS_OPTION) passed.push("Q4 Understanding");
    if (q5StandsOut.includes(PASS_OPTION)) passed.push("Q5 Stands Out");
    if (q6EngagedSoFar.includes(PASS_OPTION)) passed.push("Q6 Engaged So Far");
    if (q7FutureInterests.includes(PASS_OPTION)) passed.push("Q7 Future Interests");
    if (q7ImagineEngaging === PASS_OPTION) passed.push("Q7 Imagine Engaging");
    if (q8PerspectiveChange.includes(PASS_OPTION)) passed.push("Q8 Perspective Change");
    if (q9EasterEggs === PASS_OPTION) passed.push("Q9 Easter Eggs");
    if (q10Puzzle === PASS_OPTION) passed.push("Q10 Puzzle Meaning");
    if (q11Mind === PASS_OPTION) passed.push("Q11 Mind");
    if (q12Question === PASS_OPTION) passed.push("Q12 Question");
    if (followUp === PASS_OPTION) passed.push("Follow-up");
    return passed.join(", ");
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSuccess) return;
    setIsSubmitting(true);

    try {
      const responseId = `TUC-SRV-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const payload = {
        type: "TUC_SURVEY_SUBMISSION",
        responseId,
        submittedAt: new Date().toISOString(),
        name,
        email,
        surveyVersion: "FINAL-2026-10-24",
        q1History: [...q1History, q1Other].filter(Boolean).join(", "),
        q1CompletedBefore,
        q2FirstConnection: [...q2Connect, q2Other].filter(Boolean).join(", "),
        q3CuriositySparked: q3Sparked,
        q3Explanation,
        q4UnderstandingTuc: [q4Understanding, q4Other].filter(Boolean).join(", "),
        q5WhatStandsOut: [...q5StandsOut, q5Other].filter(Boolean).join(", "),
        q6ActualEngagement: [...q6EngagedSoFar, q6Other].filter(Boolean).join(", "),
        q7FutureInterests: [...q7FutureInterests, q7Other].filter(Boolean).join(", "),
        q7ImagineEngaging,
        q8PerspectiveChange: [...q8PerspectiveChange, q8Other].filter(Boolean).join(", "),
        q9EasterEggsNoticed: q9EasterEggs,
        q9Details,
        q10PuzzleMeaning: q10Puzzle,
        q10Interpretation,
        q11Mind,
        q12Question,
        questionsPassed: getPassedQuestions(),
        followUpPermission: followUp
      };

      /**
       * AUTHORITATIVE SUBMISSION PATH:
       * Submits directly to the Google Apps Script Web App.
       * mode: 'no-cors' ensures the request is sent even if
       * the browser cannot read the redirect response.
       */
      const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk7HYTI1W8wDBcnoEzckS8lOoZFq8xd9UCqVsJesbzHVmsK4-50-pcGxavxvDp2W9ZvQ/exec";

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      // SUCCESS: Since no-cors prevents confirmation, we assume success
      // if no network error occurred.
      setIsSuccess(true);
      toast({
        title: "Survey Submitted!",
        description: "Thanks for helping TUC get better!",
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error("Submission Failure:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Something went wrong. Your answers are safe—please try again.",
        variant: "destructive",
      });
      // isSuccess remains false, so answers are preserved in state
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <CheckCircle2 className="w-20 h-20 text-primary animate-bounce" />
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            SUBMIT MY TWO CENTS!
          </h1>
          <h3 className="text-2xl font-bold">Thanks for helping TUC get better!</h3>
          <div className="text-lg text-muted-foreground space-y-4 leading-relaxed font-medium">
            <p>Didn't answer everything? No worries.</p>
            <p>Whether this is your first encounter or you've been part of the journey for years, there's always something more to discover, improve, or connect.</p>
            <p>Come back anytime. Your next visit might change your perspective—or ours.</p>
            <p className="text-foreground font-bold">One contribution can become the starting point for many more.</p>
            <p className="text-primary font-black tracking-widest uppercase">#itsotuc</p>
          </div>
        </div>
        <Button size="lg" onClick={handleBackToTuc} className="h-16 px-12 text-lg font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95">
          BACK TO TUC
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <TucSkipNav />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-16 space-y-6 border-b-4 border-foreground pb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-2">
              WTF is TUC? ❓
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight opacity-70">
              A TUC Survey … #itsotuc
            </h3>
            <div className="text-xs font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 rounded-full w-fit">
              Final Approved Version
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <p className="text-2xl font-black italic tracking-tight border-l-4 border-primary pl-6">
              No tests. No wrong answers. No pressure.
            </p>
            <div className="text-xl font-medium leading-relaxed max-w-2xl text-muted-foreground">
              <p>Whether you just discovered TUC, have followed its evolution from YesWeCan, or helped build it over the years, your perspective matters.</p>
              <p>We're interested in what you understand, notice, question, discover, and believe could be better.</p>
              <p className="mt-4 text-foreground font-bold">Answer anything. Pass on anything. Come back anytime.</p>
            </div>
          </div>
        </header>

        {/* Part 1 */}
        <section className="space-y-16 mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-500/10 text-orange-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Part 1 — Your TUC Experience</h2>
          </div>

          <div className="space-y-20">
            {/* Q1 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                  1. What's your history with TUC? 👋
                </h3>
                <p className="text-muted-foreground italic font-medium">Choose as many as apply.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Just discovered it", icon: "🆕" },
                  { label: "I've known about it for a while", icon: "👀" },
                  { label: "I've explored or followed its development", icon: "🧩" },
                  { label: "I've helped test, build, or improve it", icon: "🛠️" },
                  { label: "I've participated in TUC projects or initiatives", icon: "🤝" },
                  { label: "I'm returning to see what's changed", icon: "🔄" },
                ].map((opt) => (
                  <div key={opt.label}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q1History.includes(opt.label) ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => toggleMultiSelect(opt.label, q1History, setQ1History)}
                  >
                    <Checkbox checked={q1History.includes(opt.label)} className="w-6 h-6" />
                    <span className="mr-2 text-xl">{opt.icon}</span>
                    <Label className="text-lg font-bold cursor-pointer flex-1">{opt.label}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5 sm:col-span-2">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input
                    value={q1Other}
                    onChange={e => setQ1Other(e.target.value)}
                    placeholder="..."
                    className="border-none bg-foreground/5 text-lg"
                  />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer sm:col-span-2",
                    q1History.includes(PASS_OPTION) ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ1History([PASS_OPTION])}
                >
                  <Checkbox checked={q1History.includes(PASS_OPTION)} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <Label className="text-xl font-bold uppercase tracking-tight">Have you completed this survey before?</Label>
                <RadioGroup value={q1CompletedBefore} onValueChange={setQ1CompletedBefore} className="grid sm:grid-cols-4 gap-4">
                  {["Yes", "No", "Not sure", PASS_OPTION].map(opt => (
                    <div key={opt} className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                      q1CompletedBefore === opt ? "border-primary bg-primary/5" : "border-foreground/5"
                    )} onClick={() => setQ1CompletedBefore(opt)}>
                      <RadioGroupItem value={opt} id={`q1-comp-${opt}`} />
                      <Label htmlFor={`q1-comp-${opt}`} className={cn("font-bold cursor-pointer", opt === PASS_OPTION && "text-sm italic text-muted-foreground")}>
                        {opt === PASS_OPTION ? "PASS 🧩" : opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                  2. How did you first connect with TUC? 🔎
                </h3>
                <p className="text-muted-foreground italic font-medium">Choose as many as apply.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Someone introduced me to TUC",
                  "I've known about TUC since the YesWeCan days",
                  "I've helped develop, build, or test TUC",
                  "I've participated in a TUC project or initiative",
                  "Someone shared a link or post",
                  "I discovered TUC through social media",
                  "I found TUC through an online search",
                  "I stumbled across it",
                  "I don't remember"
                ].map((opt) => (
                  <div key={opt}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q2Connect.includes(opt) ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => toggleMultiSelect(opt, q2Connect, setQ2Connect)}
                  >
                    <Checkbox checked={q2Connect.includes(opt)} className="w-6 h-6" />
                    <Label className="text-lg font-bold cursor-pointer flex-1">{opt}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5 sm:col-span-2">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input value={q2Other} onChange={e => setQ2Other(e.target.value)} placeholder="..." className="border-none bg-foreground/5 text-lg" />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer sm:col-span-2",
                    q2Connect.includes(PASS_OPTION) ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ2Connect([PASS_OPTION])}
                >
                  <Checkbox checked={q2Connect.includes(PASS_OPTION)} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>
            </div>

            {/* Q3 */}
            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                3. Has anything sparked or renewed your curiosity? 🔥
              </h3>
              <RadioGroup value={q3Sparked} onValueChange={setQ3Sparked} className="grid sm:grid-cols-4 gap-4">
                {["Yes", "Maybe", "No", "Not sure yet", PASS_OPTION].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                    q3Sparked === opt ? "border-primary bg-primary/5" : "border-foreground/5"
                  )} onClick={() => setQ3Sparked(opt)}>
                    <RadioGroupItem value={opt} id={`q3-${opt}`} />
                    <Label htmlFor={`q3-${opt}`} className={cn("font-bold cursor-pointer", opt === PASS_OPTION && "text-sm italic text-muted-foreground")}>
                      {opt === PASS_OPTION ? "PASS 🧩" : opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="space-y-4">
                <Label className="text-xl font-bold italic opacity-70">Optional: What caught or renewed your interest?</Label>
                <Textarea
                  value={q3Explanation}
                  onChange={e => setQ3Explanation(e.target.value)}
                  placeholder="..."
                  className="bg-foreground/5 border-none min-h-[100px] text-lg p-6"
                />
              </div>
            </div>

            {/* Q4 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3 text-primary">
                  4. So… WTF is TUC? ❓
                </h3>
                <p className="text-muted-foreground italic font-medium">Where are you in understanding TUC today?</p>
              </div>
              <RadioGroup value={q4Understanding} onValueChange={setQ4Understanding} className="grid gap-3">
                {[
                  { label: "I understand the vision and how it works", icon: "💡" },
                  { label: "I understand the vision but I'm still connecting the pieces", icon: "🧩" },
                  { label: "I know certain parts of TUC well", icon: "🔎" },
                  { label: "I'm still learning", icon: "🤔" },
                  { label: "WTF is TUC?", icon: "❓" },
                ].map((opt) => (
                  <div key={opt.label}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q4Understanding === opt.label ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => setQ4Understanding(opt.label)}
                  >
                    <RadioGroupItem value={opt.label} id={`q4-${opt.label}`} />
                    <span className="mx-2 text-xl">{opt.icon}</span>
                    <Label htmlFor={`q4-${opt.label}`} className="text-lg font-bold cursor-pointer flex-1">{opt.label}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input value={q4Other} onChange={e => setQ4Other(e.target.value)} placeholder="..." className="border-none bg-foreground/5 text-lg" />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    q4Understanding === PASS_OPTION ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ4Understanding(PASS_OPTION)}
                >
                  <RadioGroupItem value={PASS_OPTION} id="q4-pass" />
                  <Label htmlFor="q4-pass" className="text-lg font-bold cursor-pointer italic text-muted-foreground ml-3">{PASS_OPTION}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Q5 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                  5. What stands out to you? 👀
                </h3>
                <p className="text-muted-foreground italic font-medium">Choose as many as you like.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "TUC's overall vision and purpose",
                  "Connecting underutilized people, ideas, knowledge, and resources",
                  "2% Spare Bandwidth",
                  "Red Flags 🚩",
                  "Suggestion Box 🧩",
                  "Top10",
                  "CloserLook@",
                  "Practical Learning",
                  "Projects and opportunities",
                  "Something that's changed or improved",
                  "Nothing in particular yet"
                ].map((opt) => (
                  <div key={opt}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q5StandsOut.includes(opt) ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => toggleMultiSelect(opt, q5StandsOut, setQ5StandsOut)}
                  >
                    <Checkbox checked={q5StandsOut.includes(opt)} className="w-6 h-6" />
                    <Label className="text-lg font-bold cursor-pointer flex-1">{opt}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5 sm:col-span-2">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input value={q5Other} onChange={e => setQ5Other(e.target.value)} placeholder="..." className="border-none bg-foreground/5 text-lg" />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer sm:col-span-2",
                    q5StandsOut.includes(PASS_OPTION) ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ5StandsOut([PASS_OPTION])}
                >
                  <Checkbox checked={q5StandsOut.includes(PASS_OPTION)} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Part 2 */}
        <section className="space-y-16 mb-24 pt-16 border-t-4 border-foreground/10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-lg">
            <Share2 className="w-5 h-5" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Part 2 — Connections & Possibilities</h2>
          </div>

          <div className="space-y-20">
            {/* Q6 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight">
                  6. How have you engaged with TUC so far?
                </h3>
                <p className="text-muted-foreground italic font-medium">Choose as many as apply. We're interested in actual participation, whether yesterday or years ago.</p>
              </div>
              <div className="grid gap-3">
                {[
                  "Explored the website or TUC documents",
                  "Shared TUC with others",
                  "Discussed TUC with someone",
                  "Shared ideas, suggestions, or feedback",
                  "Helped develop, build, or test something",
                  "Participated in a project or initiative",
                  "Connected TUC with people, ideas, or resources",
                  "Applied something learned through TUC",
                  "Haven't engaged beyond exploring yet"
                ].map((opt) => (
                  <div key={opt}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q6EngagedSoFar.includes(opt) ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => toggleMultiSelect(opt, q6EngagedSoFar, setQ6EngagedSoFar)}
                  >
                    <Checkbox checked={q6EngagedSoFar.includes(opt)} className="w-6 h-6" />
                    <Label className="text-lg font-bold cursor-pointer flex-1">{opt}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input value={q6Other} onChange={e => setQ6Other(e.target.value)} placeholder="..." className="border-none bg-foreground/5 text-lg" />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    q6EngagedSoFar.includes(PASS_OPTION) ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ6EngagedSoFar([PASS_OPTION])}
                >
                  <Checkbox checked={q6EngagedSoFar.includes(PASS_OPTION)} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>
            </div>

            {/* Q7 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                  7. What interests you about engaging with TUC going forward? 🚀
                </h3>
                <p className="text-muted-foreground italic font-medium">Choose as many as apply. No commitment required.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Sharing ideas or suggestions", icon: "🧩" },
                  { label: "Identifying problems or opportunities", icon: "🚩" },
                  { label: "Sharing knowledge or answering questions", icon: "💬" },
                  { label: "Testing or improving something", icon: "🧪" },
                  { label: "Remixing existing ideas", icon: "🔄" },
                  { label: "Sharing skills or resources", icon: "🛠️" },
                  { label: "Connecting people, ideas, or resources", icon: "🔗" },
                  { label: "Exploring or supporting projects", icon: "🌍" },
                  { label: "Continuing something I'm already involved in", icon: "🤝" },
                  { label: "Just exploring for now", icon: "👀" },
                  { label: "Nothing at this time", icon: "" }
                ].map((opt) => (
                  <div key={opt.label}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q7FutureInterests.includes(opt.label) ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => toggleMultiSelect(opt.label, q7FutureInterests, setQ7FutureInterests)}
                  >
                    <Checkbox checked={q7FutureInterests.includes(opt.label)} className="w-6 h-6" />
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    <Label className="text-lg font-bold cursor-pointer flex-1">{opt.label}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5 sm:col-span-2">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input value={q7Other} onChange={e => setQ7Other(e.target.value)} placeholder="..." className="border-none bg-foreground/5 text-lg" />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer sm:col-span-2",
                    q7FutureInterests.includes(PASS_OPTION) ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ7FutureInterests([PASS_OPTION])}
                >
                  <Checkbox checked={q7FutureInterests.includes(PASS_OPTION)} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>

              <div className="pt-12 space-y-4">
                <Label className="text-2xl font-black uppercase tracking-tight">Could you imagine yourself engaging or continuing to engage with TUC?</Label>
                <RadioGroup value={q7ImagineEngaging} onValueChange={setQ7ImagineEngaging} className="grid sm:grid-cols-5 gap-4">
                  {["Yes", "Maybe", "No", "Not sure yet", PASS_OPTION].map(opt => (
                    <div key={opt} className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                      q7ImagineEngaging === opt ? "border-primary bg-primary/5" : "border-foreground/5"
                    )} onClick={() => setQ7ImagineEngaging(opt)}>
                      <RadioGroupItem value={opt} id={`q7-imag-${opt}`} />
                      <Label htmlFor={`q7-imag-${opt}`} className={cn("font-bold cursor-pointer", opt === PASS_OPTION && "text-sm italic text-muted-foreground")}>
                        {opt === PASS_OPTION ? "PASS 🧩" : opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Q8 */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                  8. What's changed in your perspective on TUC? 🔄
                </h3>
                <p className="text-muted-foreground italic font-medium">Think about your first encounter, your last visit, or your last survey.</p>
              </div>
              <div className="grid gap-3">
                {[
                  { label: "I understand TUC better", icon: "💡" },
                  { label: "I've discovered something new", icon: "🔎" },
                  { label: "I'm more interested", icon: "🔥" },
                  { label: "I'm less interested", icon: "🤔" },
                  { label: "I've identified something that needs improvement", icon: "🚩" },
                  { label: "I've seen meaningful progress", icon: "🛠️" },
                  { label: "I'm still waiting to see meaningful progress", icon: "⏳" },
                  { label: "Nothing significant has changed", icon: "😐" },
                  { label: "I'm too new to say", icon: "" }
                ].map((opt) => (
                  <div key={opt.label}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      q8PerspectiveChange.includes(opt.label) ? "border-primary bg-primary/5" : "border-foreground/5 hover:border-foreground/20"
                    )}
                    onClick={() => toggleMultiSelect(opt.label, q8PerspectiveChange, setQ8PerspectiveChange)}
                  >
                    <Checkbox checked={q8PerspectiveChange.includes(opt.label)} className="w-6 h-6" />
                    {opt.icon && <span className="mx-2 text-xl">{opt.icon}</span>}
                    <Label className="text-lg font-bold cursor-pointer flex-1">{opt.label}</Label>
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-foreground/5">
                  <Label className="text-lg font-bold">Something else:</Label>
                  <Input value={q8Other} onChange={e => setQ8Other(e.target.value)} placeholder="..." className="border-none bg-foreground/5 text-lg" />
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    q8PerspectiveChange.includes(PASS_OPTION) ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ8PerspectiveChange([PASS_OPTION])}
                >
                  <Checkbox checked={q8PerspectiveChange.includes(PASS_OPTION)} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Part 3 */}
        <section className="space-y-16 mb-24 pt-16 border-t-4 border-foreground/10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-lg">
            <Heart className="w-5 h-5" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Part 3 — Connecting the Dots</h2>
          </div>
          <p className="text-muted-foreground italic font-medium">Optional: A little something for the curious.</p>

          <div className="space-y-20">
            {/* Q9 */}
            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                9. Have you noticed any 🥚 Easter eggs, hidden connections, or unexpected details?
              </h3>
              <RadioGroup value={q9EasterEggs} onValueChange={setQ9EasterEggs} className="grid sm:grid-cols-5 gap-4">
                {["Yes", "Maybe", "No", "Wait… what Easter eggs? 😄", PASS_OPTION].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                    q9EasterEggs === opt ? "border-primary bg-primary/5" : "border-foreground/5"
                  )} onClick={() => setQ9EasterEggs(opt)}>
                    <RadioGroupItem value={opt} id={`q9-${opt}`} />
                    <Label htmlFor={`q9-${opt}`} className={cn("font-bold cursor-pointer", opt === PASS_OPTION && "text-sm italic text-muted-foreground")}>
                      {opt === PASS_OPTION ? "PASS 🧩" : opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="space-y-4">
                <Label className="text-xl font-bold italic opacity-70">Optional: What did you notice?</Label>
                <Textarea value={q9Details} onChange={e => setQ9Details(e.target.value)} placeholder="..." className="bg-foreground/5 border-none min-h-[100px] text-lg p-6" />
              </div>
            </div>

            {/* Q10 */}
            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-black leading-tight flex items-center gap-3">
                10. What do you think “…… 🧩 ……” means?
              </h3>
              <RadioGroup value={q10Puzzle} onValueChange={setQ10Puzzle} className="grid sm:grid-cols-4 gap-4">
                {[
                  { label: "I think I've connected the dots!", icon: "💡" },
                  { label: "I have a theory", icon: "🤔" },
                  { label: "No idea yet", icon: "❓" },
                  { label: PASS_OPTION, icon: "" }
                ].map(opt => (
                  <div key={opt.label} className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                    q10Puzzle === opt.label ? "border-primary bg-primary/5" : "border-foreground/5"
                  )} onClick={() => setQ10Puzzle(opt.label)}>
                    <RadioGroupItem value={opt.label} id={`q10-${opt.label}`} />
                    <Label htmlFor={`q10-${opt.label}`} className={cn("font-bold cursor-pointer flex flex-col", opt.label === PASS_OPTION && "text-sm italic text-muted-foreground")}>
                      {opt.icon && <span className="text-xl mb-1">{opt.icon}</span>}
                      {opt.label === PASS_OPTION ? "PASS 🧩" : opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="space-y-4">
                <Label className="text-xl font-bold italic opacity-70">Optional: What's your interpretation?</Label>
                <Textarea value={q10Interpretation} onChange={e => setQ10Interpretation(e.target.value)} placeholder="..." className="bg-foreground/5 border-none min-h-[100px] text-lg p-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Part 4 */}
        <section className="space-y-16 mb-24 pt-16 border-t-4 border-foreground/10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/10 text-red-600 rounded-lg">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Part 4 — Your Two Cents</h2>
          </div>

          <div className="space-y-20">
            {/* Q11 */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black leading-tight">
                  11. What's on your mind?
                </h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
                  Something confusing? Brilliant? Ridiculous? Missing? Worth exploring? Something that could be better—or something we absolutely shouldn't change?
                </p>
                <p className="text-muted-foreground font-medium text-lg italic">
                  Perhaps an idea from years ago that deserves another look.
                </p>
              </div>
              <div className="space-y-4">
                <Label className="text-xl font-bold">Your thoughts:</Label>
                <Textarea value={q11Mind} onChange={e => setQ11Mind(e.target.value)} placeholder="..." className="bg-foreground/5 border-none min-h-[200px] text-lg p-6" />
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer w-fit",
                    q11Mind === PASS_OPTION ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ11Mind(q11Mind === PASS_OPTION ? "" : PASS_OPTION)}
                >
                  <Checkbox checked={q11Mind === PASS_OPTION} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>
            </div>

            {/* Q12 */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black leading-tight">
                  12. What question should we have asked?
                </h3>
                <p className="text-muted-foreground font-medium text-lg italic">
                  *Sometimes the best question is the one nobody thought to ask.*
                </p>
              </div>
              <div className="space-y-4">
                <Label className="text-xl font-bold">Your question:</Label>
                <Textarea value={q12Question} onChange={e => setQ12Question(e.target.value)} placeholder="..." className="bg-foreground/5 border-none min-h-[150px] text-lg p-6" />
                <div
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer w-fit",
                    q12Question === PASS_OPTION ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-foreground/20"
                  )}
                  onClick={() => setQ12Question(q12Question === PASS_OPTION ? "" : PASS_OPTION)}
                >
                  <Checkbox checked={q12Question === PASS_OPTION} className="w-6 h-6" />
                  <Label className="text-lg font-bold cursor-pointer italic text-muted-foreground">{PASS_OPTION}</Label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Connected */}
        <section className="space-y-16 mb-24 pt-16 border-t-4 border-foreground">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-foreground text-background rounded-lg">
            <User className="w-5 h-5" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Optional — Stay Connected</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5" /> Name:
              </Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Esther..." className="bg-foreground/5 border-none h-14 text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5" /> Email:
              </Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="esther@tuc.org..." className="bg-foreground/5 border-none h-14 text-lg" />
            </div>
            <div className="sm:col-span-2 space-y-6 pt-4">
              <Label className="text-2xl font-black uppercase tracking-tight">May we follow up?</Label>
              <RadioGroup value={followUp} onValueChange={setFollowUp} className="grid sm:grid-cols-3 gap-4">
                {["Yes", "No", PASS_OPTION].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                    followUp === opt ? "border-primary bg-primary/5" : "border-foreground/5"
                  )} onClick={() => setFollowUp(opt)}>
                    <RadioGroupItem value={opt} id={`follow-${opt}`} />
                    <Label htmlFor={`follow-${opt}`} className={cn("font-bold cursor-pointer", opt === PASS_OPTION && "text-sm italic text-muted-foreground")}>
                      {opt === PASS_OPTION ? "PASS 🧩" : opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-sm text-muted-foreground italic leading-relaxed pt-4 border-t border-foreground/5">
                *You can remain anonymous. Sharing your contact information doesn't subscribe you to anything, and follow-up isn't guaranteed.*
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-12 pb-20">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-24 text-2xl md:text-4xl font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                SUBMITTING...
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 group-hover:animate-pulse" />
                SUBMIT MY TWO CENTS!
              </>
            )}
          </Button>

          <footer className="pt-12 border-t border-foreground/10 flex flex-col items-center gap-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold uppercase tracking-tight">Thanks for helping TUC get better!</h3>
              <p className="text-muted-foreground font-medium italic">#itsotuc</p>
            </div>
            <Button
              variant="ghost"
              size="lg"
              className="h-16 px-8 text-lg font-bold tracking-tight hover:bg-transparent hover:underline underline-offset-8"
              onClick={handleBackToTuc}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              BACK TO TUC
            </Button>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default StaticSurveyPOC;