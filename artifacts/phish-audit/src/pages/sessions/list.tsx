import { AppLayout } from "@/components/layout/AppLayout";
import { useListSessions, useStopCampaign, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Terminal, Square, Radio, Copy, ExternalLink } from "lucide-react";
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
        toast({ title: "Sesión terminada", description: "La sesión activa fue eliminada." });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      }
    }
  });

  return (
    <AppLayout
      title="Sesiones Activas"
      description="Monitorea y controla los túneles de auditoría en ejecución."
    >
      <div className="bg-black border border-green-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.05)]">
        <div className="p-3 border-b border-green-500/30 bg-green-500/5 flex items-center gap-3">
          <Terminal className="w-4 h-4 text-green-400 shrink-0" />
          <span className="font-mono text-xs text-green-400 uppercase tracking-widest font-bold">PhishAudit :: Túneles Activos</span>
        </div>

        <div className="p-4 md:p-6 font-mono text-sm min-h-[350px]">
          {isLoading ? (
            <div className="text-green-500/50 animate-pulse">&gt; Analizando interfaces de red...</div>
          ) : sessions?.length === 0 ? (
            <div className="text-muted-foreground">
              <p>&gt; Conexión establecida.</p>
              <p className="mt-2 text-yellow-500/70">&gt; Advertencia: No se detectaron túneles activos.</p>
              <p className="mt-4 text-muted-foreground/50 text-xs">Inicia una campaña para activar una sesión.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-muted-foreground">&gt; Detectadas {sessions?.length} conexión(es) activa(s):</p>

              {sessions?.map(s => (
                <div key={s.id} className="border border-green-500/20 bg-green-500/5 p-4 rounded-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Radio className="w-4 h-4 text-green-400 animate-pulse shrink-0" />
                      <span className="text-green-400 font-bold">PID:{s.id}</span>
                      <Link href={`/campaigns/${s.campaignId}`} className="text-white hover:underline">
                        [{s.campaignName}]
                      </Link>
                    </div>
                    <button
                      onClick={() => stopMutation.mutate({ id: s.campaignId })}
                      disabled={stopMutation.isPending}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/40 transition-colors flex items-center gap-1 uppercase disabled:opacity-50 w-fit"
                    >
                      <Square className="w-3 h-3 fill-current" /> Terminar
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground mr-2">Iniciada:</span>
                      <span className="text-white">{formatDate(s.startedAt)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground mr-2">Capturas:</span>
                      <span className="text-yellow-400 font-bold">{s.captureCount}</span>
                    </div>
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-muted-foreground mr-2 shrink-0">URL:</span>
                      <span className="text-blue-400 break-all">{s.phishUrl}</span>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { copyToClipboard(s.phishUrl); toast({ title: "¡Copiado!" }); }}
                          className="text-muted-foreground hover:text-white p-0.5"
                          title="Copiar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={s.phishUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-white p-0.5"
                          title="Abrir link"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
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
