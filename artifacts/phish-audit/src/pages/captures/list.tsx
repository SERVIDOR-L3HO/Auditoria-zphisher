import { AppLayout } from "@/components/layout/AppLayout";
import { useListCaptures } from "@workspace/api-client-react";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Link } from "wouter";

export default function CapturesList() {
  const { data: captures, isLoading } = useListCaptures();
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  return (
    <AppLayout
      title="Credenciales Capturadas"
      description="Registro global de todas las credenciales obtenidas en las campañas."
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-mono font-bold uppercase tracking-widest text-sm">Bóveda Segura</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Total: <span className="text-foreground font-bold">{captures?.length || 0}</span>
          </div>
        </div>

        {/* Tabla desktop */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Fecha</th>
                <th className="px-5 py-4 font-medium">Campaña</th>
                <th className="px-5 py-4 font-medium">Usuario / Correo</th>
                <th className="px-5 py-4 font-medium">Contraseña</th>
                <th className="px-5 py-4 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-primary animate-pulse">Descifrando bóveda...</td></tr>
              ) : captures?.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">La bóveda está vacía.</td></tr>
              ) : (
                captures?.map(cap => (
                  <tr key={cap.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDate(cap.capturedAt)}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/campaigns/${cap.campaignId}`} className="text-foreground hover:text-primary underline decoration-border underline-offset-4 text-xs">
                        {cap.campaignName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-cyan-400">{cap.username || '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 group">
                        <span className="text-yellow-400/90 tracking-wider">
                          {showPasswords[cap.id] ? cap.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => setShowPasswords(p => ({ ...p, [cap.id]: !p[cap.id] }))}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                        >
                          {showPasswords[cap.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{cap.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas móvil */}
        <div className="sm:hidden">
          {isLoading ? (
            <div className="p-8 text-center text-primary animate-pulse">Cargando...</div>
          ) : captures?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">La bóveda está vacía.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {captures?.map(cap => (
                <div key={cap.id} className="p-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/campaigns/${cap.campaignId}`} className="text-xs text-muted-foreground hover:text-primary">
                      {cap.campaignName}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">{formatDate(cap.capturedAt)}</span>
                  </div>
                  <div className="text-cyan-400">{cap.username || '-'}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400/90">
                      {showPasswords[cap.id] ? cap.password : '••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, [cap.id]: !p[cap.id] }))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords[cap.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  {cap.ipAddress && <div className="text-xs text-muted-foreground">IP: {cap.ipAddress}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
