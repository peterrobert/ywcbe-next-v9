import type { Metadata } from "next";
import type { ReactNode } from "react";

const description =
  "Specific, actionable opportunities to help TUC and existing efforts reach their full potential.";

export const metadata: Metadata = {
  title: "OpenItems",
  description,
  openGraph: { title: "OpenItems | TUC", description },
};

const OpenItemsLayout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default OpenItemsLayout;
