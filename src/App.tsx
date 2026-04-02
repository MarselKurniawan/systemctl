import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ConsultationList from "./pages/ConsultationList";
import ConsultationRoom from "./pages/ConsultationRoom";
import VideoCallPage from "./pages/VideoCallPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserApprovalPage from "./pages/UserApprovalPage";
import ClientListPage from "./pages/ClientListPage";
import LawyerListPage from "./pages/LawyerListPage";
import AdminListPage from "./pages/AdminListPage";
import MasterDataPage from "./pages/MasterDataPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import { Scale, Briefcase } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/video-call/:id" element={<VideoCallPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<ConsultationList />} />
              <Route path="/consultation/:id" element={<ConsultationRoom />} />
              <Route path="/master/jenis-layanan" element={<MasterDataPage tableName="master_jenis_layanan" title="Jenis Layanan" subtitle="Kelola jenis layanan konsultasi" icon={Briefcase} />} />
              <Route path="/master/jenis-hukum" element={<MasterDataPage tableName="master_jenis_hukum" title="Jenis Hukum" subtitle="Kelola jenis hukum" icon={Scale} />} />
              <Route path="/users/approval" element={<UserApprovalPage />} />
              <Route path="/users/client" element={<ClientListPage />} />
              <Route path="/users/lawyer" element={<LawyerListPage />} />
              <Route path="/users/admin" element={<AdminListPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
