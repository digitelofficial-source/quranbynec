import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import Index from "./pages/Index";
import SurahPage from "./pages/SurahPage";
import SurahListPage from "./pages/SurahListPage";
import JuzPage from "./pages/JuzPage";
import JuzListPage from "./pages/JuzListPage";
import BookmarksPage from "./pages/BookmarksPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ThemeInitializer() {
  useEffect(() => {
    // Load saved theme from localStorage
    const savedSettings = localStorage.getItem('quran-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.theme) {
          document.documentElement.classList.remove('light', 'dark', 'sepia');
          document.documentElement.classList.add(settings.theme);
        }
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  return null;
}

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/surah" element={<PageTransition><SurahListPage /></PageTransition>} />
        <Route path="/surah/:number" element={<PageTransition><SurahPage /></PageTransition>} />
        <Route path="/juz" element={<PageTransition><JuzListPage /></PageTransition>} />
        <Route path="/juz/:number" element={<PageTransition><JuzPage /></PageTransition>} />
        <Route path="/bookmarks" element={<PageTransition><BookmarksPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

