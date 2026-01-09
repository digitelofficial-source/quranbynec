import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/surah" element={<SurahListPage />} />
          <Route path="/surah/:number" element={<SurahPage />} />
          <Route path="/juz" element={<JuzListPage />} />
          <Route path="/juz/:number" element={<JuzPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

