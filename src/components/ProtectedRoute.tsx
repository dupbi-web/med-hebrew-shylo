import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, consent, loading, profile } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Preserve intended destination for post-login redirect
        navigate("/auth", { state: { from: location.pathname } });
      } else if (
        !consent ||
        !consent.terms_accepted ||
        !consent.privacy_accepted ||
        !consent.data_processing_accepted
      ) {
        // Redirect to consent/profile completion page if terms not accepted
        navigate("/CompleteProfile");
      }
    }
  }, [user, consent, loading, profile, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    // Not logged in and finished loading
    return null;
  }

  // User logged in and consent accepted: render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
