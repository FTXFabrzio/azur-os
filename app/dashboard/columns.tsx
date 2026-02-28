"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { 
  UserCircle, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  MoreHorizontal,
  UserCog,
  Key,
  Clock,
  Link,
  FileText,
  Layers,
  Folder,
  Briefcase,
  Building,
  Eye,
  CalendarCheck,
  Archive,
  Pencil,
  MessageSquareMore,
  ExternalLink,
  Zap
} from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "./data-table-header"

export type User = {
  id: string
  name: string
  username: string
  role: string
  phone?: string
  status: string
  createdAt: string
  partnerType?: string
}

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre Completo" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-slate-100 p-2 rounded-xl group-hover/row:bg-blue-100 transition-colors">
            <UserCircle className="h-5 w-5 text-slate-500 group-hover/row:text-blue-600 transition-colors" />
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
            row.original.status === "inactive" ? "bg-slate-300" : "bg-emerald-500"
          )} />
        </div>
        <div>
          <div className="text-slate-900 font-bold text-sm tracking-tight leading-none mb-1">
            {row.getValue("name")}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-[9px] px-1.5 py-0 font-black uppercase tracking-tighter border-none",
              row.original.role === "SUPERADMIN" ? "bg-blue-600 text-white" :
              row.original.role === "COMMERCIAL" ? "bg-red-600 text-white" :
              "bg-orange-500 text-white"
            )}>
              {row.original.role}
            </Badge>
            {row.original.partnerType && (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.original.partnerType}</span>
            )}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacto" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <Phone className="h-3.5 w-3.5 text-slate-400" />
        {row.getValue("phone") || "Sin teléfono"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const isActive = row.getValue("status") === "active"
      return (
        <Badge 
          variant={isActive ? "default" : "secondary"}
          className={isActive 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-none" 
            : "bg-slate-100 text-slate-500 border-slate-200 shadow-none"
          }
        >
          <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] rounded-xl border-slate-200">
          <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 py-2">Opciones de Control</DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 text-xs font-bold py-2.5 cursor-pointer">
            <UserCog className="h-3.5 w-3.5 text-slate-400" />
            Editar Permisos
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-xs font-bold py-2.5 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
            <Key className="h-3.5 w-3.5" />
            Resetear Contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-xs font-bold py-2.5 text-slate-400">
            ID: {row.original.id.substring(0, 8)}...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export type Meeting = {
  id: string
  client: string
  address: string
  date: string
  endDate: string
  status: "pending" | "confirmed" | "cancelled" | "pendiente" | "confirmada" | "cancelada"
  createdBy: string
  userRole?: string
}

export const meetingColumns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "client",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha y Hora" />,
    cell: ({ row }) => {
        const start = new Date(row.original.date)
        const end = new Date(row.original.endDate)
        
        let dateLabel = format(start, "EEE d", { locale: es })
        if (isToday(start)) dateLabel = "Hoy"
        else if (isTomorrow(start)) dateLabel = "Mañana"

        const timeRange = `${format(start, "hh:mm a")} - ${format(end, "hh:mm a")}`

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-red-500" />
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-tighter">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[13px] font-bold text-slate-700">
                {timeRange}
              </span>
            </div>
          </div>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status as string
      let className = ""

      if (status === "pending" || status === "pendiente") {
        className = "bg-amber-50 text-amber-600 border-amber-100"
      } else if (status === "confirmed" || status === "confirmada") {
        className = "bg-emerald-50 text-emerald-600 border-emerald-100"
      } else if (status === "cancelled" || status === "cancelada") {
        className = "bg-red-50 text-red-600 border-red-100"
      }

      return <Badge className={cn("shadow-none border py-0 text-[10px] font-black uppercase tracking-widest", className)} variant="outline">{status}</Badge>
    },
  },
  {
    accessorKey: "createdBy",
    header: "Asignado a",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700">{row.original.createdBy}</span>
        <Badge className={cn(
          "text-[8px] px-1 py-0 font-black border-none",
          row.original.userRole === "ARCHITECT" ? "bg-orange-500/10 text-orange-600" : "bg-red-500/10 text-red-600"
        )}>
          {row.original.userRole === "ARCHITECT" ? "TECH" : "COMM"}
        </Badge>
      </div>
    )
  },
]

