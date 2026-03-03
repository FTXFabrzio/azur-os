"use client"

import React, { useState } from "react"
import { LeadsView } from "../dashboard/leads-view"
import { 
  LogOut, 
  TrendingUp,
  Target,
  Users,
  BarChart3,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"
import { AuditView } from "../dashboard/audit-view"
import { cn } from "@/lib/utils"

interface ManagerDashboardViewProps {
  user: {
    name: string;
    role: string;
    username: string;
  } | null
  initialLeads: any[]
  leadStats: any
}

export function ManagerDashboardView({ user, initialLeads, leadStats }: ManagerDashboardViewProps) {
  const router = useRouter();
  const [currentStats, setCurrentStats] = useState(leadStats);

  const [activeTab, setActiveTab] = useState<'leads' | 'audit'>('leads');

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Premium Manager Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40 pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
               <Target className="h-5 w-5 text-white" />
             </div>
             <div className="flex flex-col">
               <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                  Hola, {user?.name || 'Gerente'}
               </h1>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/70">
                 Sales Management Dashboard
               </p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-slate-100 pr-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Captado</span>
                <span className="text-sm font-black text-slate-900">{(currentStats?.total || 0)} Leads</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasa de Ruido</span>
                <span className="text-sm font-black text-red-600">{currentStats?.noiseRate?.toFixed(1) || 0}%</span>
             </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 gap-2 font-bold h-12 px-6 rounded-2xl border border-transparent hover:border-red-100 transition-all shadow-sm hover:shadow-md"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-[1.8rem] border border-slate-200 w-fit">
          <button 
            onClick={() => setActiveTab('leads')}
            className={cn(
              "px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'leads' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Control Maestro
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={cn(
              "px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'audit' ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
          >
            <History className="h-4 w-4" />
            Mapping Histórico
          </button>
      </div>

      {activeTab === 'leads' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-3 mb-6 px-4">
              <div className="bg-blue-600 h-6 w-1 rounded-full" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Gestión Estratégica de Leads
              </h2>
           </div>
           <LeadsView 
              leads={initialLeads} 
              stats={leadStats} 
              onStatsUpdate={setCurrentStats}
           />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <AuditView />
        </div>
      )}    </div>
  )
}
