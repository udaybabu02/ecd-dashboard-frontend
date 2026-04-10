import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ECDDataProvider } from "@/context/ECDDataContext";
import { GovernanceProvider } from "@/context/GovernanceContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const assignment = localStorage.getItem("roleAssignment");
  if (!assignment) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <GovernanceProvider>
          <ECDDataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Index />
                    </RequireAuth>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ECDDataProvider>
        </GovernanceProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
