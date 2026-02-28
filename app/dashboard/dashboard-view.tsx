"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "./data-table"
import { 
  userColumns, 
  meetingColumns, 
  projectColumns,
  fileColumns,
  type User, 
  type Meeting,
  type Project,
  type ProjectFile,
  type Lead
} from "./columns"
import { LeadsView } from "./leads-view";
import { UserStepperDialog } from "./user-stepper-dialog"
import { ProjectStepperDialog } from "./project-stepper-dialog";
import { ProjectDetailDialog } from "@/app/dashboard/project-detail-dialog";
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  LogOut, 
  LayoutDashboard, 
  Zap, 
  Activity, 
  Target,
  FolderOpen,
  Layers,
  Search,
  FileBox,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/actions/auth"
import { isToday } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveMeetingsToLocal, getLocalMeetings, clearAllLocalData } from "@/lib/db/pwa-db"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useEffect, useState } from "react"
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardViewProps {
  initialUsers: any[]
  initialMeetings: any[]
  initialProjects: any[]
  user: {
    name: string;
    role: string;
    username: string;
  } | null
  initialLeads: Lead[]
  leadStats: any
}

export function DashboardView({ initialUsers, initialMeetings, initialProjects, initialLeads, leadStats, user }: DashboardViewProps) {
  const [isUserStepperOpen, setIsUserStepperOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForFiles, setSelectedProjectForFiles] = useState<any | null>(null);

  const openProjectFiles = (project: any) => {
    setSelectedProjectForFiles(project);
    setIsProjectModalOpen(true);
  };
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Meetings SWR
  const { data: swrMeetings } = useSWR("/api/meetings", fetcher, {
    fallbackData: initialMeetings,
    refreshInterval: 60000,
  });

  const [meetings, setMeetings] = useState<any[]>(initialMeetings);
  const [projects, setProjects] = useState<any[]>(initialProjects);

  useEffect(() => {
    if (isOnline) {
      if (swrMeetings) {
        setMeetings(swrMeetings);
        saveMeetingsToLocal(swrMeetings);
      }
    } else {
      getLocalMeetings().then(setMeetings);
    }
  }, [isOnline, swrMeetings]);

  const handleLogout = async () => {
    await clearAllLocalData();
    await logout();
    router.push("/");
  };

  // Stats
  const totalUsers = initialUsers.length;
  const activeUsers = initialUsers.filter(u => u.status !== "inactive").length;
  const meetingsToday = meetings.filter(m => isToday(new Date(m.startDatetime))).length;
  const totalProjects = initialProjects.length;

  // Data mapping for tables
  const displayUsers: User[] = initialUsers.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    status: u.status || "active",
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "---",
    phone: u.phone,
    partnerType: u.role === "ARCHITECT" ? "Técnico" : u.role === "COMMERCIAL" ? "Comercial" : undefined
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
    endDate: m.endDatetime,
    status: m.status.toLowerCase() as any,
    createdBy: m.creator?.name || m.createdBy || "---",
    userRole: m.creator?.role
  }));

  const displayProjects: Project[] = projects.map(p => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    createdAt: p.createdAt || "---",
    filesCount: p.archivos?.length || 0,
    driveFolderLink: p.driveFolderLink,
    onViewFiles: () => openProjectFiles(p)
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      <UserStepperDialog 
        open={isUserStepperOpen} 
        onOpenChange={setIsUserStepperOpen} 
      />

      <ProjectStepperDialog 
        open={isProjectModalOpen && !selectedProjectForFiles} 
        onOpenChange={(val: boolean) => {
          setIsProjectModalOpen(val);
          if (!val) setSelectedProjectForFiles(null);
        }} 
      />

      <ProjectDetailDialog
        open={isProjectModalOpen && !!selectedProjectForFiles}
        onOpenChange={(val: boolean) => {
          setIsProjectModalOpen(val);
          if (!val) setSelectedProjectForFiles(null);
        }}
        project={selectedProjectForFiles}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="bg-slate-950 p-2 rounded-xl">
               <LayoutDashboard className="h-5 w-5 text-white" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Azur Control Maestro</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium ml-1">
            Gestión centralizada para <span className="text-red-600 font-bold">Azur Global</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/work" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors mr-4">
            <Activity className="h-4 w-4" />
            Vista Operativa
          </Link>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block mr-2" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 gap-2 font-bold h-11 px-6 rounded-xl border border-transparent hover:border-red-100 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agenda" className="space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <TabsList className="bg-white border border-slate-200 p-1 h-14 md:h-16 rounded-2xl md:rounded-3xl shadow-sm flex overflow-x-auto w-full xl:w-fit justify-start no-scrollbar hide-scrollbar">
            <TabsTrigger 
              value="agenda" 
              className="rounded-xl md:rounded-2xl px-6 md:px-8 h-full data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Agenda Global
            </TabsTrigger>
            <TabsTrigger 
              value="proyectos" 
              className="rounded-xl md:rounded-2xl px-6 md:px-8 h-full data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              <FileBox className="h-4 w-4 mr-2" />
              Gestión Proyectos
            </TabsTrigger>
            <TabsTrigger 
              value="leads" 
              className="rounded-xl md:rounded-2xl px-6 md:px-8 h-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Leads & CRM
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/50 w-full xl:w-auto shrink-0 justify-between xl:justify-end">
             <div className="flex flex-col xl:items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Sistema</span>
               <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  <div className={cn("h-2 w-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
               </div>
             </div>
          </div>
        </div>

        <TabsContent value="agenda" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Bar */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard title="Usuarios Totales" value={totalUsers} icon={<Users className="text-blue-600" />} sub="Cuentas activas" color="blue" />
            <StatCard title="Operando Hoy" value={activeUsers} icon={<Activity className="text-emerald-500" />} sub="En campo/oficina" color="emerald" />
            <StatCard title="Carga Agenda" value={meetingsToday} icon={<Zap className="text-red-600" />} sub="Reuniones hoy" color="red" />
            <StatCard title="Total Proyectos" value={totalProjects} icon={<Layers className="text-orange-500" />} sub="Activos en sistema" color="orange" />
          </div>

          {/* Tables Section */}
          <div className="grid lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-2 border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden bg-white rounded-[2rem]">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tighter">Usuarios</CardTitle>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Colaboradores Azur</p>
                </div>
                <Button 
                  onClick={() => setIsUserStepperOpen(true)}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] h-9 px-4"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> NUEVO
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <DataTable columns={userColumns} data={displayUsers} filterColumn="name" />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden bg-white rounded-[2rem]">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tighter">Reuniones Programadas</CardTitle>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Agenda técnica & comercial</p>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] h-9 text-[10px] font-black uppercase rounded-xl">
                    <SelectValue placeholder="FILTRAR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">TODOS</SelectItem>
                    <SelectItem value="COMM">COMERCIAL</SelectItem>
                    <SelectItem value="TECH">TÉCNICO</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <DataTable columns={meetingColumns} data={displayMeetings} dateFilter={true} filterColumn="client" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proyectos" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-slate-200 shadow-2xl shadow-slate-200/30 overflow-hidden bg-white rounded-[2.5rem]">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="bg-red-600 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <FolderOpen className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Repositorio de Proyectos</CardTitle>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Gestión de expedientes técnicos y visualización 3D</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setSelectedProjectForFiles(null);
                  setIsProjectModalOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] h-12 px-8 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 gap-2"
              >
                <Plus className="h-5 w-5" />
                NUEVO PROYECTO
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <DataTable columns={projectColumns} data={displayProjects} filterColumn="nombre" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <LeadsView leads={initialLeads} stats={leadStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, icon, sub, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-500",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-500"
  };

  return (
    <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-xl", colors[color])}>
            {React.cloneElement(icon, { size: 20 })}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value}</div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub}</p>
      </CardContent>
    </Card>
  );
}
