import { useAuth } from "@/context/AuthContext";
import { Landing } from "./Landing";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import "@/styles/pages/Index.css";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('[Index] Auth state changed:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('[Index] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to marketplace
  if (isAuthenticated) {
    console.log('[Index] User is authenticated, redirecting to marketplace');
    return <Navigate to="/marketplace" replace />;
  }

  // Show landing page for unauthenticated users
  console.log('[Index] User is not authenticated, showing landing page');
  return <Landing />;
};

export default Index;
