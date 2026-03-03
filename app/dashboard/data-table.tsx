"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Search } from "lucide-react"
import { isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumn?: string
  secondaryFilterColumn?: string
  dateFilter?: boolean
  renderMobileCard?: (row: any) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  secondaryFilterColumn,
  dateFilter,
  renderMobileCard,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [date, setDate] = React.useState<DateRange | undefined>()

  const filteredData = React.useMemo(() => {
    if (!dateFilter || !date?.from) return data;
    return data.filter((item: any) => {
      const itemDate = item.date || item.startDatetime;
      if (!itemDate) return true;
      return isSameDay(new Date(itemDate), date.from as Date);
    });
  }, [data, date, dateFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      columnFilters,
    },
  })

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-5 bg-slate-50/30 border-b border-slate-50 gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            {filterColumn && (
            <div className="relative w-full sm:max-w-xs shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder={`Buscar por nombre...`}
                    value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                    table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                    }
                    className="pl-10 h-[2.5rem] bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-800 rounded-xl text-sm font-medium shadow-sm transition-all"
                />
            </div>
            )}
            {dateFilter && (
                <div className="w-full sm:w-auto shrink-0">
                   <DatePickerWithRange date={date} setDate={setDate} className="w-full sm:w-[280px]" />
                </div>
            )}
        </div>
        {secondaryFilterColumn && (
        <div className="relative w-full sm:max-w-[160px] shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                placeholder={`ID Kommo...`}
                value={(table.getColumn(secondaryFilterColumn)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                table.getColumn(secondaryFilterColumn)?.setFilterValue(event.target.value)
                }
                className="pl-10 h-[2.5rem] bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-800 rounded-xl text-sm font-medium shadow-sm transition-all font-mono"
            />
        </div>
        )}
      </div>
      <div className="w-full overflow-hidden">
        {/* Vista Mobile (Tarjetas Apiladas) */}
        {renderMobileCard && (
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => renderMobileCard(row.original))
            ) : (
              <div className="h-24 flex items-center justify-center text-center text-slate-400 text-sm">
                No se encontraron resultados.
              </div>
            )}
          </div>
        )}

        {/* Vista Desktop (Tabla) */}
        <div className={cn("overflow-x-auto", renderMobileCard ? "hidden md:block" : "")}>
        <Table className="border-collapse">
          <TableHeader className="bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-slate-100 hover:bg-transparent shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-slate-500 font-bold text-xs h-12 uppercase tracking-wide">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b-slate-50 hover:bg-slate-50/50 transition-all duration-200 group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
      <div className="flex items-center justify-between space-x-2 p-5 border-t border-slate-100 bg-slate-50/30">
        <div className="text-xs font-medium text-slate-500">
           {table.getFilteredRowModel().rows.length} registros totales
        </div>
        <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium"
        >
          Siguiente
        </Button>
        </div>
      </div>
    </div>
  )
}
