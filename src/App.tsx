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
import Home from "./pages/Home"; // protected home (registered users)
import PublicHome from "./pages/public/Home";
import PublicContactUs from "./pages/public/ContactUs";
import PublicQuiz from "./pages/public/Quiz";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Dictionary from "@/pages/Dictionary";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PublicAbout from "./pages/public/About";
import CompleteProfile from "./pages/CompleteProfile";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { WordsProvider } from "@/context/WordsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <WordsProvider> {/* ADD THIS - Wrap everything that needs words context */}
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                <Route element={<Layout />}>
                    {/* <Route index element={<Home />} /> */}
                  <Route path="/public-contact" element={<PublicContactUs />} />
                  <Route path="/public-about" element={<PublicAbout />} />
                  <Route path="/public-quiz" element={<PublicQuiz />} />
                  <Route path="/" element={<PublicHome />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                </Route>  

                {/* Protected routes with Layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route  path="home" element={<Home />} />
                  <Route path="contact" element={<ContactUs />} />
                  <Route path="about" element={<About />} />
                  <Route path="typing-game" element={<TypingGame />} />
                  <Route path="matching-game" element={<MatchingGame />} />
                  <Route path="learning" element={<Learning />} />
                  <Route path="dictionary" element={<Dictionary />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="quiz" element={<Quiz />} />
                  <Route path="flash-cards" element={<FlashCards />} />

                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WordsProvider> {/* CLOSE WordsProvider */}
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
