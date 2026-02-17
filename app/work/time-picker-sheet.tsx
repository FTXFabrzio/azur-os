"use client";

import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerSheetProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  disabled?: boolean;
}

// This component is now exported normally and will be imported dynamically by ProfileConfigDialog
export function TimePickerSheet({ value, onChange, disabled }: TimePickerSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setSelectedHour(h || "09");
      setSelectedMinute(m || "00");
    }
  }, [value]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"]; // Simplified steps

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "bg-[#F1F5F9] text-xs font-bold px-4 py-2 rounded-full min-w-[80px] text-center text-slate-700 hover:bg-slate-200 transition-colors active:scale-95",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {value || "Seleccionar"}
        </button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[2rem]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center text-lg font-black uppercase text-slate-800">Seleccionar Hora</DrawerTitle>
          </DrawerHeader>
          
          <div className="relative py-8 h-64 flex items-center justify-center">
            {/* Selection Frame (Visual Guides) */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-[28px] h-[56px] border-t border-b border-slate-900/10 pointer-events-none z-10 w-[200px] mx-auto" />

            {/* Hours Column */}
            <div className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory py-[100px] w-20 text-center z-20">
               {hours.map((h) => (
                 <div 
                   key={h}
                   onClick={() => setSelectedHour(h)}
                   className={cn(
                     "h-[56px] flex items-center justify-center text-2xl font-black snap-center cursor-pointer transition-all",
                     selectedHour === h ? "text-red-600 scale-110" : "text-slate-300 scale-90"
                   )}
                 >
                   {h}
                 </div>
               ))}
            </div>

            <div className="text-2xl font-black text-slate-200 pb-1 z-20 mx-2">:</div>

            {/* Minutes Column */}
            <div className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory py-[100px] w-20 text-center z-20">
               {minutes.map((m) => (
                 <div 
                   key={m}
                   onClick={() => setSelectedMinute(m)}
                   className={cn(
                     "h-[56px] flex items-center justify-center text-2xl font-black snap-center cursor-pointer transition-all",
                     selectedMinute === m ? "text-red-600 scale-110" : "text-slate-300 scale-90"
                   )}
                 >
                   {m}
                 </div>
               ))}
            </div>
          </div>

          <DrawerFooter className="pt-2 pb-8">
            <Button onClick={handleConfirm} className="w-full h-14 rounded-2xl bg-[#D32F2F] hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 active:scale-95 transition-all">
              Listo
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full text-slate-400 font-bold">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
