import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import ConsultationList from "./pages/ConsultationList";
import ConsultationRoom from "./pages/ConsultationRoom";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ConsultationList />} />
            <Route path="/consultation/new" element={<PlaceholderPage />} />
            <Route path="/consultation/:id" element={<ConsultationRoom />} />
            <Route path="/master/jenis-konsultasi" element={<PlaceholderPage />} />
            <Route path="/master/jenis-layanan" element={<PlaceholderPage />} />
            <Route path="/master/jenis-hukum" element={<PlaceholderPage />} />
            <Route path="/users" element={<PlaceholderPage />} />
            <Route path="/users/roles" element={<PlaceholderPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
