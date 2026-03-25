import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";

export function AppLayout({ children, title, description }: { children: ReactNode, title?: string, description?: string }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
          {title && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 pt-10 lg:pt-0"
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
              )}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
