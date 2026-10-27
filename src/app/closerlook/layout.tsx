import type { Metadata } from "next";
import type { ReactNode } from "react";

const description =
  "Deeper information, one click away. Explore perspectives on TUC and the documents behind the idea.";

export const metadata: Metadata = {
  title: "CloserLook@",
  description,
  openGraph: { title: "CloserLook@ | TUC", description },
};

const CloserLookLayout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default CloserLookLayout;
