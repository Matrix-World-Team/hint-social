import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { SignupPage } from "@/pages/signup";
import { FeedPage } from "@/pages/feed";
import { ProfilePage } from "@/pages/profile";
import { SearchPage } from "@/pages/search";
import { SettingsPage } from "@/pages/settings";
import { MessagesPage } from "@/pages/messages";
import { AdminPage } from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  
  // Redirect from root to feed if already logged in
  useEffect(() => {
    // Check if we need to redirect
    if (location === "/") {
      const checkAuth = async () => {
        try {
          const res = await fetch("/api/auth/status");
          const data = await res.json();
          
          if (data.authenticated) {
            setLocation("/feed");
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
        }
      };
      
      checkAuth();
    }
  }, [location, setLocation]);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/admin/:page" component={AdminPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
