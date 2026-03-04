"use client"

import React, { useState, useEffect } from "react"
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
  SearchX,
  Trash2,
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
  Clock,
  History,
  Phone,
  Eye,
  EyeOff,
  Pencil,
  Info,
  CheckCircle2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { LeadStepperDialog } from "./lead-stepper-dialog"
import { EditLeadDialog } from "./edit-lead-dialog"
import { LeadDetailModal } from "./lead-detail-modal"
import { ScheduleLeadDialog } from "./schedule-lead-dialog"
import { DiscardLeadDialog } from "./discard-lead-dialog"
import { moveToFollowUp, putOnHold, getLeadsStats, updateLeadStatus, updateLeadSubStatus, updateLeadKanbanStep, updateLeadCategory } from "@/lib/actions/leads"
import { AuditView } from "./audit-view"

interface LeadsViewProps {
  leads: Lead[]
  stats: {
    total: number
    toSchedule: number
    waiting: number
    inExecution: number
    onHold: number
    totalDiscarded: number
    noiseRate: number
    azurCount: number
    cocinaCount: number
    categories: Record<string, number>
    discardReasons?: Record<string, number>
  }
  onStatsUpdate?: (stats: any) => void
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

export function LeadsView({ leads: initialLeads, stats, onStatsUpdate }: LeadsViewProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [activeBrandTab, setActiveBrandTab] = useState<"ALL" | "AZUR" | "COCINAPRO">("ALL")
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [leadToSchedule, setLeadToSchedule] = useState<Lead | null>(null)
  const [activeView, setActiveView] = useState<'operativo' | 'kanban' | 'clasificados' | 'estadisticas'>('operativo')
  const [activeClasificadosTab, setActiveClasificadosTab] = useState<'POTENTIAL_CLIENT' | 'REJECTED' | 'REVISION' | 'CLOSED_SELL'>('POTENTIAL_CLIENT')
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const [isRevisionColumnHidden, setIsRevisionColumnHidden] = useState(false)
  const [leadToDiscard, setLeadToDiscard] = useState<Lead | null>(null)
  const [currentStats, setCurrentStats] = useState<LeadsViewProps['stats']>(stats)
  
  // Custom dialogs for Kanban
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [leadToStart, setLeadToStart] = useState<Lead | null>(null)
  
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false)
  const [leadToRevision, setLeadToRevision] = useState<Lead | null>(null)

  const [selectedStatsPeriod, setSelectedStatsPeriod] = useState(() => {
    const month = new Date().getMonth()
    if (month === 1) return "FEBRERO"
    if (month === 2) return "MARZO"
    if (month === 3) return "ABRIL"
    return "MARZO"
  })

  useEffect(() => {
    const fetchNewStats = async () => {
        const res = await getLeadsStats(selectedStatsPeriod)
        if (res) {
          setCurrentStats(res)
          onStatsUpdate?.(res)
        }
    }
    fetchNewStats()
  }, [selectedStatsPeriod, onStatsUpdate])

  const unfilteredBrandLeads = initialLeads.filter(l => {
    const categoryMatch = filterCategory === "ALL" || l.category === filterCategory
    const periodMatch = !l.period || l.period.toUpperCase() === selectedStatsPeriod.toUpperCase()
    return categoryMatch && periodMatch
  })

  // Operativo shows specific non-funnel categories + LEAD_ALL
  const operativoLeads = unfilteredBrandLeads.filter(l => {
    const categoryAllowed = ['SERVICE_OFFER', 'JOB_CANDIDATE', 'CONFUSED', 'LEAD_ALL', 'LEAD_LIBRE'].includes(l.category);
    const brandMatch = activeBrandTab === "ALL" || l.brand?.toUpperCase() === activeBrandTab.toUpperCase();
    return categoryAllowed && brandMatch;
  });

