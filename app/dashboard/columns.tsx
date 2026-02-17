"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { 
  UserCircle, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  MoreHorizontal,
  Briefcase,
  Key,
  UserCog,
  Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow } from "date-fns"
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
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acceso" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
          {row.getValue("role")}
        </span>
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
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Registro" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium tabular-nums">
        <Calendar className="h-3 w-3" />
        {row.getValue("createdAt")}
      </div>
    ),
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
  status: "pending" | "confirmed" | "cancelled"
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
        const date = new Date(row.getValue("date"))
        let label = format(date, "EEE d, hh:mm a", { locale: es })
        
        if (isToday(date)) {
          label = `Hoy, ${format(date, "hh:mm a", { locale: es })}`
        } else if (isTomorrow(date)) {
          label = `Mañana, ${format(date, "hh:mm a", { locale: es })}`
        }

        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[13px] font-bold text-slate-700 capitalize">
              {label}
            </span>
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
