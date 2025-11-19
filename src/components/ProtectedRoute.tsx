import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, consent, loading } = useAuthContext();
  const location = useLocation();

  // ⛔️ BLOCK navigation until AuthContext is finished
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

  // ⛔️ If user not logged in → go to /auth
  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ⛔️ If user has not completed required consent → go to /CompleteProfile
  if (
    !consent ||
    !consent.terms_accepted ||
    !consent.privacy_accepted ||
    !consent.data_processing_accepted
  ) {
    return <Navigate to="/CompleteProfile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
