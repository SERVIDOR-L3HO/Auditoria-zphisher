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
      title="Captured Intelligence" 
      description="Global log of all harvested credentials across campaigns."
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-mono font-bold uppercase tracking-widest text-sm">Secure Data Vault</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Total Records: <span className="text-foreground">{captures?.length || 0}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Campaign</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Password</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-primary animate-pulse">Decrypting vault...</td></tr>
              ) : captures?.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Vault is empty.</td></tr>
              ) : (
                captures?.map(cap => (
                  <tr key={cap.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDate(cap.capturedAt)}</td>
                    <td className="px-6 py-3.5">
                      <Link href={`/campaigns/${cap.campaignId}`} className="text-foreground hover:text-primary underline decoration-border underline-offset-4">
                        {cap.campaignName}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-cyan-400">{cap.username || '-'}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3 group">
                        <span className="text-yellow-400/90 tracking-wider">
                          {showPasswords[cap.id] ? cap.password : '••••••••'}
                        </span>
                        <button 
                          onClick={() => setShowPasswords(p => ({...p, [cap.id]: !p[cap.id]}))}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                        >
                          {showPasswords[cap.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{cap.ipAddress || '-'}</td>
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
