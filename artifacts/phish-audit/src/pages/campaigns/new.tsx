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
        toast({ title: "¡Campaña creada!", description: "Lista para iniciar la auditoría." });
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
        setLocation(`/campaigns/${data.id}`);
      },
      onError: (error: any) => {
        toast({ title: "Error", description: error.message || "No se pudo crear la campaña", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.templateId) {
      toast({ title: "Campos requeridos", description: "El nombre y la plantilla son obligatorios.", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: formData });
  };

  return (
    <AppLayout
      title="Nueva Campaña"
      description="Configura un nuevo escenario de auditoría de phishing."
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

        {/* Información básica */}
        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-foreground">
            <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-sm shrink-0">1</span>
            Datos de la Campaña
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Nombre de la Campaña <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                placeholder="Ej. Auditoría Q1 - Área de Finanzas"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm min-h-[80px]"
                placeholder="Describe el objetivo de la auditoría..."
              />
            </div>
          </div>
        </div>

        {/* Selección de plantilla */}
        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-foreground">
            <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-sm shrink-0">2</span>
            Selecciona una Plantilla <span className="text-red-400">*</span>
          </h2>

          {templatesLoading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
              Cargando plantillas...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {templates?.map(t => (
                <div
                  key={t.id}
                  onClick={() => setFormData({ ...formData, templateId: t.id })}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 transition-all duration-200 flex flex-col items-center text-center gap-2",
                    formData.templateId === t.id
                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,255,0.15)]"
                      : "bg-background border-border hover:border-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <div className="text-2xl">{t.icon}</div>
                  <div>
                    <div className="font-medium text-xs text-foreground">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tipo de túnel */}
        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-foreground">
            <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-sm shrink-0">3</span>
            Tipo de Conexión
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'cloudflared', name: 'Cloudflared', desc: 'URL pública segura vía Cloudflare. Recomendado.', icon: Globe },
              { id: 'serveo', name: 'Serveo', desc: 'Reenvío de puerto por SSH.', icon: Box },
              { id: 'localhost', name: 'Localhost', desc: 'Solo para pruebas locales.', icon: Server }
            ].map(tunnel => (
              <div
                key={tunnel.id}
                onClick={() => setFormData({ ...formData, tunnelType: tunnel.id as any })}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition-all duration-200",
                  formData.tunnelType === tunnel.id
                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,255,0.15)]"
                    : "bg-background border-border hover:border-muted-foreground"
                )}
              >
                <tunnel.icon className={cn("w-5 h-5 mb-2", formData.tunnelType === tunnel.id ? "text-primary" : "text-muted-foreground")} />
                <div className="font-medium text-foreground text-sm">{tunnel.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{tunnel.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {createMutation.isPending ? "Creando..." : "Crear Campaña"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