export type Project = {
  id: string;
  nombre: string;
  codigo: string;
  driveFolderLink?: string | null;
  createdAt: string;
  filesCount: number;
  onViewFiles?: () => void;
}

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "codigo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono text-xs font-bold tracking-widest shadow-lg shadow-slate-900/10 w-fit">
        {row.getValue("codigo")}
      </div>
    ),
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Proyecto" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{row.getValue("nombre")}</span>
        <span className="text-[10px] text-slate-400 font-medium">Creado el {format(new Date(row.original.createdAt), "PPP", { locale: es })}</span>
      </div>
    ),
  },
  {
    accessorKey: "filesCount",
    header: "Documentación",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] font-black border-slate-200">
          {row.original.filesCount} ARCHIVOS
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-wider px-3"
          onClick={() => row.original.onViewFiles?.()}
        >
          Ver Archivos
        </Button>
        {row.original.driveFolderLink && (
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <a href={row.original.driveFolderLink} target="_blank" rel="noopener noreferrer">
              <Folder className="h-4 w-4 text-slate-400" />
            </a>
          </Button>
        )}
      </div>
    ),
  },
]

export type ProjectFile = {
  id: string;
  etiqueta: string;
  descripcion: string;
  driveFileLink: string;
  pesoKb?: number;
  prioridad: number;
  createdAt: string;
}

export const fileColumns: ColumnDef<ProjectFile>[] = [
  {
    accessorKey: "etiqueta",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-black uppercase">
        {row.getValue("etiqueta")}
      </Badge>
    ),
  },
  {
    accessorKey: "descripcion",
    header: "Archivo",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-slate-300" />
        <span className="text-xs font-bold text-slate-700">{row.getValue("descripcion")}</span>
      </div>
    ),
  },
  {
    accessorKey: "pesoKb",
    header: "Tamaño",
    cell: ({ row }) => (
      <span className="text-[10px] font-medium text-slate-400">
        {row.original.pesoKb ? `${(row.original.pesoKb / 1024).toFixed(2)} MB` : "--"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
        <a href={row.original.driveFileLink} target="_blank" rel="noopener noreferrer">
          <Link className="h-4 w-4" />
        </a>
      </Button>
    ),
  },
]

export type Lead = {
  id: string;
  kommoId: string;
  brand: "AZUR" | "COCINAPRO";
  category: string;
  contactName: string;
  phone: string | null;
  leadEntryDate: string | null;
  status: string | null;
  createdAt: string | null;
  prospect?: any;
  businessResource?: any;
  discardReason?: any;
}

