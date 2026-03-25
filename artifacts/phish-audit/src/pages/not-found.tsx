import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center shadow-xl">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground text-sm mb-6">
          La dirección que buscas no existe en este sistema.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          Volver al Panel Principal
        </Link>
      </div>
    </div>
  );
}
