import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import PostDetailBlurred from "./pages/PostDetailBlurred";
import NotFound from "./pages/NotFound";
import Collections from "./pages/Collections";
import Collections1849929295832448 from "./pages/Collections1849929295832448";
import CheckoutPage from "./pages/CheckoutPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Post Routes */}
            {/* Blurred uses simple ID, full access uses secure 11-digit ID */}
            <Route path="/post-blurred/:id" element={<PostDetailBlurred />} />
            <Route path="/post/:secureId" element={<PostDetail />} />
            
            {/* Collections Routes */}
            {/* Public collections page */}
            <Route path="/collections" element={<Collections />} />
            {/* Secure collections page with 11-digit secure ID */}
            <Route path="/collections/:secureId" element={<Collections1849929295832448 />} />
            
            {/* Checkout Route */}
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* Fallback route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;