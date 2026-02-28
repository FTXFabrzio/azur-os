"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    CalendarCheck, 
    Clock, 
    UserCheck, 
    ArrowRight,
    CalendarDays,
    Zap
} from "lucide-react";
import { Lead } from "./columns";
import { updateLeadStatus } from "@/lib/actions/leads";

interface ScheduleLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onGoToAgenda: (lead: Lead) => void;
}

export function ScheduleLeadDialog({ open, onOpenChange, lead, onGoToAgenda }: ScheduleLeadDialogProps) {
  if (!lead) return null;

  const handleStatusUpdate = async (note: string, status: 'WAITING_FOR_DATE' | 'IN_EXECUTION' = 'WAITING_FOR_DATE') => {
    const result = await updateLeadStatus(lead.id, status, note);
    if (result.success) {
      onOpenChange(false);
    } else {
      alert("Error al actualizar: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[450px] border-none shadow-2xl rounded-[2rem]">
        <DialogHeader className="bg-[#1a1c1e] px-8 py-8 text-white relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">Gestión de Cita</DialogTitle>
              <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                {lead.contactName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 bg-white space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Selecciona una acción rápida:</p>
            
            <button 
                onClick={() => handleStatusUpdate("No tenemos fecha aun estamos a la espera")}
                className="w-full group flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:border-amber-200 transition-all text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Sin fecha definida</h4>
                        <p className="text-[10px] text-slate-500 font-bold">"No tenemos fecha aún, estamos a la espera"</p>
                    </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </button>

            <button 
                onClick={() => handleStatusUpdate("Estamos a la espera de que el cliente nos confirme.")}
                className="w-full group flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Esperando al cliente</h4>
                        <p className="text-[10px] text-slate-500 font-bold">"A la espera de confirmación del cliente"</p>
                    </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>

            <button 
                onClick={() => handleStatusUpdate("Conversación en curso para re-agendar fechas.", 'IN_EXECUTION')}
                className="w-full group flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">En Ejecución</h4>
                        <p className="text-[10px] text-slate-500 font-bold">"Conversación en curso para re-agendar"</p>
                    </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>

            <div className="pt-4 border-t border-slate-100">
                <Button 
                    onClick={() => {
                        onGoToAgenda(lead);
                        onOpenChange(false);
                    }}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-widest gap-3 shadow-xl transition-all active:scale-95"
                >
                    <CalendarDays className="h-5 w-5" />
                    Ir a Agenda Global
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
