"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumn?: string
  dateFilter?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  dateFilter,
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
    state: {
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-2 gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {filterColumn && (
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder={`Filtrar por ${filterColumn}...`}
                    value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                    table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                    }
                    className="pl-10 h-10 bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 rounded-xl text-xs font-bold shadow-sm"
                />
            </div>
            )}
            {dateFilter && (
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                   <DatePickerWithRange date={date} setDate={setDate} className="w-full sm:w-[280px]" />
                </div>
            )}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-slate-100 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-slate-500 font-semibold h-12">
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
      <div className="flex items-center justify-end space-x-2 py-2">
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
  )
}
