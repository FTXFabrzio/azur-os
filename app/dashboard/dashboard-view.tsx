"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "./data-table"
import { userColumns, meetingColumns, type User, type Meeting } from "./columns"
import { UserStepperDialog } from "./user-stepper-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users, CalendarDays, CheckCircle2, Clock, ArrowRight, LogOut, LayoutDashboard, Zap, Activity, Target } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/actions/auth"
import { isToday } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveMeetingsToLocal, getLocalMeetings } from "@/lib/db/pwa-db"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useEffect, useState } from "react"

interface DashboardViewProps {
  initialUsers: any[]
  initialMeetings: any[]
  user: {
    name: string;
    role: string;
  } | null
}

export function DashboardView({ initialUsers, initialMeetings, user }: DashboardViewProps) {
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [meetings, setMeetings] = useState<any[]>(initialMeetings);
  const isOnline = useOnlineStatus();
  const router = useRouter();

  useEffect(() => {
    if (isOnline) {
      setMeetings(initialMeetings);
      saveMeetingsToLocal(initialMeetings);
    } else {
      getLocalMeetings().then(setMeetings);
    }
  }, [isOnline, initialMeetings]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Calculate KPIs
  const totalUsers = initialUsers.length;
  const activeUsers = initialUsers.filter(u => u.status !== "inactive").length; // Mock or real status
  
  const meetingsToday = meetings.filter(m => isToday(new Date(m.startDatetime))).length;
  const confirmedMeetings = meetings.filter(m => m.status === "CONFIRMADA").length;
  const totalMeetings = meetings.length;
  const efficiency = totalMeetings > 0 ? Math.round((confirmedMeetings / totalMeetings) * 100) : 0;

  // Map users to match the column expectations
  const displayUsers: User[] = initialUsers.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    status: u.status || "active",
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "---",
    phone: u.phone,
    partnerType: u.role === "ARCHITECT" ? "Socio Técnico" : u.role === "COMMERCIAL" ? "Socio Comercial" : undefined
  }));

  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredMeetings = meetings.filter(m => {
    if (roleFilter === "ALL") return true;
    if (roleFilter === "TECH") return m.creator?.role === "ARCHITECT";
    if (roleFilter === "COMM") return m.creator?.role === "COMMERCIAL";
    return true;
  });

  const displayMeetings: Meeting[] = filteredMeetings.map(m => ({
    id: m.id,
    client: m.clientName,
    address: m.address,
    date: m.startDatetime,
    status: m.status.toLowerCase() as any,
    createdBy: m.creator?.name || m.createdBy || "---",
    userRole: m.creator?.role
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 animate-in fade-in duration-700">
      
      <UserStepperDialog 
        open={isStepperOpen} 
        onOpenChange={setIsStepperOpen} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Control Maestro</h1>
             <Link href="/work" className="bg-[#D32F2F] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all active:scale-95">
                <CalendarDays className="h-4 w-4" />
                VISTA OPERATIVA
             </Link>
          </div>
          <p className="text-slate-500 font-medium">
            Bienvenido, <span className="text-blue-600 font-bold">{user?.name || "Superadmin Fortex"}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 gap-2 font-bold h-10 px-4 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      {/* Stats Section - CEO Intelligence */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Usuarios Activos</CardTitle>
            <Activity className="h-5 w-5 text-blue-600 relative z-10" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{activeUsers}</div>
              <div className="text-sm font-bold text-slate-400">/ {totalUsers}</div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operando ahora</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Carga de Trabajo</CardTitle>
            <Zap className="h-5 w-5 text-red-600 relative z-10" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{meetingsToday}</div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Reuniones asignadas hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Eficiencia Global</CardTitle>
            <Target className="h-5 w-5 text-emerald-500 relative z-10" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{efficiency}%</div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Tasa de confirmación</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Section Card */}
      <Card className="border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden bg-white rounded-[1.5rem]">
        <CardHeader className="border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 px-6 md:px-8 gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="bg-blue-600 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                    <Users className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-0.5">
                    <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Gestión de Usuarios</CardTitle>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Control administrativo de acceso y roles operativos</p>
                </div>
            </div>
            <Button
                size="sm"
                className="w-full sm:w-auto h-11 px-8 text-[11px] font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95 gap-2 rounded-xl"
                onClick={() => setIsStepperOpen(true)}
            >
                <Plus className="h-4 w-4 stroke-[3px]" />
                NUEVO USUARIO
            </Button>
        </CardHeader>
        <CardContent className="p-4 md:p-8">
            <DataTable columns={userColumns} data={displayUsers} filterColumn="name" />
        </CardContent>
      </Card>

      {/* Meetings Section */}
       <div className="space-y-6 pt-6">
        <Card className="border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden bg-white rounded-[1.5rem]">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between py-6 px-6 md:px-8 gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-900 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/10">
                        <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Próximas Reuniones</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Visibilidad global de la agenda técnica y comercial</p>
                    </div>
                </div>
                
                <div className="w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full md:w-[220px] bg-white border-slate-200 h-11 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                            <div className="flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-slate-400" />
                                <SelectValue placeholder="FILTRAR POR AREA" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="ALL" className="text-[10px] font-bold uppercase py-2.5">TODAS LAS AREAS</SelectItem>
                            <SelectItem value="COMM" className="text-[10px] font-bold uppercase py-2.5">EQUIPO COMERCIAL</SelectItem>
                            <SelectItem value="TECH" className="text-[10px] font-bold uppercase py-2.5">EQUIPO TÉCNICO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
                <DataTable columns={meetingColumns} data={displayMeetings} dateFilter={true} filterColumn="client" />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
