import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import CampaignsList from "@/pages/campaigns/list";
import NewCampaign from "@/pages/campaigns/new";
import CampaignDetail from "@/pages/campaigns/detail";
import TemplatesList from "@/pages/templates/list";
import CapturesList from "@/pages/captures/list";
import SessionsList from "@/pages/sessions/list";
import LocationsList from "@/pages/locations/list";
import LinksList from "@/pages/links/list";
import AdminPage from "@/pages/admin";
import CameraList from "@/pages/camera/list";

const queryClient = new QueryClient();

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/campaigns" component={CampaignsList} />
      <Route path="/campaigns/new" component={NewCampaign} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/templates" component={TemplatesList} />
      <Route path="/captures" component={CapturesList} />
      <Route path="/sessions" component={SessionsList} />
      <Route path="/ubicacion" component={LocationsList} />
      <Route path="/links" component={LinksList} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/camara" component={CameraList} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
