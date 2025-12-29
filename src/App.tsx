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
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ResetPassword from "./pages/ResetPassword";
import SOAPGame from "./pages/SOAPGame";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { WordsProvider } from "@/context/WordsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dictionary from "@/pages/Dictionary";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WordsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/FlashCards" element={
                    <ProtectedRoute>
                      <FlashCards />
                    </ProtectedRoute>
                  } />
                  <Route path="/Quiz" element={<Quiz />} />
                  <Route path="/TypingGame" element={<TypingGame />} />
                  <Route path="/SOAPGame" element={<SOAPGame />} />
                  <Route path="/MatchingGame" element={
                    <ProtectedRoute>
                      <MatchingGame />
                    </ProtectedRoute>
                  } />
                  <Route path="/Dictionary" element={
                    <ProtectedRoute>
                      <Dictionary />
                    </ProtectedRoute>
                  } />
                  <Route path="/Learning" element={
                    <ProtectedRoute>
                      <Learning />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/ContactUs" element={<ContactUs />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WordsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
