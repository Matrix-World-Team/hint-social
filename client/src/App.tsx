import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { SignupPage } from "@/pages/signup";
import { NotFoundPage } from "@/pages/not-found";

const Home = () => <HomePage />;
const Login = () => <LoginPage />;
const Signup = () => <SignupPage />;
const NotFound = () => <NotFoundPage />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
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
