import type { Metadata } from "next";
import type { ReactNode } from "react";

const description =
  "Seventeen ways to engage in TUC, grouped into the priorities behind the work, with a static view of the Top10 engagement system.";

export const metadata: Metadata = {
  title: "Top10: Ways to Engage",
  description,
  openGraph: { title: "Top10: Ways to Engage | TUC", description },
};

const Top10Layout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default Top10Layout;
