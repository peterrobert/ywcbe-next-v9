import type { Metadata } from "next";
import LandingPage from "@/components/next/LandingPage";

const description =
  "TUC (The Ultimate Collaboration) connects people, ideas, knowledge, and resources so existing efforts can build on what already works. Explore what TUC is and how to take part.";

export const metadata: Metadata = {
  description,
  openGraph: {
    type: "website",
    siteName: "TUC — The Ultimate Collaboration",
    title: "TUC — The Ultimate Collaboration",
    description,
  },
};

const Page = () => {
  return <LandingPage />;
};

export default Page;