  const kanbanLeads = initialLeads.filter(l => {
    const brandValue = l.brand?.toUpperCase();
    const brandMatch = activeBrandTab === "ALL" || brandValue === activeBrandTab.toUpperCase() || !brandValue;
    
    // Solo permitimos estas tres categorías en el Kanban
    const isKanbanCategory = ['POTENTIAL_CLIENT', 'LEAD_ALL', 'LEAD_LIBRE', 'REVISION'].includes(l.category || '');
    
    // Comparación robusta de periodo
    const periodMatch = !l.period || l.period.trim().toUpperCase() === selectedStatsPeriod.trim().toUpperCase();
    
    return brandMatch && isKanbanCategory && periodMatch;
  });

  const clasificadosLeads = unfilteredBrandLeads.filter(l => {
    const brandValue = l.brand?.toUpperCase();
    const brandMatch = activeBrandTab === "ALL" || brandValue === activeBrandTab.toUpperCase() || !brandValue;
    return brandMatch;
  });

  const columns = leadColumns(
    (l) => {
        setSelectedLead(l)
        setIsDetailModalOpen(true)
    },
    (l: Lead) => {
        setLeadToSchedule(l);
        setIsScheduleDialogOpen(true);
    },
    (l: Lead) => {
        setLeadToDiscard(l);
        setIsDiscardDialogOpen(true);
    },
    (lead) => {
        setLeadToEdit(lead);
        setIsEditLeadOpen(true);
    },
    (lead) => moveToFollowUp(lead.id),
    (lead) => putOnHold(lead.id)
  )

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Global Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 px-2 shrink-0">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Periodo de Análisis</span>
           </div>
           <div className="flex bg-slate-100/80 p-1 rounded-2xl w-full sm:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
               {["FEBRERO", "MARZO", "ABRIL"].map((p) => (
                   <button
                       key={p}
                       onClick={() => setSelectedStatsPeriod(p)}
                       className={cn(
                           "px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0",
                           selectedStatsPeriod === p ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                       )}
                   >
                       {p}
                   </button>
               ))}
           </div>
        </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-blue-50 rounded-xl">
                    <UserPlus className="h-5 w-5 text-blue-600" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Captados</span>
           </div>
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{currentStats.total}</div>
           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Leads este periodo</p>
           <ChevronRight className="absolute right-6 bottom-6 h-4 w-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-amber-50 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-600" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Backlog</span>
           </div>
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{currentStats.toSchedule}</div>
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
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{currentStats.inExecution}</div>
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
           <div className="text-3xl font-black text-slate-900 tracking-tighter">{currentStats.azurCount}/{currentStats.cocinaCount}</div>
           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Azur vs CocinaPro</p>
           <ChevronRight className="absolute right-6 bottom-6 h-4 w-4 text-slate-200 group-hover:text-slate-900 transition-colors" />
        </div>
      </div>

      {/* Navigation Sub-Tabs (Segmented Control) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-100 gap-4">
         <div className="flex bg-slate-100 p-1.5 rounded-[1.4rem] w-full md:w-fit overflow-x-auto">
            <button 
                onClick={() => setActiveView('operativo')}
                className={cn(
                    "flex-1 md:flex-none justify-center px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center shrink-0",
                    activeView === 'operativo' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Briefcase className="h-4 w-4" />
                Operativo
            </button>
            <button 
                onClick={() => setActiveView('kanban')}
                className={cn(
                    "flex-1 md:flex-none justify-center px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center shrink-0",
                    activeView === 'kanban' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <LayoutGrid className="h-4 w-4" />
                Flujo Ventas
            </button>
            <button 
                onClick={() => setActiveView('clasificados')}
                className={cn(
                    "flex-1 md:flex-none justify-center px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center shrink-0",
                    activeView === 'clasificados' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Filter className="h-4 w-4" />
                Clasificados
            </button>
            <button 
                onClick={() => setActiveView('estadisticas')}
                className={cn(
                    "flex-1 md:flex-none justify-center px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center shrink-0",
                    activeView === 'estadisticas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <BarChart3 className="h-4 w-4" />
                Estadísticas
            </button>
         </div>

         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {/* Note: The old filterBrand dropdown was removed in favor of the custom Tabs in Operativo,
                  but for the rest of views we still filter globally if needed... actually,
                  activeBrandTab acts as the global master selector natively. 
              */}
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
                  <SelectItem value="LEAD_ALL">LEAD LIBRE (OTROS)</SelectItem>
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

