"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { deleteMeetingAction, updateParticipantStatus } from "@/lib/actions/work-logic";
import { ModernAgenda } from "./modern-agenda";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Settings,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { ProfileConfigDialog } from "./profile-config-dialog";
import { MeetingDetailDialog } from "./meeting-detail-dialog";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface WorkDashboardContentProps {
  initialMeetings: any[];
  user: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WorkDashboardContent({ initialMeetings, user }: WorkDashboardContentProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const { data: meetings, mutate } = useSWR("/api/meetings", fetcher, {
    fallbackData: initialMeetings,
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [error]);
  
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const displayUser = {
    id: user?.id,
    name: user?.name || "Usuario",
    role: user?.role || "GUEST",
    roleDisplay: user?.role === "ARCHITECT" ? "Socio Técnico" : user?.role === "COMMERCIAL" ? "Socio Comercial" : user?.role || "Invitado"
  };

  // Augment meetings with myStatus for the Inbox Strategy
  const augmentedMeetings = (meetings || []).map((meeting: any) => {
    const myParticipant = meeting.participants?.find((p: any) => p.userId === displayUser.id);
    return {
      ...meeting,
      myStatus: myParticipant?.status || "ACEPTADO" // Default to accepted if not a participant (creator)
    };
  });

  const meetingsCount = augmentedMeetings.length;
  const pendingCountByMe = augmentedMeetings.filter((m: any) => m.myStatus === "ESPERANDO").length;
  const confirmedCount = augmentedMeetings.filter((m: any) => m.status === "CONFIRMADA").length;

  const handleEventClick = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setIsDetailOpen(true);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    // Optimistic UI Update: Filter out the deleted meeting immediately
    const updatedMeetings = meetings.filter((m: any) => m.id !== meetingId);
    mutate(updatedMeetings, false); // Update locally without revalidating yet

    try {
      const res = await deleteMeetingAction(meetingId);
      if (!res.success) {
        // If it failed, rollback (revalidate from server)
        mutate();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      mutate();
    }
  };

  const handleStatusUpdate = async (meetingId: string, status: "ACEPTADO" | "RECHAZADO") => {
    try {
      const res = await updateParticipantStatus(meetingId, displayUser.id, status);
      if (res.success) {
        mutate();
      } else {
        alert("Error al actualizar estado: " + res.error);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      
      <NewMeetingDialog 
        open={isNewMeetingOpen} 
        onOpenChange={setIsNewMeetingOpen} 
        userId={displayUser.id} 
      />
      
      <ProfileConfigDialog 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        userId={displayUser.id} 
      />

      <MeetingDetailDialog 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        meetingId={selectedMeetingId} 
        userId={displayUser.id} 
        onDelete={handleDeleteMeeting}
      />

      {/* Static Header Section - Premium Floating Card Style */}
      <div className="px-4 pt-4 lg:px-8 lg:pt-8">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative background element inside header */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest mb-1">
              <LayoutDashboard className="h-3 w-3" />
              Panel de Trabajo Operativo
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Hola, <span className="text-red-600">{displayUser.name.split(' ')[0]}</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            {user?.username === "fortex" && (
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                   className="border-slate-200 text-slate-700 font-bold gap-2 rounded-xl h-12 px-6 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Button>
              </Link>
            )}

            <Button 
              variant="outline" 
              className="border-slate-200 text-slate-600 font-bold gap-2 rounded-xl h-12 px-6 hover:bg-slate-50 hover:text-red-600 transition-colors"
              onClick={() => setIsProfileOpen(true)}
            >
              <Settings className="h-4 w-4" />
              <span>Mi Disponibilidad</span>
            </Button>

            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 lg:p-8 space-y-8 pt-4">
        
        {/* Status Badges Row  */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-blue-50/50 border border-blue-100 px-4 py-2 rounded-full text-blue-700 transition-all hover:bg-blue-50">
             <CalendarIcon className="h-4 w-4 opacity-70" />
             <span className="text-lg font-black leading-none">{meetingsCount}</span>
             <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total</span>
          </div>
          
          <div className="flex items-center gap-2.5 bg-orange-50/50 border border-orange-100 px-4 py-2 rounded-full text-orange-700 transition-all hover:bg-orange-50">
             <Clock className="h-4 w-4 opacity-70" />
             <span className="text-lg font-black leading-none">{pendingCountByMe}</span>
             <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Pendientes</span>
          </div>

          <div className="flex items-center gap-2.5 bg-red-50/50 border border-red-100 px-4 py-2 rounded-full text-red-700 transition-all hover:bg-red-50">
             <CheckCircle2 className="h-4 w-4 opacity-70" />
             <span className="text-lg font-black leading-none">{confirmedCount}</span>
             <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Confirmadas</span>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="bg-red-600 h-6 w-1 rounded-full" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Calendario de Actividades</h2>
          </div>
          
          <ModernAgenda 
            meetings={augmentedMeetings as any} 
            onEventClick={handleEventClick} 
            onStatusUpdate={handleStatusUpdate}
          />
        </div>

      </div>

      {/* Floating Action Button for New Task */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsNewMeetingOpen(true)}
          className="bg-[#D32F2F] hover:bg-red-700 text-white rounded-full h-14 w-14 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.6)] active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus className="h-7 w-7" strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}
