"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  User, 
  Users as UsersIcon,
  Info,
  ChevronRight,
  MessageSquare,
  Trash2
} from "lucide-react";
import { 
  getMeetingWithDetails, 
  updateParticipantStatus, 
  sendChatMessage 
} from "@/lib/actions/work-logic";

interface MeetingDetailDialogProps {
  meetingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onDelete?: (meetingId: string) => void;
}

export function MeetingDetailDialog({
  meetingId,
  open,
  onOpenChange,
  userId,
  onDelete,
}: MeetingDetailDialogProps) {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msgContent, setMsgContent] = useState("");

  const refreshData = async () => {
    if (!meetingId) return;
    const data = await getMeetingWithDetails(meetingId);
    setMeeting(data);
  };

  useEffect(() => {
    if (open && meetingId) {
      refreshData();
    } else {
      setMeeting(null);
    }
  }, [open, meetingId]);

  const handleStatusChange = async (status: "ACEPTADO" | "RECHAZADO") => {
    if (!meetingId) return;
    setLoading(true);
    const res = await updateParticipantStatus(meetingId, userId, status);
    if (res.success) {
      refreshData();
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim() || !meetingId) return;
    
    const content = msgContent;
    setMsgContent("");
    
    const res = await sendChatMessage(meetingId, userId, content);
    if (res.success) {
      refreshData();
    }
  };

  const handleDelete = async () => {
    if (!meetingId || !onDelete) return;
    if (confirm("¿Estás seguro de eliminar esta reunión?")) {
      onDelete(meetingId);
      onOpenChange(false);
    }
  };

  if (!meeting) return null;

  const myParticipant = meeting.participants?.find((p: any) => p.userId === userId);
  const isWaitingMe = myParticipant?.status === "ESPERANDO";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[700px] border-none shadow-2xl h-[90vh] flex flex-col bg-white">
        <DialogDescription className="sr-only">
          Detalles de la reunión técnica o comercial, incluyendo participantes y chat en vivo.
        </DialogDescription>
        {/* Header Operativo Compacto */}
        <DialogHeader className="bg-white px-6 py-4 border-b border-slate-100 shrink-0 flex flex-row items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0 text-left">
             <div className="flex items-center gap-2 mb-1">
               <Badge className={cn(
                 "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                 meeting.status === "CONFIRMADA" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                 meeting.status === "CANCELADA" ? "bg-red-50 text-red-600 border-red-100" :
                 "bg-amber-50 text-amber-600 border-amber-100"
               )}>
                 {meeting.status}
               </Badge>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                 <Calendar className="h-3 w-3" />
                 {new Date(meeting.startDatetime).toLocaleDateString()}
               </span>
             </div>
             
             <DialogTitle className="text-lg font-bold text-[#0F172A] leading-tight truncate">
               {meeting.clientName}
             </DialogTitle>
             
             <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{meeting.address}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(meeting.startDatetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
             </div>
          </div>
          
          {/* Delete Button for Creator */}
          {meeting.createdBy === userId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        {/* Banner de Confirmación Inteligente (Sticky) */}
        {isWaitingMe && (
          <div className="bg-[#FFF1F2] border-b border-red-100 px-6 py-2.5 flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-bold text-red-900 uppercase tracking-widest">¿Confirmas asistencia?</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleStatusChange("RECHAZADO")}
                disabled={loading}
                variant="ghost" 
                className="h-8 px-3 text-[10px] font-black text-red-600 hover:bg-red-200/50 hover:text-red-700 rounded-lg transition-all"
              >
                RECHAZAR
              </Button>
              <Button 
                onClick={() => handleStatusChange("ACEPTADO")}
                disabled={loading}
                className="h-8 px-5 text-[10px] font-black bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
              >
                ACEPTAR
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 border-b border-slate-100 bg-slate-50/50">
            <TabsList className="bg-transparent h-14 gap-8 p-0">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none h-full font-bold text-slate-400 border-b-2 border-transparent transition-all"
              >
                DETALLES Y EQUIPO
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none h-full font-bold text-slate-400 border-b-2 border-transparent transition-all gap-2"
              >
                CHAT OPERATIVO
                <Badge className="bg-blue-600 text-[9px] h-4 w-4 p-0 flex items-center justify-center font-black text-white">
                  {meeting.messages?.filter((m: any) => m.type !== 'system').length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <TabsContent value="details" className="m-0 h-full p-8 space-y-8 overflow-y-auto">

              {/* Información General */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Descripción del Proyecto</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-600 text-sm font-medium leading-relaxed">
                    {meeting.description || "No hay detalles adicionales registrados."}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 text-slate-400">
                    <UsersIcon className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Estado del Equipo</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {meeting.participants?.map((p: any) => (
                      <div key={p.userId} className="relative flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-colors">
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                          <AvatarFallback className={cn(
                            "text-[10px] font-black text-white",
                            p.user?.role?.includes("ARCHITECT") ? "bg-orange-400" :
                            p.user?.role?.includes("CEO") ? "bg-blue-500" :
                            "bg-slate-700"
                          )}>
                            {p.user?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.user?.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{p.user?.role}</p>
                        </div>
                        
                        <div className={cn(
                          "absolute top-2 right-2 h-2 w-2 rounded-full ring-2 ring-white",
                          p.status === "ACEPTADO" ? "bg-emerald-500" :
                          p.status === "RECHAZADO" ? "bg-red-500" :
                          "bg-amber-400"
                        )} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="m-0 h-full flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {meeting.messages?.map((msg: any) => {
                    const isSystem = msg.type === 'system';
                    const isMe = msg.userId === userId;

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center px-4 py-1 bg-slate-50 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                          {!isMe && (
                            <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">
                              {msg.user?.name}
                            </span>
                          )}
                          <div className={cn(
                            "px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm text-left",
                            isMe 
                              ? "bg-blue-600 text-white rounded-tr-sm" 
                              : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-slate-300 font-medium mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <Input 
                  value={msgContent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMsgContent(e.target.value)}
                  placeholder="Escribe un mensaje operativo..." 
                  className="flex-1 bg-white border-slate-200 h-12 rounded-xl focus:ring-red-500/10 focus:border-red-500 font-medium"
                />
                <Button type="submit" className="bg-[#D32F2F] hover:bg-red-700 h-12 w-12 rounded-xl shadow-lg shadow-red-600/20">
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