      <div className="min-h-[600px]">
        {activeView === 'operativo' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="flex flex-col gap-6">
                 {/* Segmented Brand Control */}
                 <div className="flex p-1 bg-slate-100 rounded-[1.2rem] self-start md:self-center">
                    <button 
                        onClick={() => setActiveBrandTab('AZUR')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeBrandTab === 'AZUR' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Ver Azur
                    </button>
                    <button 
                        onClick={() => setActiveBrandTab('COCINAPRO')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeBrandTab === 'COCINAPRO' ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Ver CocinaPro
                    </button>
                    <button 
                        onClick={() => setActiveBrandTab('ALL')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeBrandTab === 'ALL' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Ver Ambos
                    </button>
                 </div>

                 {/* Minimalist Data Card */}
                 <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <DataTable 
                            columns={columns} 
                            data={operativoLeads} 
                            filterColumn="contactName" 
                            secondaryFilterColumn="kommoId"
                            renderMobileCard={(lead: Lead) => (
                                <div key={lead.id} className={cn(
                                    "flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm mb-2",
                                    lead.brand === 'AZUR' ? "border-l-4 border-l-slate-900" : "border-l-4 border-l-red-600"
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 leading-tight">
                                                {lead.contactName}
                                            </span>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                                {lead.leadEntryDate || lead.createdAt?.split('T')[0]} • {lead.category.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "border-none text-[8px] uppercase font-black px-2 tracking-widest",
                                            lead.brand === 'AZUR' ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {lead.brand}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-50">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => {
                                                setSelectedLead(lead)
                                                setIsDetailModalOpen(true)
                                            }}
                                            className="h-11 w-11 rounded-xl p-0 hover:bg-slate-100"
                                            title="Ver"
                                        >
                                            <Eye className="h-5 w-5 text-slate-500" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => {
                                                setLeadToEdit(lead)
                                                setIsEditLeadOpen(true)
                                            }}
                                            className="h-11 w-11 rounded-xl p-0 hover:bg-amber-50 hover:text-amber-600"
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4 text-amber-600" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        />
                    </CardContent>
                 </Card>
             </div>
          </div>
        )}

        {activeView === 'kanban' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col gap-6">
            {/* Global Brand Selector for Kanban (Duplicate of Operativo for visibility as requested) */}
            <div className="flex p-1 bg-slate-100 rounded-[1.2rem] self-start">
               <button 
                   onClick={() => setActiveBrandTab('AZUR')}
                   className={cn(
                       "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       activeBrandTab === 'AZUR' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
               >
                   Ver Azur
               </button>
               <button 
                   onClick={() => setActiveBrandTab('COCINAPRO')}
                   className={cn(
                       "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       activeBrandTab === 'COCINAPRO' ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
               >
                   Ver CocinaPro
               </button>
               <button 
                   onClick={() => setActiveBrandTab('ALL')}
                   className={cn(
                       "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       activeBrandTab === 'ALL' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
               >
                   Ver Ambos
               </button>
            </div>

            <div className="flex overflow-x-auto gap-6 p-1 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full items-start">
              {[
                { 
                    id: 'NUEVOS', 
                    label: 'Nuevos / Backlog', 
                    color: 'bg-blue-600', 
                    leads: kanbanLeads.filter(l => (l.category === 'LEAD_ALL' || l.category === 'LEAD_LIBRE') && l.status === 'PENDING') 
                },
                { 
                    id: 'SEGUIMIENTO', 
                    label: 'En Seguimiento', 
                    color: 'bg-amber-500', 
                    leads: kanbanLeads.filter(l => (l.category === 'LEAD_ALL' || l.category === 'LEAD_LIBRE') && l.status === 'REVISION') 
                },
                { 
                    id: 'AGENDAMIENTO', 
                    label: 'Agendamiento', 
                    color: 'bg-purple-600', 
                    leads: kanbanLeads.filter(l => l.category === 'POTENTIAL_CLIENT' && (l.subStatus === 'SIN_FECHA' || l.subStatus === 'ESPERANDO_RESPUESTA')),
                    hasFilter: true
                },
                { 
                    id: 'EJECUCION', 
                    label: 'Ejecución', 
                    color: 'bg-emerald-600', 
                    leads: kanbanLeads.filter(l => l.category === 'POTENTIAL_CLIENT' && l.subStatus === 'EN_EJECUCION'),
                    hasFilter: true
                },
                { 
                    id: 'REVISAR', 
                    label: 'Revisar (Oculta)', 
                    color: 'bg-orange-500', 
                    leads: kanbanLeads.filter(l => l.category === 'REVISION'),
                    canHide: true
                },
              ].map((column) => {
                if (column.canHide && isRevisionColumnHidden) {
                    return (
                        <div key={column.id} onClick={() => setIsRevisionColumnHidden(false)} className="flex flex-col items-center justify-between py-6 min-w-[50px] bg-slate-100/50 rounded-[1.8rem] border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-100 transition-all snap-center h-full">
                            <EyeOff className="h-4 w-4 text-slate-400 mb-4" />
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{column.label}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-black border-slate-200 mt-4 rounded-lg bg-white px-2 py-1">{column.leads.length}</Badge>
                        </div>
                    )
                }

                return (
                <div key={column.id} className="space-y-4 min-w-[85vw] md:min-w-[320px] lg:min-w-[340px] snap-center shrink-0">
                  <div className="flex items-center justify-between px-5 py-4 bg-white rounded-[1.8rem] border border-slate-100 shadow-sm border-b-4 relative" style={{ borderBottomColor: column.color.replace('bg-', '') }}>
                    <div className="flex flex-col gap-1">
                       <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">{column.label}</span>
                       {(column.id === 'AGENDAMIENTO' || column.id === 'EJECUCION') && (
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Clientes Potenciales</span>
                       )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-black border-slate-100 rounded-lg px-3">{column.leads.length}</Badge>
                        {column.canHide && (
                            <button onClick={() => setIsRevisionColumnHidden(true)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 ml-1">
                                <EyeOff className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 min-h-[600px] p-2 rounded-[2rem] bg-slate-100/30 border border-dashed border-slate-200/50">
                    {column.leads.length > 0 ? column.leads.map((lead) => (
                      <div 
                        key={lead.id} 
                        className="group bg-white p-4 rounded-[1.4rem] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className={cn("absolute top-0 left-0 w-1 h-full", lead.brand === 'AZUR' ? 'bg-slate-900' : 'bg-red-600')} />
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                             <Badge className={cn("text-[7px] font-black tracking-widest uppercase px-1.5 py-0 border-none h-4", lead.brand === 'AZUR' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white')}>
                                {lead.brand}
                             </Badge>
                             <div className="flex items-center gap-1 opacity-40">
                                <Clock className="h-2 w-2" />
                                <span className="text-[8px] font-bold uppercase">
                                    {lead.period || selectedStatsPeriod}
                                </span>
                             </div>
                          </div>

                          <div className="space-y-0.5">
                            <span 
                                onClick={() => {
                                    setSelectedLead(lead)
                                    setIsDetailModalOpen(true)
                                }}
                                className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight cursor-pointer block truncate"
                            >
                                {lead.contactName}
                            </span>
                            {lead.category === 'POTENTIAL_CLIENT' ? (
                                <Badge variant="secondary" className={cn("text-[7px] font-black uppercase tracking-widest border px-1.5 h-4", 
                                    lead.subStatus === 'EN_EJECUCION' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                    "bg-purple-50 text-purple-700 border-purple-100"
                                )}>
                                    {lead.subStatus ? lead.subStatus.replace(/_/g, ' ') : 'SIN FECHA AÚN'}
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-slate-50 text-slate-400 text-[7px] font-black uppercase tracking-widest border-slate-100 px-1.5 h-4">
                                    {lead.category.replace(/_/g, ' ')}
                                </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-slate-50">
                             {column.id === 'NUEVOS' && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                        setLeadToStart(lead);
                                        setIsStartDialogOpen(true);
                                    }}
                                    className="flex-1 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-none"
                                >
                                    Iniciar
                                </Button>
                             )}
                             {(column.id === 'SEGUIMIENTO' || column.id === 'REVISAR') && (
                                <Select onValueChange={(val) => {
                                    if (val === 'REJECT') {
                                        setLeadToDiscard(lead);
                                        setIsDiscardDialogOpen(true);
                                    } else if (val === 'REVISION') {
                                        setLeadToRevision(lead);
                                        setIsRevisionDialogOpen(true);
                                    } else if (val === 'POTENTIAL_CLIENT') {
                                        setLeadToEdit(lead);
                                        setIsEditLeadOpen(true);
                                    }
                                }}>
                                    <SelectTrigger className="w-full h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-100 bg-white shadow-none">
                                        <SelectValue placeholder="Clasificar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {column.id !== 'REVISAR' && <SelectItem value="REVISION">En Revisión Externa</SelectItem>}
                                        <SelectItem value="POTENTIAL_CLIENT">Cliente Potencial</SelectItem>
                                        <SelectItem value="REJECT">Rechazar</SelectItem>
                                    </SelectContent>
                                </Select>
                             )}
                             {column.id === 'AGENDAMIENTO' && (
                                <Select onValueChange={(val) => {
                                    if (val === 'EJECUCION' || val === 'REJECT') {
                                        setLeadToEdit(lead);
                                        setIsEditLeadOpen(true);
                                    }
                                }}>
                                    <SelectTrigger className="w-full h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-100 bg-white shadow-none text-purple-700">
                                        <SelectValue placeholder="Acción..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EJECUCION">Reunión Concretada (Ejecución)</SelectItem>
                                        <SelectItem value="REJECT">Rechazar Cita</SelectItem>
                                    </SelectContent>
                                </Select>
                             )}
                             {column.id === 'EJECUCION' && (
                                <Select onValueChange={(val) => {
                                    if (val === 'CLOSED_SELL' || val === 'REJECT') {
                                        setLeadToEdit(lead);
                                        setIsEditLeadOpen(true);
                                    }
                                }}>
                                    <SelectTrigger className="w-full h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-emerald-100 bg-emerald-50 text-emerald-700 shadow-none">
                                        <SelectValue placeholder="Finalizar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLOSED_SELL">Venta Cerrada (Ganado)</SelectItem>
                                        <SelectItem value="REJECT">Rechazado (Perdido)</SelectItem>
                                    </SelectContent>
                                </Select>
                             )}
                          </div>
                        </div>
                      </div>

                    )) : (
                      <div className="py-20 flex flex-col items-center justify-center opacity-40">
                         <Layers className="h-8 w-8 text-slate-300 mb-2" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sin Movimiento</span>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {activeView === 'clasificados' && (
          <div className="animate-in fade-in slide-in-from-right-6 duration-700 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
               {/* Brand Filters */}
               <div className="flex p-1 bg-slate-100 rounded-[1.2rem] w-full lg:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <button 
                      onClick={() => setActiveBrandTab('AZUR')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeBrandTab === 'AZUR' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Ver Azur
                  </button>
                  <button 
                      onClick={() => setActiveBrandTab('COCINAPRO')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeBrandTab === 'COCINAPRO' ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Ver CocinaPro
                  </button>
                  <button 
                      onClick={() => setActiveBrandTab('ALL')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeBrandTab === 'ALL' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Ver Ambos
                  </button>
               </div>

               {/* Classification Filters */}
               <div className="flex p-1 bg-slate-100/50 rounded-[1.2rem] border border-slate-200 w-full lg:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <button 
                      onClick={() => setActiveClasificadosTab('POTENTIAL_CLIENT')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeClasificadosTab === 'POTENTIAL_CLIENT' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Cliente Potencial
                  </button>
                  <button 
                      onClick={() => setActiveClasificadosTab('REVISION')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeClasificadosTab === 'REVISION' ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Revisión
                  </button>
                  <button 
                      onClick={() => setActiveClasificadosTab('REJECTED')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeClasificadosTab === 'REJECTED' ? "bg-red-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Rechazados
                  </button>
                  <button 
                      onClick={() => setActiveClasificadosTab('CLOSED_SELL')}
                      className={cn(
                          "flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                          activeClasificadosTab === 'CLOSED_SELL' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                  >
                      Venta Cerrada
                  </button>
               </div>
            </div>

            {activeClasificadosTab === 'POTENTIAL_CLIENT' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between px-6">
                       <div className="flex items-center gap-3">
                          <div className="bg-amber-100 p-2.5 rounded-2xl border border-amber-200">
                              <Calendar className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Mapeo de Potenciales</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prospectos con alta intención de compra</p>
                          </div>
                       </div>
                       <Badge className="bg-amber-500 text-white border-none px-6 py-2 rounded-full font-black text-xs tracking-widest shadow-lg shadow-amber-200">
                          {clasificadosLeads.filter(l => l.category === 'POTENTIAL_CLIENT').length} TOTAL POTENCIALES
                       </Badge>
                    </div>
                    <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                       <CardContent className="p-8">
                          <DataTable 
                              columns={columns} 
                              data={clasificadosLeads.filter(l => l.category === 'POTENTIAL_CLIENT')} 
                              filterColumn="contactName" 
                          />
                       </CardContent>
                    </Card>
                </div>
            )}

            {activeClasificadosTab === 'REVISION' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between px-6">
                       <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2.5 rounded-2xl border border-emerald-200">
                              <Eye className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">En Revisión</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prospectos en proceso interno de evaluación</p>
                          </div>
                       </div>
                       <Badge className="bg-emerald-500 text-white border-none px-6 py-2 rounded-full font-black text-xs tracking-widest shadow-lg shadow-emerald-200">
                          {clasificadosLeads.filter(l => l.category === 'REVISION').length} EN REVISIÓN
                       </Badge>
                    </div>
                    <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                       <CardContent className="p-8">
                          <DataTable 
                              columns={columns} 
                              data={clasificadosLeads.filter(l => l.category === 'REVISION')} 
                              filterColumn="contactName" 
                          />
                       </CardContent>
                    </Card>
                </div>
            )}

            {activeClasificadosTab === 'CLOSED_SELL' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between px-6">
                       <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
                              <CheckCircle2 className="h-5 w-5 text-slate-900" />
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Ventas Cerradas</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prospectos convertidos en transacciones cerradas</p>
                          </div>
                       </div>
                       <Badge className="bg-slate-900 text-white border-none px-6 py-2 rounded-full font-black text-xs tracking-widest shadow-lg shadow-slate-200">
                          {clasificadosLeads.filter(l => l.category === 'CLOSED_SELL').length} VENTAS CERRADAS
                       </Badge>
                    </div>
                    <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                       <CardContent className="p-8">
                          <DataTable 
                              columns={columns} 
                              data={clasificadosLeads.filter(l => l.category === 'CLOSED_SELL')} 
                              filterColumn="contactName" 
                          />
                       </CardContent>
                    </Card>
                </div>
            )}

            {activeClasificadosTab === 'REJECTED' && (
                <AuditView />
            )}
          </div>
        )}

        {activeView === 'estadisticas' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 px-1">
              <div className="grid lg:grid-cols-2 gap-8">
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
                                { label: "Backlog (Pendientes)", count: currentStats.toSchedule, color: "bg-blue-600", leads: initialLeads.filter(l => l.status === 'PENDING') },
                                { label: "En Espera (Sin Fecha)", count: currentStats.waiting, color: "bg-amber-500", leads: initialLeads.filter(l => l.status === 'WAITING_FOR_DATE') },
                                { label: "En Ejecución (Re-agendando)", count: currentStats.inExecution, color: "bg-emerald-500", leads: initialLeads.filter(l => l.status === 'IN_EXECUTION') },
                                { label: "En Revisión (Bloqueados)", count: currentStats.onHold, color: "bg-orange-500", leads: initialLeads.filter(l => l.status === 'ON_HOLD') },
                                { label: "Descartados / Mapping", count: currentStats.totalDiscarded, color: "bg-slate-300", leads: [] }
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
                                                    <span className="text-[10px] font-bold text-slate-300">({currentStats.total > 0 ? ((step.count / currentStats.total) * 100).toFixed(0) : 0}%)</span>
                                                </div>
                                            </div>
                                            <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 shadow-inner">
                                                <div 
                                                    className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", step.color)} 
                                                    style={{ width: `${currentStats.total > 0 ? (step.count / currentStats.total) * 100 : 0}%` }}
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
                                            <div className="text-4xl font-black text-white tracking-tighter">{currentStats.azurCount}</div>
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
                                            <div className="text-4xl font-black text-white tracking-tighter">{currentStats.cocinaCount}</div>
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
                                {Object.entries(currentStats.categories || {}).map(([cat, count]) => (
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

                    {currentStats.discardReasons && Object.keys(currentStats.discardReasons).length > 0 && (
                        <Card className="border-slate-200 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50 flex flex-row items-center justify-between">
                                <CardTitle className="text-[12px] md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <SearchX className="h-5 w-5 text-red-500 shrink-0" />
                                    MAPPING: {selectedStatsPeriod}
                                </CardTitle>
                                <Badge className="bg-slate-900 text-white border-none text-[8px] tracking-widest">{(currentStats.discardReasons ? Object.values(currentStats.discardReasons) : []).reduce((a: any, b: any) => Number(a) + Number(b), 0)} DESCARTADOS</Badge>
                            </CardHeader>
                            <CardContent className="px-6 md:px-10 py-6 md:py-8">
                                <div className="space-y-4">
                                    {Object.entries(currentStats.discardReasons || {}).map(([reason, count]) => (
                                        <div key={reason} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group hover:bg-slate-50 transition-colors px-2 rounded-lg">
                                            <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors leading-tight flex-1">{reason}</span>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-sm font-black text-slate-900">{count}</span>
                                                <Badge className="bg-red-50 text-red-600 border-none text-[8px]">{currentStats.total > 0 ? Math.round((Number(count) / currentStats.total) * 100) : 100}%</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                  </div>
              </div>
          </div>
        )}
      </div>

      <LeadStepperDialog 
        open={isNewLeadOpen} 
        onOpenChange={setIsNewLeadOpen} 
        defaultPeriod={selectedStatsPeriod}
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

      <DiscardLeadDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
        lead={leadToDiscard}
      />

      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-slate-900 px-6 py-5 flex items-center gap-4 text-white">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                    <History className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                   <h3 className="font-black text-lg tracking-tighter uppercase">Iniciar Gestión</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmación de Acción</p>
                </div>
            </div>
            <div className="p-8">
                <p className="text-sm font-bold text-slate-600 text-center uppercase tracking-widest">
                   ¿Confirmas que deseas iniciar el seguimiento? El prospecto pasará de PENDING a la columna de En Seguimiento (REVIEW).
                </p>
                <div className="flex gap-4 mt-8">
                   <Button variant="ghost" onClick={() => setIsStartDialogOpen(false)} className="flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">Cancelar</Button>
                   <Button 
                       onClick={async () => {
                           if (leadToStart) {
                               await updateLeadStatus(leadToStart.id, 'REVISION'); // status = REVISION means REVIEW for workflow
                               await updateLeadKanbanStep(leadToStart.id, 1);
                           }
                           setIsStartDialogOpen(false);
                       }} 
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-blue-600/20"
                   >
                       Confirmar
                   </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-slate-900 px-6 py-5 flex items-center gap-4 text-white">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Layers className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                   <h3 className="font-black text-lg tracking-tighter uppercase">Clasificar a Revisión</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmación de Acción</p>
                </div>
            </div>
            <div className="p-8">
                <p className="text-sm font-bold text-slate-600 text-center uppercase tracking-widest">
                   ¿Confirmas enviar a evaluación (En Revisión)? El Lead pasará a la etapa de Clasificación final.
                </p>
                <div className="flex gap-4 mt-8">
                   <Button variant="ghost" onClick={() => setIsRevisionDialogOpen(false)} className="flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">Cancelar</Button>
                   <Button 
                       onClick={async () => {
                           if (leadToRevision) {
                               await updateLeadCategory(leadToRevision.id, 'REVISION');
                               await updateLeadKanbanStep(leadToRevision.id, 2);
                           }
                           setIsRevisionDialogOpen(false);
                       }} 
                       className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-emerald-600/20"
                   >
                       Confirmar
                   </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  )
}
