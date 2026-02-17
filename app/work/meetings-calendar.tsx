"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Clock, Info, User } from "lucide-react";

interface Meeting {
  id: string;
  clientName: string;
  address: string;
  description: string | null;
  startDatetime: string;
  endDatetime: string;
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  createdBy?: string;
}

interface MeetingsCalendarProps {
  meetings: Meeting[];
  onEventClick?: (meetingId: string) => void;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "PENDIENTE":
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500",
        text: "text-orange-700",
        hex: "#f97316",
      };
    case "CONFIRMADA":
      return {
        bg: "bg-green-500/10",
        border: "border-green-500",
        text: "text-green-700",
        hex: "#22c55e",
      };
    case "CANCELADA":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500",
        text: "text-red-700",
        hex: "#ef4444",
      };
    case "COMPLETADA":
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500",
        text: "text-blue-700",
        hex: "#3b82f6",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        border: "border-slate-500",
        text: "text-slate-700",
        hex: "#64748b",
      };
  }
};

export function MeetingsCalendar({ meetings, onEventClick }: MeetingsCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const events = meetings.map((m) => {
    const styles = getStatusStyles(m.status);
    return {
      id: m.id,
      title: `${m.clientName} - ${m.address}`,
      start: m.startDatetime,
      end: m.endDatetime,
      extendedProps: {
        ...m,
        styles,
      },
      backgroundColor: styles.hex + "33", // 20% opacity
      borderColor: styles.hex,
      textColor: "#1e293b",
    };
  });

  const handleEventClick = (info: any) => {
    if (onEventClick) {
      onEventClick(info.event.id);
    } else {
      setSelectedEvent(info.event.extendedProps);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 lg:p-6 overflow-x-auto calendar-container">
      <style jsx global>{`
        .fc {
          --fc-border-color: #e2e8f0;
          --fc-daygrid-event-dot-width: 8px;
          --fc-today-bg-color: #f1f5f9;
          font-family: inherit;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: capitalize;
        }
        .fc .fc-button-primary {
          background-color: #fff;
          border-color: #e2e8f0;
          color: #64748b;
          font-weight: 600;
          font-size: 0.75rem; /* Smaller font on mobile */
          padding: 0.4rem 0.8rem;
          text-transform: capitalize;
          transition: all 0.2s;
        }
        .fc .fc-button-primary:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }
        .fc .fc-col-header-cell-cushion {
          padding: 10px 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .fc-event {
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem;
          }
          .fc .fc-button {
             padding: 0.25rem 0.5rem;
             font-size: 0.65rem;
          }
        }
        /* Mobile specific event styling */
        .fc-v-event {
          border: none !important;
          border-left: 3px solid var(--fc-event-border-color) !important;
          padding-left: 4px;
        }
      `}</style>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek",
        }}
        locale={esLocale}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        aspectRatio={1.35}
        expandRows={true}
        nowIndicator={true}
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: "08:00",
          endTime: "19:00",
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          {selectedEvent && (
            <>
              <DialogHeader className={`p-6 text-white relative ${selectedEvent.styles.bg.replace('/10', '')} ${selectedEvent.styles.border}`}>
                {/* Fallback for the background if the class replacement doesn't work perfectly in JIT */}
                <div className="absolute inset-0 bg-[#1a1c1e] -z-10" />
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${selectedEvent.styles.bg} ${selectedEvent.styles.border} ${selectedEvent.styles.text} border px-3 py-1`}>
                    {selectedEvent.status}
                  </Badge>
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {selectedEvent.clientName}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2 text-slate-300">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{selectedEvent.address}</span>
                </div>
              </DialogHeader>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Inicio</div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {new Date(selectedEvent.startDatetime).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Fin</div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {new Date(selectedEvent.endDatetime).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Info className="h-3 w-3" />
                    Descripción
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-600 text-sm leading-relaxed min-h-[80px]">
                    {selectedEvent.description || "Sin descripción proporcionada."}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 text-slate-500 text-xs border-t border-slate-100">
                  <User className="h-3.5 w-3.5" />
                  <span>ID de reunión: {selectedEvent.id}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
