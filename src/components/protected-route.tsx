import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsUnlock } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
