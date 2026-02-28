"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, XCircle, Calendar, Inbox, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button"; // Assuming Button exists or use HTML button

interface Meeting {
  id: string;
  clientName: string;
  address: string;
  description: string | null;
  type?: "VIRTUAL" | "PRESENCIAL";
  startDatetime: string;
  endDatetime: string;
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  createdBy?: string;
  userRole?: string; 
  myStatus?: "ACEPTADO" | "RECHAZADO" | "ESPERANDO"; // Added for confirmation flow
}

interface ModernAgendaProps {
  meetings: Meeting[];
  onEventClick: (meetingId: string) => void;
  onStatusUpdate?: (meetingId: string, status: "ACEPTADO" | "RECHAZADO") => void; // Callback for inline actions
  onNewMeetingRequest?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDIENTE": return "bg-orange-500";
    case "CONFIRMADA": return "bg-blue-500";
    case "CANCELADA": return "bg-red-600";
    case "COMPLETADA": return "bg-emerald-500";
    default: return "bg-slate-400";
  }
};

const getRoleColor = (role?: string) => {
  // Mapping roles to colors as requested: 
  // Architect -> Orange, CEO -> Blue, etc.
  // Defaulting to Azur Red/Slate if unknown
  const r = role?.toUpperCase() || "";
  if (r.includes("ARCHITECT") || r.includes("ARQUITECTO")) return "bg-orange-500 shadow-orange-500/30";
  if (r.includes("CEO") || r.includes("ADMIN")) return "bg-blue-600 shadow-blue-600/30";
  if (r.includes("COMMERCIAL")) return "bg-emerald-500 shadow-emerald-500/30";
  return "bg-[#D32F2F] shadow-red-600/30"; // Default Azur Red
};

