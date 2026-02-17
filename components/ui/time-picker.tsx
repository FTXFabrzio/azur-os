"use client";

import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string; // Add className prop
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampm = ["AM", "PM"];

  const selectedDate = date || new Date();
  
  // Get current values
  let currentHour = selectedDate.getHours();
  const currentMinute = selectedDate.getMinutes();
  const currentAmpm = currentHour >= 12 ? "PM" : "AM";
  
  // Convert 24h to 12h for display
  const displayHour = currentHour % 12 || 12;

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string | number) => {
    const newDate = new Date(selectedDate);
    
    if (type === "hour") {
      let newHour = parseInt(value.toString());
      if (currentAmpm === "PM" && newHour !== 12) newHour += 12;
      if (currentAmpm === "AM" && newHour === 12) newHour = 0;
      newDate.setHours(newHour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value.toString()));
    } else if (type === "ampm") {
      let newHour = currentHour;
      if (value === "AM" && currentHour >= 12) newHour -= 12;
      if (value === "PM" && currentHour < 12) newHour += 12;
      newDate.setHours(newHour);
    }
    
    setDate(newDate);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-center gap-2", className)}>
        <div className="flex h-[200px] w-full sm:w-auto divide-x border rounded-xl shadow-sm bg-white overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
            
            <ScrollArea className="h-full w-[80px]">
                <div className="flex flex-col p-1 gap-1 items-center snap-y snap-mandatory">
                    <span className="text-[10px] font-bold text-slate-300 py-1 sticky top-0 bg-white z-10 w-full text-center">Hora</span>
                    {hours.map((hour) => (
                        <Button
                            key={hour}
                            variant={displayHour === hour ? "default" : "ghost"}
                            className={cn(
                                "h-10 w-10 shrink-0 rounded-full snap-start text-sm font-bold transition-all", 
                                displayHour === hour ? "bg-[#D32F2F] hover:bg-[#b71c1c] text-white scale-110 shadow-md" : "hover:bg-slate-100 text-slate-600"
                            )}
                            onClick={() => handleTimeChange("hour", hour)}
                        >
                            {hour.toString().padStart(2, '0')}
                        </Button>
                    ))}
                    <div className="h-[80px]" /> {/* Spacer for scroll ease */}
                </div>
                <ScrollBar orientation="vertical" className="w-0" />
            </ScrollArea>

            <ScrollArea className="h-full w-[80px]">
                <div className="flex flex-col p-1 gap-1 items-center snap-y snap-mandatory">
                    <span className="text-[10px] font-bold text-slate-300 py-1 sticky top-0 bg-white z-10 w-full text-center">Min</span>
                    {minutes.map((minute) => (
                        <Button
                            key={minute}
                            variant={currentMinute === minute ? "default" : "ghost"}
                            className={cn(
                                "h-10 w-10 shrink-0 rounded-full snap-start text-sm font-bold transition-all", 
                                currentMinute === minute ? "bg-[#D32F2F] hover:bg-[#b71c1c] text-white scale-110 shadow-md" : "hover:bg-slate-100 text-slate-600"
                            )}
                            onClick={() => handleTimeChange("minute", minute)}
                        >
                            {minute.toString().padStart(2, '0')}
                        </Button>
                    ))}
                    <div className="h-[80px]" /> {/* Spacer */}
                </div>
                <ScrollBar orientation="vertical" className="w-0" />
            </ScrollArea>

            <ScrollArea className="h-full w-[80px]">
                <div className="flex flex-col p-1 gap-1 items-center snap-y snap-mandatory">
                     <span className="text-[10px] font-bold text-slate-300 py-1 sticky top-0 bg-white z-10 w-full text-center">AM/PM</span>
                    {ampm.map((period) => (
                        <Button
                            key={period}
                            variant={currentAmpm === period ? "default" : "ghost"}
                            className={cn(
                                "h-10 w-14 shrink-0 rounded-full snap-start text-xs font-black transition-all", 
                                currentAmpm === period ? "bg-slate-900 text-white hover:bg-slate-800 scale-105 shadow-md" : "hover:bg-slate-100 text-slate-600"
                            )}
                            onClick={() => handleTimeChange("ampm", period)}
                        >
                            {period}
                        </Button>
                    ))}
                    <div className="h-[80px]" /> {/* Spacer */}
                </div>
                 <ScrollBar orientation="vertical" className="w-0" />
            </ScrollArea>
        </div>
    </div>
  );
}
