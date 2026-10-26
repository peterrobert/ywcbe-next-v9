import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BlackHandOverview from "./pages/BlackHandOverview";
import EarthGlobeOverview from "./pages/EarthGlobeOverview";
import YellowStickyNoteOverview from "./pages/YellowStickyNoteOverview";
import RedFlagOverview from "./pages/RedFlagOverview";
import CrumpledPaperOverview from "./pages/CrumpledPaperOverview";
import CloserLookWorkspace from "./pages/CloserLookWorkspace";
import StaticTop10POC from "./pages/StaticTop10POC";
import StaticSurveyPOC from "./pages/StaticSurveyPOC";
import OpenItems from "./pages/OpenItems";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/black-hand" element={<BlackHandOverview />} />
          <Route path="/earth-globe" element={<EarthGlobeOverview />} />
          <Route path="/yellow-sticky-note" element={<YellowStickyNoteOverview />} />
          <Route path="/red-flag" element={<RedFlagOverview />} />
          <Route path="/crumpled-paper" element={<CrumpledPaperOverview />} />
          <Route path="/closerlook" element={<CloserLookWorkspace />} />
          <Route path="/top10-poc" element={<StaticTop10POC />} />
          <Route path="/survey-poc" element={<StaticSurveyPOC />} />
          <Route path="/open-items" element={<OpenItems />} />
          {/* Add other routes here */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;