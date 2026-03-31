import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Layout } from "@/components/layout";
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/login";
import { SelectRolePage } from "@/pages/select-role";
import { DashboardPage } from "@/pages/dashboard";
import { RegisterPage } from "@/pages/register";
import { CreatePromisePage } from "@/pages/create-promise";
import { PromisesPage } from "@/pages/promises";
import { PromiseDetailPage } from "@/pages/promise-detail";
import { WithdrawPage } from "@/pages/withdraw";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!bg-card !text-foreground !border !border-border !shadow-xl",
            duration: 4000,
          }}
        />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/select-role"
              element={
                <ProtectedRoute>
                  <SelectRolePage />
                </ProtectedRoute>
              }
            />
            <Route path="/promises" element={<PromisesPage />} />
            <Route path="/promises/:id" element={<PromiseDetailPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute>
                  <RegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-promise"
              element={
                <ProtectedRoute>
                  <CreatePromisePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/withdraw"
              element={
                <ProtectedRoute>
                  <WithdrawPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
