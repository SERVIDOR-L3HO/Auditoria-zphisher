import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import CampaignsList from "@/pages/campaigns/list";
import NewCampaign from "@/pages/campaigns/new";
import CampaignDetail from "@/pages/campaigns/detail";
import TemplatesList from "@/pages/templates/list";
import CapturesList from "@/pages/captures/list";
import SessionsList from "@/pages/sessions/list";
import LocationsList from "@/pages/locations/list";

const queryClient = new QueryClient();

function Router() {
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
