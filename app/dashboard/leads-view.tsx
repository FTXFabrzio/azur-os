"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "./data-table"
import { leadColumns, type Lead } from "./columns"
import { 
  Plus, 
  Users, 
  Zap, 
  Activity, 
  PieChart, 
  Search, 
  Filter,
  ArrowRight,
  TrendingDown,
  Building2,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
  BarChart3,
  LayoutGrid,
  UserPlus,
  Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Info
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LeadStepperDialog } from "./lead-stepper-dialog"
import { EditLeadDialog } from "./edit-lead-dialog"
import { LeadDetailModal } from "./lead-detail-modal"
import { ScheduleLeadDialog } from "./schedule-lead-dialog"
import { archiveLead, moveToFollowUp, putOnHold } from "@/lib/actions/leads"

interface LeadsViewProps {
  leads: Lead[]
  stats: {
    total: number
    toSchedule: number
    waiting: number
    inExecution: number
    onHold: number
    noiseRate: number
    azurCount: number
    cocinaCount: number
    categories: Record<string, number>
  }
}

const LeadListPopoverContent = ({ leads, label }: { leads: Lead[], label: string }) => (
  <PopoverContent className="w-80 p-0 rounded-[1.5rem] border-slate-100 shadow-2xl overflow-hidden pointer-events-auto">
    <div className="bg-[#1a1c1e] p-4 text-white">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</h4>
        <Badge className="bg-white/10 text-white border-none text-[8px]">{leads.length}</Badge>
      </div>
      <div className="text-xl font-black tracking-tighter">Listado de Prospectos</div>
    </div>
    <ScrollArea className="h-64">
      <div className="p-4 space-y-3">
        {leads.length > 0 ? leads.map(l => (
          <div key={l.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 hover:bg-slate-50 transition-colors p-1 rounded-lg group">
            <div className="flex flex-col flex-1 mx-2 overflow-hidden">
                <span className="text-[11px] font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{l.contactName}</span>
                {l.kommoId && l.kommoId.toString().trim().toLowerCase().startsWith('http') ? (
                    <a href={l.kommoId.toString().trim()} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-tighter flex items-center gap-1 mt-0.5 w-fit">
                        <ExternalLink className="h-2.5 w-2.5" /> Abrir en Kommo
                    </a>
                ) : (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5 truncate">
                        ID: {l.kommoId ? l.kommoId : l.id.slice(0, 8)}
                    </span>
                )}
            </div>
            <div className="flex gap-1">
                {l.brand === 'AZUR' ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" title="AZUR" />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="COCINAPRO" />
                )}
            </div>
          </div>
        )) : (
          <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-8">Sin registros en esta etapa</p>
        )}
      </div>
    </ScrollArea>
  </PopoverContent>
)

