import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Filter } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

const mapLabel = (val: string) => {
  if (val === 'WAITING_FOR_DATE') return 'Sin Fecha Aún'
  if (val === 'ON_HOLD') return 'En Revisión'
  if (val === 'IN_EXECUTION') return 'En Ejecución'
  if (val === 'PENDING') return 'Pending'
  if (val === 'SCHEDULED') return 'Agendado'
  if (val === 'ARCHIVED') return 'Archivado'
  if (val === 'pending') return 'Pendiente'
  if (val === 'confirmed') return 'Confirmada'
  if (val === 'cancelled') return 'Cancelada'
  
  if (val === 'POTENTIAL_CLIENT') return 'Cliente Potencial'
  if (val === 'JOB_CANDIDATE') return 'Candidato / CV'
  if (val === 'SERVICE_OFFER') return 'Proveedor'
  if (val === 'MANUAL_FOLLOW_UP') return 'Seguimiento'
  if (val === 'NO_RESPONSE') return 'Sin Respuesta'
  if (val === 'NOT_INTERESTED') return 'No Interesado'
  if (val === 'CONFUSED') return 'Confundido'
  if (val === 'REVISION') return 'Revisión'
  if (val === 'REJECTED') return 'Rechazado'

  return val.replace(/_/g, ' ')
}

const getBadgeClasses = (val: string) => {
  switch (val) {
    case 'POTENTIAL_CLIENT': return "bg-blue-50 text-blue-600 border-blue-100"
    case 'SERVICE_OFFER': return "bg-orange-50 text-orange-600 border-orange-100"
    case 'JOB_CANDIDATE': return "bg-purple-50 text-purple-600 border-purple-100"
    case 'CONFUSED': return "bg-red-50 text-red-600 border-red-100"
    case 'NO_RESPONSE': return "bg-slate-50 text-slate-500 border-slate-100"
    case 'MANUAL_FOLLOW_UP': return "bg-amber-50 text-amber-600 border-amber-200"
    case 'LEAD_ALL': return "bg-cyan-50 text-cyan-600 border-cyan-100"
    case 'LEAD_LIBRE': return "bg-cyan-50 text-cyan-600 border-cyan-100"
    case 'REVISION': return "bg-emerald-50 text-emerald-600 border-emerald-100"
    
    case 'WAITING_FOR_DATE': return "bg-amber-50 text-amber-600 border-amber-200"
    case 'ON_HOLD': return "bg-orange-50 text-orange-600 border-orange-200"
    case 'IN_EXECUTION': return "bg-emerald-50 text-emerald-600 border-emerald-200"
    case 'PENDING': return "bg-slate-50 text-slate-600 border-slate-100"
    case 'SCHEDULED': return "bg-emerald-50 text-emerald-600 border-emerald-100"
    case 'ARCHIVED': return "bg-red-50 text-red-600 border-red-100"
    case 'REJECTED': return "bg-red-50 text-red-600 border-red-100"
    
    default: return ""
  }
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanFilter()) {
    return <div className={cn(className)}>{title}</div>
  }

  // Obtenemos los valores únicos de la columna si tiene la capacidad de filtrar
  const uniqueValues = column.getFacetedUniqueValues
    ? Array.from(column.getFacetedUniqueValues().keys()).filter(Boolean).sort()
    : []
  
  const isFiltered = column.getIsFiltered()

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getCanSort() && (
                column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                )
            )}
            {isFiltered && (
                <Filter className="ml-1 h-3.5 w-3.5 text-blue-500 fill-blue-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
          {column.getCanSort() && (
              <>
                  <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                    <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Asc
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                    <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Desc
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
              </>
          )}

          {column.getCanFilter() && uniqueValues.length > 0 && (
            <>
                <DropdownMenuLabel className="text-xs font-bold text-slate-500 pl-2 pointer-events-none">Filtro Rápido</DropdownMenuLabel>
                <DropdownMenuRadioGroup 
                    value={(column.getFilterValue() as string) ?? "ALL"}
                    onValueChange={(val) => {
                        if (val === "ALL") column.setFilterValue(undefined)
                        else column.setFilterValue(val)
                    }}
                >
                    <DropdownMenuRadioItem value="ALL" className="text-xs font-bold text-slate-600 py-2">
                        Todos
                    </DropdownMenuRadioItem>
                    {uniqueValues.map((val: any) => {
                        const badgeClasses = typeof val === 'string' ? getBadgeClasses(val) : "";
                        return (
                            <DropdownMenuRadioItem key={val} value={val} className="text-xs my-0.5 py-1.5 group cursor-pointer">
                                {badgeClasses ? (
                                    <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-none pointer-events-none rounded-full border", badgeClasses)}>
                                        {mapLabel(val)}
                                    </Badge>
                                ) : (
                                    <span className="font-semibold text-slate-700">{typeof val === 'string' ? mapLabel(val) : String(val)}</span>
                                )}
                            </DropdownMenuRadioItem>
                        )
                    })}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
