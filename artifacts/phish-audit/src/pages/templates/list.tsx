import { AppLayout } from "@/components/layout/AppLayout";
import { useListTemplates } from "@workspace/api-client-react";
import { Link } from "wouter";

const DIFFICULTY_ES: Record<string, string> = {
  low: "Fácil",
  medium: "Medio",
  high: "Difícil",
};

export default function TemplatesList() {
  const { data: templates, isLoading } = useListTemplates();

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  }

  return (
    <AppLayout
      title="Plantillas de Phishing"
      description="Biblioteca de plantillas disponibles para tus campañas de auditoría."
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-primary">Cargando plantillas...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates?.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors shadow-lg group">
              <div className="flex justify-between items-start mb-3">
                <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
                  {t.icon}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wide ${getDifficultyColor(t.difficulty)}`}>
                  {DIFFICULTY_ES[t.difficulty] || t.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-3 bg-background px-2 py-1 rounded inline-block">{t.category}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{t.description}</p>

              <Link
                href={`/campaigns/new?template=${t.id}`}
                className="block w-full text-center py-2 bg-secondary text-foreground text-xs font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Usar Plantilla
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
