"use client";

import React, { useState, useEffect, useRef } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimePickerSheetProps {
  value: string; // "HH:mm" (24h format)
  onChange: (value: string) => void;
  disabled?: boolean;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

export function TimePickerSheet({ value, onChange, disabled }: TimePickerSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [h12, setH12] = useState("09");
  const [min, setMin] = useState("00");
  const [period, setPeriod] = useState("AM");

  // Sync internal state with external value when opening
  useEffect(() => {
    if (isOpen && value && value.includes(":")) {
      const [h24, m] = value.split(":");
      const hh = parseInt(h24);
      const p = hh >= 12 ? "PM" : "AM";
      let displayH = hh % 12;
      if (displayH === 0) displayH = 12;
      
      setH12(displayH.toString().padStart(2, "0"));
      setMin(m || "00");
      setPeriod(p);
    }
  }, [value, isOpen]);

  const handleConfirm = () => {
    let hh = parseInt(h12);
    if (period === "PM" && hh < 12) hh += 12;
    if (period === "AM" && hh === 12) hh = 0;
    
    const finalValue = `${hh.toString().padStart(2, "0")}:${min}`;
    onChange(finalValue);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return "Seleccionar";
    const [h24, m] = value.split(":");
    const hh = parseInt(h24 || "0");
    const p = hh >= 12 ? "PM" : "AM";
    let displayH = hh % 12;
    if (displayH === 0) displayH = 12;
    return `${displayH.toString().padStart(2, "0")}:${m} ${p}`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} dismissible={true}>
      <DrawerTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onPointerDown={(e) => e.preventDefault()} // Prevents focus theft that causes aria-hidden warnings
          className={cn(
            "bg-[#F1F5F9] text-xs font-bold px-4 py-2 rounded-full min-w-[100px] text-center text-slate-700 hover:bg-slate-200 transition-colors active:scale-95 outline-none",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {getDisplayValue()}
        </button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[3rem] border-none shadow-2xl bg-white pb-10 overflow-hidden outline-none">
        <div className="mx-auto w-full max-w-sm px-6">
          <DrawerHeader className="pt-8 pb-2">
            <DrawerTitle className="text-center text-xl font-black uppercase tracking-tight text-slate-900">
              Seleccionar Hora
            </DrawerTitle>
          </DrawerHeader>

          <div className="relative h-64 my-2 flex items-center justify-center overflow-hidden">
            {/* Horizontal Selector Lines (matching the image) */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-[28px] h-[56px] border-y border-slate-100 pointer-events-none z-10" />
            
            <div className="flex items-center justify-center gap-2 w-full h-full relative z-20">
              {/* Hour Column */}
              <ScrollColumn 
                items={HOURS_12} 
                selected={h12} 
                onSelect={setH12} 
                className="flex-1" 
              />

              <div className="text-2xl font-black text-slate-200 mb-1">:</div>

              {/* Minute Column */}
              <ScrollColumn 
                items={MINUTES} 
                selected={min} 
                onSelect={setMin} 
                className="flex-1" 
              />

              {/* Space */}
              <div className="w-4" />

              {/* Period Column */}
              <ScrollColumn 
                items={PERIODS} 
                selected={period} 
                onSelect={setPeriod} 
                className="flex-1" 
              />
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <Button 
              onClick={handleConfirm} 
              className="w-full h-14 rounded-2xl bg-[#D32F2F] hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 active:scale-95 transition-all"
            >
              Confirmar
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-10 text-slate-400 font-bold uppercase text-[9px] tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                Cerrar
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ScrollColumn({ 
  items, 
  selected, 
  onSelect, 
  className 
}: { 
  items: string[]; 
  selected: string; 
  onSelect: (val: string) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 56;

  // Initialize and Sync scroll position
  useEffect(() => {
    if (scrollRef.current) {
      const index = items.indexOf(selected);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * itemHeight;
      }
    }
  }, [selected, items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollY = e.currentTarget.scrollTop;
    const index = Math.round(scrollY / itemHeight);
    if (items[index] && items[index] !== selected) {
      onSelect(items[index]);
    }
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn(
        "h-[168px] overflow-y-auto scrollbar-hide snap-y snap-mandatory py-[56px] flex flex-col items-center",
        className
      )}
    >
      {items.map((item) => {
        const isSelected = item === selected;
        return (
          <div
            key={item}
            onClick={() => onSelect(item)}
            className={cn(
              "h-[56px] min-h-[56px] flex items-center justify-center text-3xl font-black transition-all duration-300 snap-center cursor-pointer select-none",
              isSelected ? "text-red-500 scale-110" : "text-slate-300 scale-75 opacity-40"
            )}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
