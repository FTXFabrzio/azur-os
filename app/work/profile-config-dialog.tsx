"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Settings, 
  Clock, 
  Save, 
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Bell,
  BellOff
} from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { cn } from "@/lib/utils";
const TimePickerSheet = dynamic(() => import("./time-picker-sheet").then(mod => mod.TimePickerSheet), {
  ssr: false,
  loading: () => <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-full" />
});
import { 
  getUserAvailability, 
  updateAllAvailabilityRules 
} from "@/lib/actions/work-logic";

interface ProfileConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const DAYS = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 7, name: "Domingo" },
];

export function ProfileConfigDialog({
  open,
  onOpenChange,
  userId,
}: ProfileConfigDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);

  const { permission, subscribeUser, isSupported } = usePushNotifications();

  useEffect(() => {
    if (open && userId) {
      getUserAvailability(userId).then((data: any[]) => {
        const initial = DAYS.map(d => {
          const rule = data.find(r => r.dayOfWeek === d.id);
          return {
            dayOfWeek: d.id,
            startTime: rule?.startTime || "09:00",
            endTime: rule?.endTime || "18:00",
            enabled: !!rule
          };
        });
        setRules(initial);
      });
    }
  }, [open, userId]);

  const handleSave = async () => {
    setLoading(true);
    const enabledRules = rules.filter(r => r.enabled).map(r => ({
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime
    }));

    const result = await updateAllAvailabilityRules(userId, enabledRules);
    if (result.success) {
      onOpenChange(false);
    } else {
      alert("Error al guardar");
    }
    setLoading(false);
  };

  const updateRule = (dayId: number, field: string, value: any) => {
    setRules(prev => {
      const newRules = prev.map(r => r.dayOfWeek === dayId ? { ...r, [field]: value } : r);
      
      // If "Apply to all" is checked and we changed startTime or endTime, replicate to all enabled rules
      if (applyToAll && (field === "startTime" || field === "endTime")) {
        return newRules.map(r => (r.enabled || r.dayOfWeek === dayId) ? { ...r, [field]: value } : r);
      }
      return newRules;
    });
  };

  const toggleAllWorkDays = (checked: boolean) => {
    setApplyToAll(checked);
    if (checked) {
      const monday = rules.find(r => r.dayOfWeek === 1);
      if (monday) {
        setRules(prev => prev.map(r => ({
          ...r,
          startTime: monday.startTime,
          endTime: monday.endTime
        })));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[480px] border-none shadow-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-[1.5rem] bg-white text-slate-900">
        <DialogDescription className="sr-only">
          Configuración de horarios de disponibilidad para la recepción de actividades técnicas.
        </DialogDescription>
        {/* Compact Header */}
        <div className="px-6 py-4 bg-white border-b border-red-100 flex items-center justify-between shrink-0 relative z-20">
           <DialogTitle className="text-lg font-black tracking-tight uppercase text-slate-800">
             Disponibilidad
           </DialogTitle>
           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8" onClick={() => onOpenChange(false)}>
             <span className="sr-only">Cerrar</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </Button>
        </div>

        {/* Premium Sync Switch */}
        <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 relative z-10 backdrop-blur-sm">
          <div className="flex flex-col">
             <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Sincronización Semanal
             </span>
             <span className="text-[10px] font-bold text-slate-400 leading-tight">
                Usar mismo horario para toda la semana
             </span>
          </div>
          <Switch 
            checked={applyToAll} 
            onCheckedChange={toggleAllWorkDays}
            className="data-[state=checked]:bg-red-600 scale-90"
          />
        </div>

        {/* Push Notifications Section */}
        <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                 <Bell className="h-3.5 w-3.5" />
                 Notificaciones Push
              </span>
              <span className="text-[10px] font-bold text-emerald-600/70 leading-tight">
                 {permission === "granted" ? "Activadas en este dispositivo" : "Recibe avisos de nuevas reuniones"}
              </span>
          </div>
          <Button 
            size="sm" 
            variant={"default"}
            disabled={!isSupported}
            onClick={() => subscribeUser()}
            className={cn(
               "h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
               permission === "granted" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            )}
          >
            {permission === "granted" ? "Vincular" : "Activar"}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white scrollbar-thin">
          {rules.map((rule) => {
            const dayName = DAYS.find(d => d.id === rule.dayOfWeek)?.name;
            return (
              <div 
                key={rule.dayOfWeek} 
                className={cn(
                  "flex items-center justify-between py-3 px-1 transition-all duration-200 group border-b border-slate-50 last:border-0",
                  !rule.enabled && "opacity-50 grayscale"
                )}
              >
                <div className="flex items-center gap-4">
                   <Switch 
                     checked={rule.enabled}
                     onCheckedChange={(checked: any) => updateRule(rule.dayOfWeek, "enabled", checked)}
                     className="data-[state=checked]:bg-red-600 scale-90"
                   />
                   <span className={cn(
                     "text-sm font-black uppercase tracking-tight transition-colors min-w-[3rem]",
                     rule.enabled ? "text-slate-800" : "text-slate-400"
                   )}>
                     {dayName}
                   </span>
                </div>

                <div className={cn(
                  "flex items-center gap-3 transition-all duration-300",
                  !rule.enabled && "pointer-events-none opacity-40 grayscale"
                )}>
                  {/* Start Time Pill */}
                  <TimePickerSheet 
                    value={rule.startTime}
                    onChange={(val) => updateRule(rule.dayOfWeek, "startTime", val)}
                    disabled={!rule.enabled}
                  />
                  
                  <span className="text-[10px] font-black text-slate-300">A</span>

                  {/* End Time Pill */}
                  <TimePickerSheet 
                    value={rule.endTime}
                    onChange={(val) => updateRule(rule.dayOfWeek, "endTime", val)}
                    disabled={!rule.enabled}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex items-start gap-3 p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 text-blue-800 text-[10px] font-semibold mt-6 leading-relaxed">
             <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
             <span>Horarios disponibles para agendar visitas técnicas.</span>
          </div>
        </div>

        <DialogFooter className="bg-white p-6 sm:p-8 border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <div className="flex w-full gap-3 flex-col sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 hover:bg-slate-50 flex-1 h-12 rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#D32F2F] hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-red-600/20 flex-[2] h-12 rounded-2xl transition-all active:scale-95 gap-2"
            >
              {loading ? "Sincronizando..." : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Disponibilidad
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

