"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { format, parse } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimeInput({ value, onChange, className }: TimeInputProps) {
  // Parse initial value or default to 09:00
  const date = React.useMemo(() => {
    if (!value) return new Date(new Date().setHours(9, 0, 0, 0));
    const [hours, minutes] = value.split(":").map(Number);
    const d = new Date();
    d.setHours(hours);
    d.setMinutes(minutes);
    return d;
  }, [value]);

  const setDate = (newDate: Date | undefined) => {
    if (!newDate || !onChange) return;
    onChange(format(newDate, "HH:mm"));
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampm = ["AM", "PM"];

  const currentHour24 = date.getHours();
  const currentMinute = date.getMinutes();
  const currentAmpm = currentHour24 >= 12 ? "PM" : "AM";
  const displayHour = currentHour24 % 12 || 12;

  const handleTimeChange = (type: "hour" | "minute" | "ampm", val: string | number) => {
    const newDate = new Date(date);
    if (type === "hour") {
        let h = parseInt(val.toString());
        if (currentAmpm === "PM" && h !== 12) h += 12;
        if (currentAmpm === "AM" && h === 12) h = 0;
        newDate.setHours(h);
    } else if (type === "minute") {
        newDate.setMinutes(parseInt(val.toString()));
    } else if (type === "ampm") {
        let h = currentHour24;
        if (val === "AM" && h >= 12) h -= 12;
        if (val === "PM" && h < 12) h += 12;
        newDate.setHours(h);
    }
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-white border-slate-200 hover:bg-slate-50",
            !value && "text-muted-foreground",
             className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-slate-400" />
          {value ? format(date, "hh:mm a") : <span>Seleccionar hora</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex h-[200px] divide-x border rounded-md shadow-sm bg-white">
            <ScrollArea className="h-full w-[70px]">
                <div className="flex flex-col p-1 gap-1">
                    <span className="text-[10px] text-center font-bold text-slate-400 py-1">Hora</span>
                    {hours.map((hour) => (
                        <Button
                            key={hour}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 w-full justify-center font-bold",
                                displayHour === hour ? "bg-[#D32F2F] text-white hover:bg-red-700" : "hover:bg-slate-100 text-slate-600"
                            )}
                            onClick={() => handleTimeChange("hour", hour)}
                        >
                            {hour.toString().padStart(2, '0')}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="vertical" className="invisible" />
            </ScrollArea>
            <ScrollArea className="h-full w-[70px]">
                <div className="flex flex-col p-1 gap-1">
                    <span className="text-[10px] text-center font-bold text-slate-400 py-1">Min</span>
                    {minutes.map((minute) => (
                        <Button
                            key={minute}
                            variant="ghost"
                             size="sm"
                            className={cn(
                                "h-8 w-full justify-center font-bold",
                                currentMinute === minute ? "bg-[#D32F2F] text-white hover:bg-red-700" : "hover:bg-slate-100 text-slate-600"
                            )}
                            onClick={() => handleTimeChange("minute", minute)}
                        >
                            {minute.toString().padStart(2, '0')}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="vertical" className="invisible" />
            </ScrollArea>
            <div className="flex flex-col p-1 gap-1 w-[70px] bg-slate-50">
                 <span className="text-[10px] text-center font-bold text-slate-400 py-1">AM/PM</span>
                 {ampm.map((period) => (
                    <Button
                        key={period}
                        variant="ghost"
                         size="sm"
                        className={cn(
                            "h-8 w-full justify-center font-bold",
                            currentAmpm === period ? "bg-slate-900 text-white hover:bg-slate-800" : "hover:bg-slate-200 text-slate-600"
                        )}
                        onClick={() => handleTimeChange("ampm", period)}
                    >
                        {period}
                    </Button>
                ))}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
