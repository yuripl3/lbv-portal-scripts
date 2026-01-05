import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Header } from "@/components/Header";
import Scripts from "./pages/Scripts";
import EditorV2 from "./pages/EditorV2";
import Versions from "./pages/Versions";
import NotFound from "./pages/NotFound";
import Consolidado from "./pages/Consolidado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <div className="flex min-h-screen flex-col w-full">
            <Header />
            <Routes>
              <Route path="/" element={<Navigate to="/scripts" replace />} />
              <Route path="/scripts" element={<Scripts />} />
              <Route path="/editor/:scriptId" element={<EditorV2 />} />
              <Route path="/consolidado/:scriptId" element={<Consolidado />} />
              <Route path="/versions/:scriptId" element={<Versions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
