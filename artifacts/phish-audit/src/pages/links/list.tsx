import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Plus, Trash2, Copy, Check, ExternalLink, MousePointerClick, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = "/api";

interface Redirect {
  id: number;
  slug: string;
  name: string;
  destinationUrl: string;
  clickCount: number;
  createdAt: string;
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-xs" title="Copiar">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {label && <span>{copied ? "¡Copiado!" : label}</span>}
    </button>
  );
}

function RedirectRow({ redirect, onDelete }: { redirect: Redirect; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const shortUrl = `${window.location.origin}${API}/r/${redirect.slug}`;

  async function handleDelete() {
    if (!confirm(`¿Eliminar el link "${redirect.name}"?`)) return;
    await fetch(`${API}/redirects/${redirect.slug}`, { method: "DELETE" });
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
          <Link2 className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-semibold text-foreground">{redirect.name}</span>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
              <MousePointerClick className="w-3 h-3" />
              {redirect.clickCount} clic{redirect.clickCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2.5 py-1.5 border border-border/50 mb-2">
            <span className="text-xs font-mono text-primary truncate flex-1">{shortUrl}</span>
            <CopyBtn text={shortUrl} />
            <a href={shortUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Ocultar destino" : "Ver destino"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex items-center gap-1 bg-secondary/30 rounded-lg px-2.5 py-1.5 border border-border/30">
                  <span className="text-xs text-muted-foreground truncate flex-1">{redirect.destinationUrl}</span>
                  <CopyBtn text={redirect.destinationUrl} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={handleDelete} className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400 flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function LinksList() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [destUrl, setDestUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function fetchRedirects() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/redirects`);
      setRedirects(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { fetchRedirects(); }, []);

  async function createRedirect() {
    if (!name.trim() || !destUrl.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API}/redirects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          destinationUrl: destUrl.trim(),
          slug: customSlug.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el link");
      } else {
        setName(""); setDestUrl(""); setCustomSlug(""); setShowForm(false);
        await fetchRedirects();
        toast({ title: "Link creado", description: `Enlace /${data.slug} listo para compartir.` });
      }
    } catch { setError("Error de conexión"); }
    setCreating(false);
  }

  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Camuflaje de Links</h1>
            <p className="text-sm text-muted-foreground mt-1">Genera links cortos que redirigen al destino real</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(""); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(0,255,255,0.15)]"
          >
            <Plus className="w-4 h-4" />
            Nuevo link
          </button>
        </motion.div>

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                <h2 className="font-semibold text-foreground mb-4">Nuevo link camuflado</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre / etiqueta</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Google, WhatsApp, Instagram..."
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL de destino (el link real)</label>
                    <input
                      value={destUrl}
                      onChange={e => setDestUrl(e.target.value)}
                      placeholder="https://www.google.com"
                      type="url"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Identificador personalizado <span className="text-muted-foreground/50">(opcional — se genera automáticamente)</span>
                    </label>
                    <div className="flex items-center gap-0 bg-secondary border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
                      <span className="px-3 py-2.5 text-xs text-muted-foreground border-r border-border whitespace-nowrap">
                        {baseOrigin}/api/r/
                      </span>
                      <input
                        value={customSlug}
                        onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ""))}
                        placeholder="mi-link"
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={createRedirect}
                      disabled={!name.trim() || !destUrl.trim() || creating}
                      className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creating ? "Creando..." : "Crear link camuflado"}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setError(""); }}
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
          <div className="text-center py-16 text-muted-foreground text-sm">Cargando links...</div>
        ) : redirects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Link2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No hay links camuflados</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Crea uno nuevo para enmascarar cualquier URL</p>
          </div>
        ) : (
          <div className="space-y-3">
            {redirects.map(r => (
              <RedirectRow key={r.id} redirect={r} onDelete={fetchRedirects} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
