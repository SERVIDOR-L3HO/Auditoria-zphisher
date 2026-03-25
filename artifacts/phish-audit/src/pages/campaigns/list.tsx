import { AppLayout } from "@/components/layout/AppLayout";
import { useListCampaigns, useDeleteCampaign, getListCampaignsQueryKey, useStartCampaign, useStopCampaign } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Play, Square, Trash2, Plus, ExternalLink, Target, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CampaignsList() {
  const { data: campaigns, isLoading } = useListCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useDeleteCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Campaign deleted", description: "The campaign was successfully removed." });
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
      }
    }
  });

  const startMutation = useStartCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Campaign started", description: "Zphisher session is initializing." });
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
      }
    }
  });

  const stopMutation = useStopCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Campaign stopped", description: "Session has been terminated." });
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
      }
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      active: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]",
      completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      stopped: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      <span className={`text-[11px] uppercase font-bold px-2.5 py-1 rounded-full border tracking-wider ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <AppLayout 
      title="Campaigns" 
      description="Manage and monitor your phishing audit campaigns."
    >
      <div className="flex justify-end mb-6">
        <Link 
          href="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Template</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Tunnel</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading campaigns...
                    </div>
                  </td>
                </tr>
              ) : campaigns?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No campaigns found. Create one to get started.
                  </td>
                </tr>
              ) : (
                campaigns?.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/campaigns/${c.id}`} className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                        {c.name}
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1">{formatDate(c.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{c.templateName}</td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="font-mono bg-secondary px-2 py-0.5 rounded text-xs">{c.tunnelType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground" title="Targets">
                          <Target className="w-3 h-3 inline mr-1" /> {c.targetCount}
                        </span>
                        <span className="text-green-400 font-medium" title="Captures">
                          <ShieldCheck className="w-3 h-3 inline mr-1" /> {c.captureCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'draft' || c.status === 'stopped' ? (
                          <button 
                            onClick={() => startMutation.mutate({ id: c.id })}
                            disabled={startMutation.isPending}
                            className="p-1.5 text-muted-foreground hover:text-green-400 hover:bg-green-400/10 rounded transition-colors disabled:opacity-50"
                            title="Start Campaign"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : c.status === 'active' ? (
                          <button 
                            onClick={() => stopMutation.mutate({ id: c.id })}
                            disabled={stopMutation.isPending}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                            title="Stop Campaign"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        ) : null}
                        
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this campaign?")) {
                              deleteMutation.mutate({ id: c.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
