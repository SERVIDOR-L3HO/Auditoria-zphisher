import { AppLayout } from "@/components/layout/AppLayout";
import { useGetStats, useListSessions, useListCampaigns } from "@workspace/api-client-react";
import { ShieldCheck, Target, Activity, Zap, Terminal as TerminalIcon, AlertTriangle, FileCode } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

function StatCard({ title, value, icon: Icon, colorClass, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${colorClass}/10 rounded-full blur-2xl group-hover:bg-${colorClass}/20 transition-all`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`w-5 h-5 text-${colorClass}`} />
      </div>
      <div className="relative z-10">
        <span className="font-display text-4xl font-bold text-foreground">{value}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: sessions, isLoading: sessionsLoading } = useListSessions();
  const { data: campaigns, isLoading: campaignsLoading } = useListCampaigns();

  const activeSessionsCount = sessions?.length || 0;
  const recentCampaigns = campaigns?.slice(0, 3) || [];

  if (statsLoading || sessionsLoading || campaignsLoading) {
    return (
      <AppLayout title="Dashboard" description="System overview and live metrics.">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" description="System overview and live metrics.">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Campaigns" 
          value={stats?.totalCampaigns || 0} 
          icon={Target} 
          colorClass="primary" 
          delay={0.1} 
        />
        <StatCard 
          title="Active Sessions" 
          value={activeSessionsCount} 
          icon={Activity} 
          colorClass="green-400" 
          delay={0.2} 
        />
        <StatCard 
          title="Total Captures" 
          value={stats?.totalCaptures || 0} 
          icon={ShieldCheck} 
          colorClass="accent" 
          delay={0.3} 
        />
        <StatCard 
          title="Success Rate" 
          value={`${stats?.successRate || 0}%`} 
          icon={Zap} 
          colorClass="yellow-400" 
          delay={0.4} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Sessions Panel */}
        <div className="col-span-1 lg:col-span-2 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/30">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-primary" />
              Live Terminal Activity
            </h3>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <div className="p-4 bg-[#0a0a0c] flex-1 min-h-[300px] relative font-mono text-sm">
            <div className="scanline" />
            <div className="relative z-10 text-green-400/90 space-y-2">
              <p className="text-muted-foreground/70">[{new Date().toISOString()}] System initialized.</p>
              <p className="text-muted-foreground/70">[{new Date().toISOString()}] Monitoring active tunnels...</p>
              
              {sessions?.length === 0 ? (
                <p className="text-muted-foreground italic mt-4">&gt; No active sessions found. Awaiting campaign start...</p>
              ) : (
                sessions?.map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={s.id}
                    className="mt-2"
                  >
                    <p className="text-primary">&gt; Session #{s.id} active for "{s.campaignName}"</p>
                    <p className="pl-4">URL: <a href={s.phishUrl} target="_blank" className="underline hover:text-white">{s.phishUrl}</a></p>
                    <p className="pl-4 text-yellow-400">Captures: {s.captureCount}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/campaigns/new" className="flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                <Target className="w-5 h-5" />
                Launch New Campaign
              </Link>
              <Link href="/templates" className="flex items-center gap-3 p-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 border border-border transition-all">
                <FileCode className="w-5 h-5" />
                Browse Templates
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Recent Campaigns
            </h3>
            <div className="space-y-4">
              {recentCampaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent campaigns.</p>
              ) : (
                recentCampaigns.map(c => (
                  <Link key={c.id} href={`/campaigns/${c.id}`} className="block group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{c.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.templateName}</p>
                      </div>
                      <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        c.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        c.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-secondary text-muted-foreground border-border'
                      }`}>
                        {c.status}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
