"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, 
    ExternalLink, 
    ClipboardCheck, 
    MessageSquare, 
    FileText, 
    MapPin, 
    Briefcase,
    Building2,
    X,
    TrendingUp,
    Phone,
    Search,
    Filter,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Lead } from "./columns";
import { differenceInDays } from "date-fns";

interface LeadDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSchedule: (lead: Lead) => void;
  onHold: (lead: Lead) => void;
}

export function LeadDetailModal({ open, onOpenChange, lead, onSchedule, onHold }: LeadDetailModalProps) {
  if (!lead) return null;

  const truncateId = (id: string) => {
    if (!id) return "---";
    if (id.startsWith('http')) {
        const match = id.match(/\/(\d+)(\?|$)/);
        return match ? match[1] : "LINK";
    }
    return id.substring(0, 15) + "...";
  };

  const daysWaiting = lead.createdAt ? differenceInDays(new Date(), new Date(lead.createdAt)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[700px] max-h-[90vh] flex flex-col border-none shadow-2xl">
        <DialogHeader className="bg-[#1a1c1e] px-8 py-8 text-white relative shrink-0">
          <DialogTitle className="sr-only">Detalles del Lead</DialogTitle>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
                <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl transition-transform",
                    lead.brand === "AZUR" ? "bg-slate-900 border border-slate-700" : "bg-red-600 shadow-red-600/20"
                )}>
                    {lead.category === "JOB_CANDIDATE" ? (
                        <Briefcase className="h-8 w-8 text-white" />
                    ) : (
                        <Building2 className="h-8 w-8 text-white" />
                    )}
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-black tracking-tighter uppercase">{lead.contactName}</h2>
                      <Badge className={cn(
                          "px-2 py-0 text-[10px] font-black uppercase tracking-widest",
                          lead.brand === "AZUR" ? "bg-slate-800 text-slate-400" : "bg-red-950 text-red-400"
                      )}>
                          {lead.brand}
                      </Badge>
                   </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[200px]" title={lead.kommoId}>
                            ID KOMMO: {truncateId(lead.kommoId)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">EN ESPERA: {daysWaiting} DÍAS</span>
                        {lead.status === 'ON_HOLD' && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-slate-700" />
                                <Badge className="bg-orange-600 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">EN REVISIÓN</Badge>
                            </>
                        )}
                    </div>
                   <div className="flex items-center gap-3 mt-2">
                       {lead.phone && (
                           <>
                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                                <Phone className="h-3 w-3 text-emerald-400" />
                                <span className="text-[10px] text-white font-bold">{lead.phone}</span>
                            </div>
                           </>
                       )}
                       {lead.leadEntryDate && (
                           <>
                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                                <Calendar className="h-3 w-3 text-blue-400" />
                                <span className="text-[10px] text-white font-bold">INGRESO: {lead.leadEntryDate}</span>
                            </div>
                           </>
                       )}
                   </div>
                </div>
            </div>
            <Button 
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-2xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
                onClick={() => onOpenChange(false)}
            >
                <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <TrendingUp className="h-64 w-64 -mr-20 -mt-20" />
          </div>
        </DialogHeader>

        <div className="p-8 bg-white overflow-y-auto custom-scrollbar flex-1">
             {/* Content based on Category */}
             <div className="grid gap-8">
                {(lead.category === 'POTENTIAL_CLIENT' || (lead.category === 'MANUAL_FOLLOW_UP' && lead.prospect)) && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-3 gap-6">
                             <DetailBox label="Dirección de Obra" value={lead.prospect?.address} icon={<MapPin className="h-4 w-4 text-blue-600" />} />
                             <DetailBox label="Metraje Estimado" value={`${lead.prospect?.squareMeters || 0} m²`} icon={<TrendingUp className="h-4 w-4 text-blue-600" />} />
                             <DetailBox label="Planos Técnicos" value={lead.prospect?.hasBlueprints ? "SÍ CUENTA" : "NO CUENTA"} icon={<ClipboardCheck className="h-4 w-4 text-blue-600" />} />
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                             <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="h-4 w-4 text-slate-900" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Requerimientos Específicos</span>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {lead.prospect?.requirementsDetail || "Sin requerimientos detallados registrados."}
                             </p>
                        </div>
                    </div>
                )}

                 {lead.category === 'MANUAL_FOLLOW_UP' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100/50">
                            <div className="bg-amber-100 p-2.5 rounded-xl">
                                <MessageSquare className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-amber-900 font-bold uppercase tracking-tighter text-xs">Seguimiento por Privado</h4>
                                <p className="text-[9px] text-amber-600/70 font-black uppercase tracking-widest">Este lead fue contactado por fuera de Kommo</p>
                            </div>
                         </div>

                         {lead.discardReason?.reasonDetail && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas de Gestión Manual</span>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                        "{lead.discardReason.reasonDetail}"
                                    </p>
                                </div>
                            </div>
                         )}
                    </div>
                )}

                {(lead.category === 'JOB_CANDIDATE' || lead.category === 'SERVICE_OFFER') && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="grid md:grid-cols-2 gap-8">
                              <DetailBox 
                                 label={lead.category === 'JOB_CANDIDATE' ? "Perfil del Candidato" : "Nombre Comercial"} 
                                 value={lead.businessResource?.companyName || lead.contactName} 
                                 icon={<FileText className="h-4 w-4 text-purple-600" />} 
                              />
                              <DetailBox 
                                 label="Estado del Archivo" 
                                 value={lead.businessResource?.fileUrl ? "VÍNCULO ACTIVO" : "SIN ARCHIVO"} 
                                 icon={<ExternalLink className="h-4 w-4 text-purple-600" />} 
                              />
                          </div>

                         <div className="bg-purple-50 p-8 rounded-[2.5rem] border border-purple-100">
                             <div className="flex items-center gap-2 mb-4">
                                <ClipboardCheck className="h-4 w-4 text-purple-900" />
                                <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Análisis Curricular / Propuesta</span>
                             </div>
                             <p className="text-sm text-purple-900/80 leading-relaxed font-bold">
                                {lead.businessResource?.cvAnalysisSummary || lead.businessResource?.offerDetails || "Sin análisis detallado."}
                             </p>
                         </div>

                         {lead.businessResource?.fileUrl && (
                            <Button 
                                className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 active:scale-95 transition-all"
                                onClick={() => window.open(lead.businessResource.fileUrl, '_blank')}
                            >
                                <ExternalLink className="h-5 w-5" />
                                Abrir Documentación Adjunta
                            </Button>
                         )}
                    </div>
                )}
             </div>
        </div>

        <DialogFooter className="bg-slate-50/80 p-8 border-t border-slate-100 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Creado el</span>
              <span className="text-[11px] font-bold text-slate-900">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "---"}</span>
           </div>
           <Button 
                variant="outline" 
                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 bg-white"
                onClick={() => onOpenChange(false)}
            >
                Cerrar Ventana
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailBox({ label, value, icon }: { label: string, value?: string, icon: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-none truncate">{value || "---"}</p>
        </div>
    )
}