export function LeadsView({ leads: initialLeads, stats }: LeadsViewProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterBrand, setFilterBrand] = useState("ALL")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [leadToSchedule, setLeadToSchedule] = useState<Lead | null>(null)
  const [activeView, setActiveView] = useState<'gestion' | 'estadisticas'>('gestion')

  const filteredLeads = initialLeads.filter(l => {
    const brandMatch = filterBrand === "ALL" || l.brand === filterBrand
    const categoryMatch = filterCategory === "ALL" || l.category === filterCategory
    return brandMatch && categoryMatch
  })

  // Mock Funnel Data for the visual representation
  const funnelSteps = [
    { label: "Entrada Kommo", count: stats.total, color: "bg-slate-200" },
    { label: "Interés Real", count: Math.round(stats.total * 0.7), color: "bg-blue-200" },
    { label: "Propuestas", count: Math.round(stats.total * 0.4), color: "bg-orange-200" },
    { label: "Reuniones", count: Math.round(stats.total * 0.2), color: "bg-emerald-200" },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-blue-50 rounded-xl">
                    <UserPlus className="h-5 w-5 text-blue-600" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Captados</span>
           </div>
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{stats.total}</div>
           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Leads este mes</p>
           <ChevronRight className="absolute right-6 bottom-6 h-4 w-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-amber-50 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-600" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Backlog</span>
           </div>
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{stats.toSchedule}</div>
           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Pendientes de gestión</p>
           <ChevronRight className="absolute right-6 bottom-6 h-4 w-4 text-slate-200 group-hover:text-amber-500 transition-colors" />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <Zap className="h-5 w-5 text-emerald-600" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Ejecución</span>
           </div>
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{stats.inExecution}</div>
           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Re-agendando fechas</p>
           <ChevronRight className="absolute right-6 bottom-6 h-4 w-4 text-slate-200 group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-slate-900 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-slate-900 rounded-xl">
                    <PieChart className="h-5 w-5 text-white" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mix Marcas</span>
           </div>
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{stats.azurCount}/{stats.cocinaCount}</div>
           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Azur vs CocinaPro</p>
           <ChevronRight className="absolute right-6 bottom-6 h-4 w-4 text-slate-200 group-hover:text-slate-900 transition-colors" />
        </div>
      </div>

      {/* Navigation Sub-Tabs (Segmented Control) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-100 gap-4">
         <div className="flex bg-slate-100 p-1.5 rounded-[1.4rem] w-full md:w-fit overflow-x-auto">
            <button 
                onClick={() => setActiveView('gestion')}
                className={cn(
                    "flex-1 md:flex-none justify-center px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center shrink-0",
                    activeView === 'gestion' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <LayoutGrid className="h-4 w-4" />
                Gestión
            </button>
            <button 
                onClick={() => setActiveView('estadisticas')}
                className={cn(
                    "flex-1 md:flex-none justify-center px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center shrink-0",
                    activeView === 'estadisticas' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <BarChart3 className="h-4 w-4" />
                Estadísticas
            </button>
         </div>

         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="w-full sm:w-[110px] h-10 text-[9px] font-black uppercase rounded-[1.2rem] border-slate-200 bg-white">
                  <SelectValue placeholder="MARCA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">TODAS</SelectItem>
                  <SelectItem value="AZUR">AZUR</SelectItem>
                  <SelectItem value="COCINAPRO">COCINAPRO</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 text-[9px] font-black uppercase rounded-[1.2rem] border-slate-200 bg-white">
                  <SelectValue placeholder="CATEGORÍA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">TODAS LAS CATEGORÍAS</SelectItem>
                  <SelectItem value="POTENTIAL_CLIENT">CLIENTES POTENCIALES</SelectItem>
                  <SelectItem value="JOB_CANDIDATE">CANDIDATOS / CV</SelectItem>
                  <SelectItem value="SERVICE_OFFER">PROVEEDORES / OFERTAS</SelectItem>
                  <SelectItem value="MANUAL_FOLLOW_UP">INTENTOS / SEGUIMIENTO</SelectItem>
                  <SelectItem value="NO_RESPONSE">SIN RESPUESTA</SelectItem>
                  <SelectItem value="NOT_INTERESTED">NO INTERESADO</SelectItem>
                  <SelectItem value="CONFUSED">CONFUNDIDOS</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setIsNewLeadOpen(true)}
                size="sm" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] font-black text-[10px] h-10 px-6 gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all mt-2 sm:mt-0"
              >
                <Plus className="h-4 w-4" /> REGISTRAR LEAD
              </Button>
         </div>
      </div>

      {activeView === 'gestion' ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
             <Card className="border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden bg-white rounded-[2.5rem]">
                <CardContent className="p-8">
                    {filteredLeads.length > 0 ? (
                    <DataTable 
                        columns={leadColumns(
                        (l) => {
                            setSelectedLead(l)
                            setIsDetailModalOpen(true)
                        },
                        (l: Lead) => {
                            setLeadToSchedule(l);
                            setIsScheduleDialogOpen(true);
                        },
                        (lead) => archiveLead(lead.id),
                        (lead) => {
                            setLeadToEdit(lead);
                            setIsEditLeadOpen(true);
                        },
                        (lead) => moveToFollowUp(lead.id),
                        (lead) => putOnHold(lead.id)
                        )} 
                        data={filteredLeads} 
                        filterColumn="contactName" 
                        secondaryFilterColumn="kommoId"
                    />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
                            <div className="bg-slate-50 p-8 rounded-full mb-6">
                                <Layers className="h-12 w-12 text-slate-200" />
                            </div>
                            <h3 className="text-slate-900 font-black uppercase tracking-tighter text-2xl">Todo despejado</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2 max-w-[300px]">No hay prospectos en esta selección.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
          </div>
      ) : (
          <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500 px-1">
              <Card className="border-slate-200 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50">
                    <CardTitle className="text-[12px] md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Activity className="h-5 w-5 text-red-600 shrink-0" />
                        Embudo de Gestión Real-Time
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10">
                    <div className="space-y-8">
                        {[
                            { label: "Backlog (Pendientes)", count: stats.toSchedule, color: "bg-blue-600", leads: initialLeads.filter(l => l.status === 'PENDING') },
                            { label: "En Espera (Sin Fecha)", count: stats.waiting, color: "bg-amber-500", leads: initialLeads.filter(l => l.status === 'WAITING_FOR_DATE') },
                            { label: "En Ejecución (Re-agendando)", count: stats.inExecution, color: "bg-emerald-500", leads: initialLeads.filter(l => l.status === 'IN_EXECUTION') },
                            { label: "En Revisión (Bloqueados)", count: stats.onHold, color: "bg-orange-500", leads: initialLeads.filter(l => l.status === 'ON_HOLD') }
                        ].map((step, i) => (
                            <Popover key={i}>
                                <PopoverTrigger asChild>
                                    <div className="relative group cursor-pointer active:scale-[0.98] transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:px-2 gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors uppercase truncate max-w-[150px] md:max-w-none">{step.label}</span>
                                                <Info className="h-3 w-3 text-slate-300 group-hover:text-slate-400 shrink-0" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-slate-900">{step.count}</span>
                                                <span className="text-[10px] font-bold text-slate-300">({((step.count / stats.total) * 100).toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                        <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 shadow-inner">
                                            <div 
                                                className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", step.color)} 
                                                style={{ width: `${(step.count / stats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <LeadListPopoverContent leads={step.leads} label={step.label} />
                            </Popover>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8">
                <Card className="border-slate-200 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50">
                        <CardTitle className="text-[12px] md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <Layers className="h-5 w-5 text-indigo-600 shrink-0" />
                            Origen por Marca
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="bg-[#1a1c1e] p-8 rounded-[2rem] flex flex-col items-center justify-center space-y-3 group hover:scale-[1.02] cursor-pointer transition-all shadow-xl shadow-slate-900/10">
                                        <div className="text-4xl font-black text-white tracking-tighter">{stats.azurCount}</div>
                                        <div className="px-4 py-1 bg-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            AZUR <Info className="h-2.5 w-2.5 opacity-40" />
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <LeadListPopoverContent leads={initialLeads.filter(l => l.brand === 'AZUR')} label="Leads AZUR" />
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="bg-red-600 p-8 rounded-[2rem] flex flex-col items-center justify-center space-y-3 group hover:scale-[1.02] cursor-pointer transition-all shadow-xl shadow-red-600/10">
                                        <div className="text-4xl font-black text-white tracking-tighter">{stats.cocinaCount}</div>
                                        <div className="px-4 py-1 bg-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            COCINAPRO <Info className="h-2.5 w-2.5 opacity-40" />
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <LeadListPopoverContent leads={initialLeads.filter(l => l.brand === 'COCINAPRO')} label="Leads COCINAPRO" />
                            </Popover>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50">
                        <CardTitle className="text-[12px] md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <PieChart className="h-5 w-5 text-slate-400 shrink-0" />
                            Tipología de Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 md:px-10 py-6 md:py-8">
                        <div className="space-y-4">
                            {Object.entries(stats.categories || {}).map(([cat, count]) => (
                                <Popover key={cat}>
                                    <PopoverTrigger asChild>
                                        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 cursor-pointer group hover:bg-slate-50 transition-colors px-2 rounded-lg gap-2">
                                            <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors leading-tight flex-1">{cat.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-sm font-black text-slate-900">{count}</span>
                                                <ChevronRight className="h-3 w-3 text-slate-200 group-hover:text-slate-400" />
                                            </div>
                                        </div>
                                    </PopoverTrigger>
                                    <LeadListPopoverContent leads={initialLeads.filter(l => l.category === cat)} label={cat.replace('_', ' ')} />
                                </Popover>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
      )}

      <LeadStepperDialog 
        open={isNewLeadOpen} 
        onOpenChange={setIsNewLeadOpen} 
      />

      <EditLeadDialog 
        open={isEditLeadOpen} 
        onOpenChange={setIsEditLeadOpen}
        lead={leadToEdit}
      />

      <LeadDetailModal 
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        lead={selectedLead}
        onSchedule={(l: Lead) => {
            setLeadToSchedule(l);
            setIsScheduleDialogOpen(true);
        }}
        onHold={(l: Lead) => putOnHold(l.id)}
      />

      <ScheduleLeadDialog 
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        lead={leadToSchedule}
        onGoToAgenda={(l) => console.log("Going to agenda for", l)}
      />
      </div>
    </TooltipProvider>
  )
}

function DetailItem({ label, value }: { label: string, value?: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
            <span className="text-sm font-bold text-slate-700 block">{value || "---"}</span>
        </div>
    )
}

function StatCard({ title, value, icon, sub, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-500",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-500"
  };

  return (
    <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.5rem] overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", colors[color])}>
            {React.cloneElement(icon, { size: 20 })}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value}</div>
        <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub}</p>
            <ChevronRight className="h-3 w-3 text-slate-200 group-hover:text-slate-400 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
