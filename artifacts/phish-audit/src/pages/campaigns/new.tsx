import { AppLayout } from "@/components/layout/AppLayout";
import { useListTemplates, useCreateCampaign, getListCampaignsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Server, Globe, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewCampaign() {
  const [, setLocation] = useLocation();
  const { data: templates, isLoading: templatesLoading } = useListTemplates();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    tunnelType: "cloudflared" as "localhost" | "cloudflared" | "serveo"
  });

  const createMutation = useCreateCampaign({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Campaign Created", description: "Ready to launch." });
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
        setLocation(`/campaigns/${data.id}`);
      },
      onError: (error: any) => {
        toast({ title: "Error", description: error.message || "Failed to create campaign", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.templateId) {
      toast({ title: "Validation Error", description: "Name and Template are required.", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: formData });
  };

  return (
    <AppLayout 
      title="Configure Payload" 
      description="Set up a new phishing audit scenario."
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground">
            <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
            Campaign Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Campaign Name <span className="text-red-400">*</span></label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                placeholder="e.g. Q3 Corp Credential Audit"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm min-h-[100px]"
                placeholder="Targeting internal marketing team..."
              />
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground">
            <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
            Select Vector Template <span className="text-red-400">*</span>
          </h2>
          
          {templatesLoading ? (
             <div className="h-32 flex items-center justify-center text-muted-foreground"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2"/> Loading templates...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates?.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setFormData({...formData, templateId: t.id})}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col items-center text-center gap-3",
                    formData.templateId === t.id 
                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,255,0.15)]" 
                      : "bg-background border-border hover:border-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <div className="text-3xl">{t.icon}</div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tunnel Config */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground">
            <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-sm">3</span>
            Network Tunnel
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'cloudflared', name: 'Cloudflared', desc: 'Secure, reliable public URL via Cloudflare.', icon: Globe },
              { id: 'serveo', name: 'Serveo', desc: 'SSH-based public port forwarding.', icon: Box },
              { id: 'localhost', name: 'Localhost', desc: 'Local testing only (port 8080).', icon: Server }
            ].map(tunnel => (
              <div 
                key={tunnel.id}
                onClick={() => setFormData({...formData, tunnelType: tunnel.id as any})}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition-all duration-200",
                  formData.tunnelType === tunnel.id 
                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,255,0.15)]" 
                    : "bg-background border-border hover:border-muted-foreground"
                )}
              >
                <tunnel.icon className={cn("w-6 h-6 mb-3", formData.tunnelType === tunnel.id ? "text-primary" : "text-muted-foreground")} />
                <div className="font-medium text-foreground">{tunnel.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{tunnel.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "Configuring..." : "Generate Payload"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </form>
    </AppLayout>
  );
}