export function ModernAgenda({ meetings, onEventClick, onStatusUpdate, onNewMeetingRequest, onDateChange }: ModernAgendaProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<"AGENDA" | "PENDING">("AGENDA");
  const [days, setDays] = useState<Date[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const start = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
    const generatedDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    setDays(generatedDays);
    
    // Auto-select today on first mount if we are in current week
    if (!selectedDate && weekOffset === 0) {
      setSelectedDate(startOfToday());
    }
  }, [weekOffset]);

  useEffect(() => {
    console.log("ModernAgenda mounted/updated. selectedDate:", selectedDate);
    if (selectedDate) {
      onDateChange?.(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  // Calculate stats
  const pendingCount = useMemo(() => meetings.filter(m => m.myStatus === "ESPERANDO").length, [meetings]);

  const filteredMeetings = useMemo(() => {
    if (!selectedDate && activeTab === "AGENDA") return [];
    if (activeTab === "PENDING") {
      return meetings.filter(m => m.myStatus === "ESPERANDO");
    }
    return meetings.filter(m => {
        if (!selectedDate) return false;
        return isSameDay(new Date(m.startDatetime), selectedDate);
    }).sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime());
  }, [meetings, selectedDate, activeTab]);

  useEffect(() => {
    if (activeTab === "AGENDA" && selectedDate) {
        const selectedIndex = days.findIndex(day => isSameDay(day, selectedDate));
        if (selectedIndex !== -1 && itemRefs.current[selectedIndex]) {
        itemRefs.current[selectedIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
        }
    }
  }, [selectedDate, days, activeTab]);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 space-y-6 min-h-[600px] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none" />
      
      {/* Header & Tabs */}
      <div className="px-2 space-y-6 relative z-10">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                {activeTab === "AGENDA" ? (
                    <>
                        {selectedDate && isSameDay(selectedDate, new Date()) && (
                            <span className="block text-red-600 text-[10px] uppercase tracking-[0.3em] font-black mb-1 animate-pulse">Hoy</span>
                        )}
                         <span className="capitalize block">
                            {selectedDate ? (
                              <>
                                {format(selectedDate, "EEEE", { locale: es })} <span className="text-red-600">{format(selectedDate, "d")}</span>
                              </>
                            ) : (
                                <span className="opacity-0">Cargando...</span>
                            )}
                        </span>
                    </>
                ) : (
                    <span className="flex items-center gap-3">
                        <Inbox className="h-8 w-8 text-red-600" />
                        Por Confirmar
                    </span>
                )}
            </h2>
          </div>

          {/* Inbox Strategy Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("AGENDA")}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    activeTab === "AGENDA" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                  Mi Agenda
              </button>
              <button
                onClick={() => setActiveTab("PENDING")}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                    activeTab === "PENDING" ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                  Por Confirmar
                  {pendingCount > 0 && (
                      <span className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center text-[9px] text-white",
                          activeTab === "PENDING" ? "bg-red-600" : "bg-slate-300"
                      )}>
                          {pendingCount}
                      </span>
                  )}
              </button>
          </div>
      </div>

      {/* Date Picker (Only for Agenda) */}
      <AnimatePresence mode="popLayout">
          {activeTab === "AGENDA" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center justify-between px-0 relative z-10 overflow-hidden"
              >
                <button 
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-red-600 flex items-center justify-center hidden md:flex"
                >
                  <ChevronLeft className="h-6 w-6 stroke-[3px]" />
                </button>

                <div 
                  ref={scrollContainerRef}
                  className="flex flex-1 items-end px-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth pb-4"
                >
                  {days.map((day, idx) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate); // Ensure selectedDate is not null
                    const isToday = isSameDay(day, new Date());
                    const hasMeetings = meetings.some(m => isSameDay(new Date(m.startDatetime), day));
                    
                    return (
                      <button
                        key={day.toISOString()}
                        ref={el => { itemRefs.current[idx] = el; }}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "flex flex-col items-center shrink-0 w-1/4 md:w-auto md:min-w-[70px] transition-all duration-300 relative group snap-center gap-2",
                          isSelected ? "text-slate-900 scale-105" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest transition-colors",
                          isSelected ? "text-red-600" : "text-slate-400 opacity-70"
                        )}>
                          {format(day, "EEE", { locale: es })}
                        </span>
                        
                        <div className={cn(
                          "w-9 h-9 flex items-center justify-center rounded-xl transition-all relative z-10 border-2",
                          isSelected ? "bg-[#D32F2F] border-[#D32F2F] text-white shadow-lg shadow-red-500/30" : "bg-white border-transparent text-slate-900 group-hover:border-slate-200"
                        )}>
                          <span className="text-sm font-black">{format(day, "d")}</span>
                        </div>
                        
                        {/* Dots */}
                        <div className="h-1 mt-1 flex items-center justify-center">
                          {!isSelected && hasMeetings && <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-red-600 flex items-center justify-center hidden md:flex"
                >
                  <ChevronRight className="h-6 w-6 stroke-[3px]" />
                </button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Events List */}
      <div className="space-y-4 px-1 relative z-10 pb-4">
        <AnimatePresence mode="popLayout">
          {filteredMeetings.length > 0 ? (
            <div className="space-y-4 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:space-y-0 sm:gap-4 lg:gap-6">
              {filteredMeetings.map((meeting) => (
                <motion.div 
                  layout
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                  onClick={() => onEventClick(meeting.id)}
                  className={cn(
                    "bg-white rounded-[1.25rem] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full",
                  )}
                >
                  {/* Status Strip */}
                  <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", getStatusColor(meeting.status))} />
                  
                  <div className="flex flex-col gap-3 pl-3">
                    {/* Header: Title and Avatar */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-[15px] font-bold text-slate-900 leading-normal group-hover:text-red-600 transition-colors">
                            {meeting.clientName}
                            </h3>
                            {meeting.type === "VIRTUAL" && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                                    Virtual
                                </span>
                            )}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[10px] font-black text-slate-500">
                            {meeting.clientName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 min-w-0">
                        <MapPin className="h-4 w-4 text-slate-300 shrink-0" />
                        <span className="truncate">{meeting.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Clock className="h-4 w-4 text-blue-300/80 shrink-0" />
                        <span className="tabular-nums">
                          {format(new Date(meeting.startDatetime), "hh:mm a")} - {format(new Date(meeting.endDatetime), "hh:mm a")}
                        </span>
                      </div>
                    </div>
                    
                    {/* Inbox Action Footer (Only for Pending Tab) */}
                    {activeTab === "PENDING" && (
                        <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                             <Button 
                               size="sm"
                               variant="outline"
                               className="flex-1 h-10 rounded-xl border-slate-200/80 bg-white text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-100 font-black text-[10px] uppercase tracking-wider transition-all"
                               onClick={(e) => {
                                   e.stopPropagation();
                                   onStatusUpdate?.(meeting.id, "RECHAZADO");
                               }}
                             >
                                 Rechazar
                             </Button>
                             <Button 
                               size="sm"
                               className="flex-[1.5] h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                               onClick={(e) => {
                                   e.stopPropagation();
                                   onStatusUpdate?.(meeting.id, "ACEPTADO");
                               }}
                             >
                                 Aceptar
                             </Button>
                        </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-slate-300 gap-4"
            >
              <Inbox className="h-12 w-12 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">
                {activeTab === "PENDING" ? "Todo al día" : "Sin actividades"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
