// import { useLocation } from "react-router-dom";
// import { useEffect } from "react";

// const NotFound = () => {
//   const location = useLocation();

//   useEffect(() => {
//     console.error(
//       "404 Error: User attempted to access non-existent route:",
//       location.pathname
//     );
//   }, [location.pathname]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold mb-4">404</h1>
//         <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
//         <a href="/" className="text-blue-500 hover:text-blue-700 underline">
//           Return to Home
//         </a>
//       </div>
//     </div>
//   );
// };

// export default NotFound;
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Home, BookOpen, MessageSquareWarning, ShieldAlert } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  // Minimal, privacy-safe logging without leaking details to users
  useEffect(() => {
    // Send a lightweight beacon to your telemetry endpoint if you add one
    // navigator.sendBeacon?.("/api/telemetry", JSON.stringify({ type: "404", path: location.pathname }));
    // Fallback to console in development only
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("404 route:", location.pathname);
    }
  }, [location.pathname]);

  // Suggest likely destinations based on common sections
  const suggestions = useMemo(
    () => [
      { to: "/", icon: <Home className="h-4 w-4" />, label: "Home" },
      { to: "/Dictionary", icon: <Search className="h-4 w-4" />, label: "Dictionary" },
      { to: "/Learning", icon: <BookOpen className="h-4 w-4" />, label: "Learning" },
      { to: "/ContactUs", icon: <MessageSquareWarning className="h-4 w-4" />, label: "Report a problem" },
      { to: "/privacy", icon: <ShieldAlert className="h-4 w-4" />, label: "Privacy" },
    ],
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="py-10 text-center space-y-4">
          <div className="text-6xl font-bold tracking-tight text-primary">404</div>
          <p className="text-base text-muted-foreground">
            The page {`"${location.pathname}"`} could not be found.
          </p>
          <p className="text-sm text-muted-foreground">
            Try one of these links to get back on track.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {suggestions.map((s) => (
              <Link key={s.to} to={s.to} className="w-full">
                <Button variant="outline" className="w-full justify-center gap-2">
                  {s.icon}
                  <span>{s.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="pt-4">
            <Link to="/" className="inline-block">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            If you reached this page from a link, it may be outdated or moved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