export const leadColumns: (
  onView: (lead: Lead) => void, 
  onSchedule: (lead: Lead) => void, 
  onArchive: (lead: Lead) => void,
  onEdit: (lead: Lead) => void,
  onAttempt: (lead: Lead) => void,
  onHold: (lead: Lead) => void
) => ColumnDef<Lead>[] = (onView, onSchedule, onArchive, onEdit, onAttempt, onHold) => [
  {
    accessorKey: "waitingDays",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Días" />,
    cell: ({ row }) => {
        const entryDate = row.original.leadEntryDate || row.original.createdAt;
        const days = entryDate ? differenceInDays(new Date(), new Date(entryDate)) : 0;
        return (
            <div className="flex flex-col items-center">
                <span className={cn(
                    "text-xs font-black",
                    days > 7 ? "text-red-500" : days > 3 ? "text-amber-500" : "text-slate-400"
                )}>{days}d</span>
            </div>
        )
    }
  },
  {
    accessorKey: "kommoId",
    header: "ID Kommo",
    cell: ({ row }) => {
        const val = row.original.kommoId || "";
        if (val.trim().toLowerCase().startsWith('http')) {
            return (
                <a href={val.trim()} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> LINK
                </a>
            )
        }
        return <span className="text-[10px] font-mono text-slate-400">{val.substring(0, 8)}</span>
    }
  },
  {
    accessorKey: "contactName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Lead / Cliente" />,
    cell: ({ row }) => {
      const kommoVal = row.original.kommoId || "";
      let displayId = kommoVal;
      let fullLink = kommoVal.trim().toLowerCase().startsWith('http') ? kommoVal.trim() : null;

      if (fullLink) {
          // Extraer el último ID numérico antes de los parámetros de consulta o al final
          const match = fullLink.match(/\/(\d+)(\?|$)/);
          if (match) displayId = match[1];
          else displayId = "LINK";
      }

      return (
        <div className="flex items-center gap-4 py-1">
          <div className={cn(
            "p-2 rounded-xl",
            row.original.brand === "AZUR" ? "bg-slate-900" : "bg-red-600"
          )}>
            {row.original.category === "JOB_CANDIDATE" ? (
              <Briefcase className="h-4 w-4 text-white" />
            ) : (
              <Building className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <div 
                className="text-slate-900 font-bold text-sm tracking-tight leading-none mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onView(row.original)}
            >
              {row.getValue("contactName")}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                row.original.brand === "AZUR" ? "text-slate-500" : "text-red-500"
              )}>
                {row.original.brand}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400">ID: {displayId}</span>
                {fullLink && (
                    <a 
                        href={fullLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                        <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "default"
      let className = ""

      switch (category) {
        case 'POTENTIAL_CLIENT':
          className = "bg-blue-50 text-blue-600 border-blue-100"
          break
        case 'SERVICE_OFFER':
          className = "bg-orange-50 text-orange-600 border-orange-100"
          break
        case 'JOB_CANDIDATE':
          className = "bg-purple-50 text-purple-600 border-purple-100"
          break
        case 'CONFUSED':
          className = "bg-red-50 text-red-600 border-red-100"
          break
        case 'NO_RESPONSE':
          className = "bg-slate-50 text-slate-500 border-slate-100"
          break
        case 'MANUAL_FOLLOW_UP':
          className = "bg-amber-50 text-amber-600 border-amber-200"
          break
        default:
          className = "bg-slate-50 text-slate-500 border-slate-100"
      }

      return (
        <div className="flex justify-center">
            <Badge className={cn("rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-none hover:bg-transparent transition-none", className)} variant="outline">
              {category.replace('_', ' ')}
            </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const reason = row.original.discardReason?.reasonDetail;
      
      let badgeContent = status;
      let badgeClass = "bg-slate-50 text-slate-500 border-slate-100";
      let isWaiting = false;

      if (status === 'WAITING_FOR_DATE') {
        isWaiting = true;
        const isClientWaiting = reason?.includes("cliente");
        badgeContent = isClientWaiting ? "Esperando Cliente" : "Sin Fecha Aún";
        badgeClass = isClientWaiting ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-200";
      } else if (status === 'ON_HOLD') {
        badgeContent = "En Revisión";
        badgeClass = "bg-orange-50 text-orange-600 border-orange-200 animate-pulse";
      } else if (status === 'IN_EXECUTION') {
        isWaiting = true; // To show the reason sub-text
        badgeContent = "En Ejecución";
        badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100";
      } else if (status === 'SCHEDULED') {
        badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
      } else if (status === 'ARCHIVED') {
        badgeClass = "bg-red-50 text-red-600 border-red-100";
      }

      return (
        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
            <Badge 
                variant="outline" 
                className={cn(
                    "rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-none border hover:bg-transparent transition-none", 
                    badgeClass
                )}
            >
              {badgeContent}
            </Badge>
            {isWaiting && reason && (
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight text-center max-w-[120px] line-clamp-1" title={reason}>
                {reason}
              </span>
            )}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
              onClick={() => onView(row.original)}
            >
              <Eye className="h-4 w-4 text-slate-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest border-none">Ver Detalles</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => onAttempt(row.original)}
            >
              <MessageSquareMore className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest border-none">Seguimiento Manual</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-600"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest border-none">Editar Lead</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              onClick={() => onSchedule(row.original)}
            >
              <CalendarCheck className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest border-none">Agendar Cita</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-lg hover:bg-orange-50 hover:text-orange-600"
              onClick={() => onHold(row.original)}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest border-none">Poner en Revisión</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600"
              onClick={() => onArchive(row.original)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-red-600 text-white font-black text-[10px] uppercase tracking-widest border-none">Archivar Lead</TooltipContent>
        </Tooltip>
      </div>
    ),
  },
]
