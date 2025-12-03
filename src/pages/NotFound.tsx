import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, BookOpen, MessageSquare, AlertCircle, ArrowLeft, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log 404s in development for debugging
    if (import.meta.env.DEV) {
      console.warn("404 Not Found:", location.pathname);
    }
  }, [location.pathname]);

  const suggestions = useMemo(() => [
    { 
      to: "/", 
      icon: <Home className="h-5 w-5" />, 
      label: "Home",
      description: "Return to homepage"
    },
    { 
      to: "/dictionary", 
      icon: <Search className="h-5 w-5" />, 
      label: "Dictionary",
      description: "Search medical terms"
    },
    { 
      to: "/learning", 
      icon: <BookOpen className="h-5 w-5" />, 
      label: "Learning",
      description: "Start learning Hebrew"
    },
    { 
      to: "/contact", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Contact Us",
      description: "Report an issue"
    },
  ], []);

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Med-Ivrit</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <Card className="w-full max-w-2xl shadow-lg border-2">
          <CardContent className="py-12 px-6 sm:px-10">
            {/* Error Icon & Code */}
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="rounded-full bg-destructive/10 p-6 animate-pulse">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              
              <div>
                <h1 className="text-7xl font-bold tracking-tight text-primary mb-2">
                  404
                </h1>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Page Not Found
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  The page <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{location.pathname}</span> doesn't exist or has been moved.
                </p>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <Compass className="h-4 w-4" />
                <span>Try one of these pages instead:</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((item) => (
                  <Link key={item.to} to={item.to} className="w-full group">
                    <Button 
                      variant="outline" 
                      className="w-full h-auto py-4 px-4 justify-start gap-3 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                        {item.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t">
              <Link to="/">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 w-full sm:w-auto"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-center text-muted-foreground mt-8 max-w-md mx-auto">
              If you believe this is an error or the page should exist, please{" "}
              <Link to="/contact" className="underline hover:text-primary transition-colors">
                contact us
              </Link>{" "}
              and let us know.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotFound;
