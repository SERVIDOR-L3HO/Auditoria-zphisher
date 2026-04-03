import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  FileCode,
  ListTodo,
  Terminal,
  ShieldAlert,
  Menu,
  X,
  Navigation,
  Link2,
  LogOut,
  Shield,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campañas", icon: Target },
  { href: "/templates", label: "Plantillas", icon: FileCode },
  { href: "/captures", label: "Credenciales", icon: ListTodo },
  { href: "/sessions", label: "Sesiones Activas", icon: Terminal },
  { href: "/ubicacion", label: "Rastreo GPS", icon: Navigation },
  { href: "/camara", label: "Captura de Cámara", icon: Camera },
  { href: "/links", label: "Camuflaje de Links", icon: Link2 },
];

const ADMIN_EMAIL = "servidorl3ho@gmail.com";

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md text-foreground shadow-lg"
        aria-label="Menú"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 p-6 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            PhishAudit<span className="text-primary">Pro</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border border border-transparent"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-2 pb-1">
                <div className="border-t border-border/50" />
              </div>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  location === "/admin"
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border border border-transparent"
                )}
              >
                <Shield className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  location === "/admin" ? "scale-110" : "group-hover:scale-110"
                )} />
                Panel Admin
                {location === "/admin" && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                )}
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                <span className="font-mono text-xs text-primary font-bold">
                  {user?.email?.[0]?.toUpperCase() ?? "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-none truncate">
                  {user?.email ?? "Administrador"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Estado: <span className="text-green-400">En línea</span></p>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Fondo oscuro móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
