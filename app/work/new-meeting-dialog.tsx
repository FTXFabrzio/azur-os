"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  Link as LinkIcon,
  Video,
  Monitor,
  X // Import X icon if needed, but Dialog usually has a Close button. The user asked to leave the X. Shadcn DialogContent usually includes a Close X. The custom header had a Plus. I will remove the Plus.
} from "lucide-react";
import { getUsers } from "@/lib/actions/users";
import { createMeetingTransaction } from "@/lib/actions/work-logic";
import { TimePickerSheet } from "./time-picker-sheet";
import { format, addDays, startOfToday, parse, addMinutes, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function NewMeetingDialog({
  open,
  onOpenChange,
  userId,
}: NewMeetingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  // States specific for the new UI
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60); // minutes
  const [platform, setPlatform] = useState("Meet"); // "Meet", "Zoom", "Teams"

  const [formData, setFormData] = useState({
    clientName: "",
    address: "", // Will store Link if type is Virtual
    description: "",
    type: "PRESENCIAL" as "VIRTUAL" | "PRESENCIAL",
    participantIds: [] as string[],
  });

  // Calculate future dates for the strip (next 14 days)
  const dateStrip = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

  useEffect(() => {
    if (open) {
      getUsers().then(setAvailableUsers);
      setFormData({
        clientName: "",
        address: "",
        description: "",
        type: "PRESENCIAL",
        participantIds: [],
      });
      setSelectedDate(startOfToday());
      setStartTime("09:00");
      setDuration(60);
      setPlatform("Meet");
    }
  }, [open]);

  // Derived End Time String
  const endTimeString = useMemo(() => {
    try {
      const baseDate = parse(startTime, "HH:mm", new Date());
      const end = addMinutes(baseDate, duration);
      return format(end, "h:mm a");
    } catch {
      return "--:--";
    }
  }, [startTime, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) return;

    setLoading(true);
    try {
      // 1. Construct standard Date objects from our UI state
      const [h, m] = startTime.split(":").map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(h, m, 0, 0);
      
      const endDateTime = addMinutes(startDateTime, duration);

      // 2. Prepare Address/Link
      let finalAddress = formData.address;
      if (formData.type === "VIRTUAL") {
        // Prepend Platform if needed, or just rely on the link.
        // Let's format it nicely: "Zoom: https://..."
        finalAddress = `${platform}: ${formData.address}`;
      }

      const result = await createMeetingTransaction({
        clientName: formData.clientName,
        address: finalAddress,
        description: formData.description,
        type: formData.type,
        startDatetime: startDateTime.toISOString(),
        endDatetime: endDateTime.toISOString(),
        createdBy: userId,
        participantIds: formData.participantIds,
      });

      if (result.success) {
        onOpenChange(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (uId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(uId)
        ? prev.participantIds.filter(id => id !== uId)
        : [...prev.participantIds, uId]
    }));
  };

  const getRoleColorBorder = (role: string) => {
    // Basic mapping based on previous instructions
    const r = role.toUpperCase();
    if (r.includes("ARCHITECT")) return "border-orange-500 text-orange-600 bg-orange-50";
    if (r.includes("CEO")) return "border-blue-600 text-blue-600 bg-blue-50";
    return "border-red-500 text-red-600 bg-red-50";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[500px] border-none shadow-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white text-slate-900 rounded-[2rem]">
        
        {/* Header */}
        <DialogHeader className="bg-white px-6 pt-6 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900">Nueva Actividad</DialogTitle>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Define los detalles de la agenda.</p>
            </div>
            {/* Minimalist Header: Removed the red Plus circle. Standard Dialog Close X (built-in) will serve as the exit. */}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
            
            {/* Type Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "PRESENCIAL" })}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
                  formData.type === "PRESENCIAL" ? "bg-white text-slate-900 shadow-sm scale-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <MapPin className="h-3.5 w-3.5" /> Presencial
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "VIRTUAL" })}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
                  formData.type === "VIRTUAL" ? "bg-white text-blue-600 shadow-sm scale-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Monitor className="h-3.5 w-3.5" /> Virtual
              </button>
            </div>

            {/* Client Name Input */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cliente / Título</Label>
              <Input
                required
                placeholder="Nombre del cliente o asunto..."
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-semibold"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>

            {/* Dynamic Address / Link Section */}
            <div className="space-y-1.5 min-h-[80px] transition-all duration-300">
               {formData.type === "PRESENCIAL" ? (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ubicación</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                      <Input
                        required
                        placeholder="Dirección exacta..."
                        className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-medium"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                 </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Plataforma & Enlace</Label>
                    <div className="flex gap-2">
                      {["Meet", "Zoom", "Teams"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all",
                            platform === p ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-400" />
                      <Input
                        required
                        placeholder="Pegar enlace de la reunión..."
                        className="pl-11 h-12 rounded-xl border-blue-100 bg-blue-50/10 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium text-blue-900 placeholder:text-blue-300"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                 </div>
               )}
            </div>

            {/* Date Strip */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha</Label>
              <div className="flex overflow-x-auto gap-2 pb-2 -mx-6 px-6 scrollbar-hide snap-x">
                {dateStrip.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[70px] h-[72px] rounded-2xl border transition-all snap-center shrink-0",
                        isSelected 
                          ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase">{format(date, "EEE", { locale: es })}</span>
                      <span className="text-xl font-black">{format(date, "d")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time & Duration Config */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Horario</Label>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
                 
                 {/* Top Row: Start Time Picker */}
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" /> Hora de Inicio
                    </span>
                    <TimePickerSheet 
                      value={startTime}
                      onChange={setStartTime}
                    />
                 </div>

                 <div className="h-px bg-slate-200" />

                 {/* Bottom Row: Duration Chips */}
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-700">Duración</span>
                       <span className="text-[10px] font-bold text-slate-400">
                         Termina: <span className="text-red-500">{endTimeString}</span>
                       </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {[30, 60, 90, 120].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setDuration(m)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            duration === m 
                              ? "bg-white border-red-200 text-red-600 shadow-sm"
                              : "bg-transparent border-transparent text-slate-400 hover:bg-slate-200/50"
                          )}
                        >
                          {m === 60 ? "1 hr" : m === 120 ? "2 hrs" : `${m} min`}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Participantes</Label>
              <div className="flex flex-wrap gap-3">
                 {availableUsers.filter(u => u.id !== userId).map((user, idx) => {
                   const isSelected = formData.participantIds.includes(user.id);
                   const colorClasses = getRoleColorBorder(user.role || "ADMIN");
                   // Mock availability logic: First 5 available (Green), others busy (Red) for demo
                   const isAvailable = idx < 5; 
                   
                   // Initials Logic: First letter of first 2 words, or first 2 letters of single word
                   const names = user.name.trim().split(" ");
                   const initials = names.length > 1 
                      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
                      : user.name.substring(0, 2).toUpperCase();

                   return (
                     <div key={user.id} className="rounded-full">
                       <button
                         type="button"
                         onClick={() => toggleParticipant(user.id)}
                         className={cn(
                           "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all relative",
                           isSelected ? `${colorClasses} shadow-md scale-110` : "border-transparent bg-slate-100 text-slate-500 grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                         )}
                         title={user.name} // Keep simple browser tooltip as fallback
                       >
                         <span className="text-[10px] font-black tracking-tight">{initials}</span>
                         
                         {/* Availability Dot - Always Visible */}
                         <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                           <div className={cn(
                             "w-2.5 h-2.5 rounded-full border border-white",
                             isAvailable ? "bg-emerald-500" : "bg-red-500"
                           )} />
                         </div>
                       </button>
                     </div>
                   );
                 })}
                 
                 {/* Interactive Add Button */}
                 <button 
                   type="button"
                   className="h-10 w-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                   title="Buscar más usuarios"
                 >
                   <Plus className="h-4 w-4" />
                 </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pb-20">
               <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notas</Label>
               <Textarea 
                 placeholder="Detalles adicionales..."
                 className="resize-none rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white min-h-[80px]"
                 value={formData.description}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               />
            </div>

          </div>

          {/* Fixed Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-white/0 pt-10">
             <Button
               type="submit"
               disabled={loading}
               className="w-full h-14 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] hover:to-[#D32F2F] text-white rounded-2xl shadow-xl shadow-red-600/30 text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3"
             >
               {loading ? "Guardando..." : "Guardar Reunión"}
               {!loading && <ArrowRight className="h-4 w-4" />}
             </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}
