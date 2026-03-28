import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, Copy, Check, ExternalLink, RefreshCw, ChevronDown, ChevronUp, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const API = "/api";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface LocationSession {
  id: number;
  token: string;
  name: string;
  description?: string;
  captureCount: number;
  createdAt: string;
}

interface LocationEntry {
  id: number;
  sessionToken: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  ipAddress?: string;
  userAgent?: string;
  capturedAt: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      title="Copiar enlace"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function SessionRow({ session, onDelete }: { session: LocationSession; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const trackUrl = `${window.location.origin}${API}/track/${session.token}`;

  async function loadLocations() {
    setLoading(true);
    try {
      const hdrs = await authHeaders();
      const res = await fetch(`${API}/location-sessions/${session.token}/data`, { headers: hdrs });
      const data = await res.json();
      setLocations(data);
    } catch { /* silent */ }
    setLoading(false);
  }

  function toggle() {
    if (!expanded) loadLocations();
    setExpanded(!expanded);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar sesión "${session.name}" y todos sus datos?`)) return;
    const hdrs = await authHeaders();
    await fetch(`${API}/location-sessions/${session.token}`, { method: "DELETE", headers: hdrs });
    onDelete();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Navigation className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{session.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${session.captureCount > 0 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-secondary text-muted-foreground border border-border"}`}>
              {session.captureCount} captura{session.captureCount !== 1 ? "s" : ""}
            </span>
          </div>
          {session.description && (
            <p className="text-xs text-muted-foreground mb-2">{session.description}</p>
          )}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2.5 py-1.5 border border-border/50">
            <span className="text-xs font-mono text-muted-foreground truncate flex-1">{trackUrl}</span>
            <CopyBtn text={trackUrl} />
            <a href={trackUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Abrir enlace">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={toggle} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">Ubicaciones capturadas</span>
                <button onClick={loadLocations} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary">
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </button>
              </div>

              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-6">Cargando...</div>
              ) : locations.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  Aún no hay ubicaciones capturadas para esta sesión
                </div>
              ) : (
                <div className="space-y-3">
                  {locations.map((loc) => (
                    <div key={loc.id} className="bg-secondary/40 rounded-lg p-3 border border-border/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="font-mono text-sm font-semibold text-foreground">
                              {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground ml-5">
                            {loc.accuracy != null && (
                              <span>Precisión: <span className="text-foreground">{Math.round(loc.accuracy)}m</span></span>
                            )}
                            {loc.altitude != null && (
                              <span>Altitud: <span className="text-foreground">{Math.round(loc.altitude)}m</span></span>
                            )}
                            {loc.ipAddress && (
                              <span>IP: <span className="text-foreground font-mono">{loc.ipAddress}</span></span>
                            )}
                            <span>
                              {new Date(loc.capturedAt).toLocaleString("es-MX", {
                                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium flex-shrink-0"
                        >
                          <MapPin className="w-3 h-3" />
                          Ver mapa
                        </a>
                      </div>
                      {loc.userAgent && (
                        <div className="mt-2 ml-5 text-xs text-muted-foreground/60 truncate">{loc.userAgent}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LocationsList() {
  const [sessions, setSessions] = useState<LocationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  async function fetchSessions() {
    setLoading(true);
    try {
      const hdrs = await authHeaders();
      const res = await fetch(`${API}/location-sessions`, { headers: hdrs });
      setSessions(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { fetchSessions(); }, []);

  async function createSession() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const hdrs = await authHeaders();
      const res = await fetch(`${API}/location-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...hdrs },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      if (res.ok) {
        setName(""); setDescription(""); setShowForm(false);
        await fetchSessions();
        toast({ title: "Sesión creada", description: "El enlace de rastreo está listo para compartir." });
      }
    } catch { /* silent */ }
    setCreating(false);
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rastreo de Ubicación</h1>
            <p className="text-sm text-muted-foreground mt-1">Genera enlaces para capturar coordenadas GPS en tiempo real</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(0,255,255,0.15)]"
          >
            <Plus className="w-4 h-4" />
            Nueva sesión
          </button>
        </motion.div>

        {/* Formulario nuevo */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                <h2 className="font-semibold text-foreground mb-4">Nueva sesión de rastreo</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre de la sesión</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Objetivo 01, Campaña Norte..."
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descripción (opcional)</label>
                    <input
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Notas internas..."
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={createSession}
                      disabled={!name.trim() || creating}
                      className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creating ? "Creando..." : "Crear enlace de rastreo"}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Cargando sesiones...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Navigation className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No hay sesiones de rastreo</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Crea una nueva sesión para generar un enlace de captura</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <SessionRow key={session.id} session={session} onDelete={fetchSessions} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
