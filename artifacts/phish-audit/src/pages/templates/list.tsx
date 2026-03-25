import { AppLayout } from "@/components/layout/AppLayout";
import { useListTemplates } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function TemplatesList() {
  const { data: templates, isLoading } = useListTemplates();

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  }

  return (
    <AppLayout 
      title="Phishing Templates" 
      description="Library of available vector templates for audit campaigns."
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-primary">Loading vectors...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates?.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors shadow-lg group">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
                  {t.icon}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wide ${getDifficultyColor(t.difficulty)}`}>
                  {t.difficulty} Diff
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4 bg-background px-2 py-1 rounded inline-block">{t.category}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{t.description}</p>
              
              <Link 
                href={`/campaigns/new?template=${t.id}`}
                className="block w-full text-center py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Use Template
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
