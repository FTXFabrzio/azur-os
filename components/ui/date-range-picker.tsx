"use client"

import * as React from "react"
import { format, getDaysInMonth, startOfToday, setMonth, setDate as setDateDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { es } from "date-fns/locale"

interface DatePickerWithRangeProps {
  className?: string
  date?: DateRange
  setDate: (date: DateRange | undefined) => void
}

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const today = startOfToday();
  // Assume year 2026 based on metadata or keep it from existing date
  const year = date?.from ? date.from.getFullYear() : today.getFullYear();

  const currentMonthIdx = date?.from ? date.from.getMonth() : today.getMonth();
  const currentDay = date?.from ? date.from.getDate() : today.getDate();

  const handleMonthChange = (monthIdxStr: string) => {
    const monthIdx = parseInt(monthIdxStr);
    let baseDate = date?.from || today;
    // Set year context correctly
    baseDate = new Date(year, baseDate.getMonth(), baseDate.getDate());
    
    // First set month
    let newDate = setMonth(baseDate, monthIdx);
    
    // Ensure day is valid for the new month
    const maxDays = getDaysInMonth(newDate);
    if (newDate.getDate() > maxDays) {
      newDate = setDateDay(newDate, maxDays);
    }
    
    setDate({ from: newDate, to: newDate });
  };

  const handleDayChange = (dayStr: string) => {
    const day = parseInt(dayStr);
    let baseDate = date?.from || today;
    baseDate = new Date(year, baseDate.getMonth(), baseDate.getDate());

    const newDate = setDateDay(baseDate, day);
    setDate({ from: newDate, to: newDate });
  };

  const daysInMonth = getDaysInMonth(new Date(year, currentMonthIdx));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-bold text-[10px] uppercase tracking-[0.1em] h-10 px-4 rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all",
              !date && "text-slate-400"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
            {date?.from ? (
              format(date.from, "d 'de' MMMM", { locale: es })
            ) : (
              <span>Filtrar por Fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[300px] p-5 rounded-[1.5rem] border-slate-200 shadow-2xl bg-white space-y-5" 
          align="center" 
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Seleccionar Mes</label>
               <Select value={currentMonthIdx.toString()} onValueChange={handleMonthChange}>
                 <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs transition-all focus:bg-white focus:ring-0">
                   <SelectValue placeholder="Seleccionar Mes" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {months.map((m, idx) => (
                      <SelectItem key={m} value={idx.toString()} className="text-xs font-bold uppercase py-3">
                        {m}
                      </SelectItem>
                    ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Seleccionar Día</label>
               <Select value={currentDay.toString()} onValueChange={handleDayChange}>
                 <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs transition-all focus:bg-white focus:ring-0">
                   <SelectValue placeholder="Seleccionar Día" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <div className="grid grid-cols-4 gap-1 p-1">
                      {days.map((d) => (
                        <SelectItem 
                          key={d} 
                          value={d.toString()} 
                          className="text-xs font-bold flex justify-center py-2 h-10 w-full"
                        >
                          {d}
                        </SelectItem>
                      ))}
                    </div>
                 </SelectContent>
               </Select>
             </div>
          </div>
          
          <Button 
            className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 active:scale-[0.98] transition-all"
            onClick={() => {
              // Selection is already handled by onValueChange
              // Here logic to close popover could be added if needed via state
            }}
          >
            Aplicar Filtro
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
