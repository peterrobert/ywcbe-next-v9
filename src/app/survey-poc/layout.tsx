import type { Metadata } from "next";
import type { ReactNode } from "react";

const description =
  "No tests. No wrong answers. No pressure. Share what you understand, notice, question, and believe could be better.";

export const metadata: Metadata = {
  title: "WTF is TUC? Survey",
  description,
  openGraph: { title: "WTF is TUC? Survey | TUC", description },
};

const SurveyLayout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default SurveyLayout;
