import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, hasConsent, loading, refreshUserData } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth", { state: { from: window.location.pathname } });
      } else if (!hasConsent) {
        navigate("/complete-profile");
      }
    }
  }, [user, hasConsent, loading, navigate]);

  // Refresh data on mount to ensure we have latest consent status
  useEffect(() => {
    if (user && !loading) {
      refreshUserData();
    }
  }, [user, loading, refreshUserData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] mx-auto" />
            <Skeleton className="h-4 w-[200px] mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !hasConsent) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
