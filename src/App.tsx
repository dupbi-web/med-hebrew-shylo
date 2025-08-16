import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FlashCards from "./pages/FlashCards";
import Quiz from "./pages/Quiz";
import TypingGame from "./pages/TypingGame";
import MatchingGame from "./pages/MatchingGame";
import Learning from "./pages/Learning";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes >
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/FlashCards" element={<FlashCards />} />
              <Route path="/Quiz" element={<Quiz />} />
              <Route path="/TypingGame" element={<TypingGame />} />
              <Route path="/MatchingGame" element={<MatchingGame />} />
              <Route path="/Learning" element={<Learning />} />
              <Route path="/ContactUs" element={<ContactUs />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
