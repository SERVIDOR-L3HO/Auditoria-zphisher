import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Plus, Trash2, Copy, Check, ExternalLink,
  MousePointerClick, ChevronDown, ChevronUp, Shuffle, ShieldOff
} from "lucide-react";
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

function randomPath(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
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
      {label && <span className={copied ? "text-green-400" : ""}>{copied ? "¡Copiado!" : label}</span>}
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl overflow-hidden">
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
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Ocultar destino" : "Ver destino"}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
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

/* ─────────────── Disfrazador tab ─────────────── */
function Disguiser() {
  const [realUrl, setRealUrl] = useState("");
  const [fakeDomain, setFakeDomain] = useState("");
  const [fakePath, setFakePath] = useState(randomPath());
  const [result, setResult] = useState("");
  const { toast } = useToast();

  function build() {
    let url = realUrl.trim();
    if (!url || !fakeDomain.trim()) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const domain = fakeDomain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    const path = fakePath.trim() ? "/" + fakePath.trim().replace(/^\//, "") : "/" + randomPath();
    const realParsed = new URL(url);
    // Format: https://FAKE_DOMAIN/FAKE_PATH@REAL_DOMAIN/REAL_PATH
    const disguised = `https://${domain}${path}@${realParsed.host}${realParsed.pathname}${realParsed.search}${realParsed.hash}`;
    setResult(disguised);
  }

  function shuffle() {
    setFakePath(randomPath());
    setResult("");
  }

  return (
    <div className="space-y-5">
      {/* Instrucciones */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300/80 space-y-1">
        <p className="font-semibold text-amber-300 flex items-center gap-2"><ShieldOff className="w-4 h-4" /> ¿Cómo funciona?</p>
        <p>Introduces tu link real y el dominio que quieres que <em>parezca</em>. El link resultante al compartirse en WhatsApp o Telegram se verá como el dominio falso, pero al abrirse lleva al link real.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tu link real (el que quieres camuflar)</label>
          <input
            value={realUrl}
            onChange={e => { setRealUrl(e.target.value); setResult(""); }}
            placeholder="https://auth-meta-es-la.replit.app/api/r/mi-link"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dominio falso (el que verán al compartir)</label>
          <input
            value={fakeDomain}
            onChange={e => { setFakeDomain(e.target.value); setResult(""); }}
            placeholder="supervideo.cc"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors font-mono"
          />
          <p className="text-xs text-muted-foreground/60 mt-1">Solo el dominio, sin https://  Ej: <span className="text-muted-foreground">google.com, drive.google.com, supervideo.cc</span></p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ruta falsa (la parte después del dominio)</label>
          <div className="flex gap-2">
            <div className="flex items-center flex-1 bg-secondary border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
              <span className="px-2.5 text-muted-foreground/60 text-sm">/</span>
              <input
                value={fakePath}
                onChange={e => { setFakePath(e.target.value); setResult(""); }}
                placeholder="jtnl3gzjmx6k"
                className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-mono"
              />
            </div>
            <button onClick={shuffle} title="Generar aleatoria" className="px-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1">Se genera aleatoria si la dejas vacía</p>
        </div>

        <button
          onClick={build}
          disabled={!realUrl.trim() || !fakeDomain.trim()}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generar link camuflado
        </button>
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="bg-card border border-primary/30 rounded-xl p-4 shadow-[0_0_20px_rgba(0,255,255,0.06)]">
              <p className="text-xs font-medium text-muted-foreground mb-2">Link camuflado — cópialo y compártelo</p>
              <div className="bg-secondary/60 rounded-lg px-3 py-2.5 border border-border flex items-center gap-2">
                <span className="text-xs font-mono text-primary break-all flex-1">{result}</span>
                <CopyBtn text={result} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary/40 rounded-lg p-2.5 border border-border">
                  <p className="text-muted-foreground/70 mb-1">Se ve como</p>
                  <p className="text-green-400 font-mono truncate">
                    {fakeDomain.trim().replace(/^https?:\/\//i, "")}
                    {fakePath ? "/" + fakePath.replace(/^\//, "") : ""}
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2.5 border border-border">
                  <p className="text-muted-foreground/70 mb-1">Abre en</p>
                  <p className="text-cyan-400 font-mono truncate">
                    {(() => { try { return new URL(realUrl.startsWith("http") ? realUrl : "https://" + realUrl).host; } catch { return realUrl; } })()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Redirects tab ─────────────── */
function Redirects() {
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
        body: JSON.stringify({ name: name.trim(), destinationUrl: destUrl.trim(), slug: customSlug.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el link");
      } else {
        setName(""); setDestUrl(""); setCustomSlug(""); setShowForm(false);
        await fetchRedirects();
        toast({ title: "Link creado", description: `Enlace /api/r/${data.slug} listo para compartir.` });
      }
    } catch { setError("Error de conexión"); }
    setCreating(false);
  }

  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo redirect
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border border-primary/30 rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Nuevo link redirect</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre / etiqueta</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Google, WhatsApp..." className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL de destino</label>
                  <input value={destUrl} onChange={e => setDestUrl(e.target.value)} placeholder="https://www.google.com" type="url" className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors font-mono" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Identificador personalizado <span className="text-muted-foreground/50">(opcional)</span></label>
                  <div className="flex items-center bg-secondary border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
                    <span className="px-3 py-2.5 text-xs text-muted-foreground border-r border-border whitespace-nowrap">{baseOrigin}/api/r/</span>
                    <input value={customSlug} onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ""))} placeholder="mi-link" className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-mono" />
                  </div>
                </div>
                {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={createRedirect} disabled={!name.trim() || !destUrl.trim() || creating} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {creating ? "Creando..." : "Crear link redirect"}
                  </button>
                  <button onClick={() => { setShowForm(false); setError(""); }} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Cargando links...</div>
      ) : redirects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Link2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No hay redirects</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Crea un redirect para enmascarar cualquier URL</p>
        </div>
      ) : (
        <div className="space-y-3">
          {redirects.map(r => <RedirectRow key={r.id} redirect={r} onDelete={fetchRedirects} />)}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Main page ─────────────── */
export default function LinksList() {
  const [tab, setTab] = useState<"disguiser" | "redirects">("disguiser");

  const tabs = [
    { id: "disguiser", label: "Disfrazador de URL", icon: ShieldOff },
    { id: "redirects", label: "Redirects", icon: Link2 },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Camuflaje de Links</h1>
          <p className="text-sm text-muted-foreground mt-1">Disfraza tus links para que parezcan de otro sitio</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 border border-border rounded-xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{id === "disguiser" ? "Disfrazador" : "Redirects"}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {tab === "disguiser" ? <Disguiser /> : <Redirects />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
