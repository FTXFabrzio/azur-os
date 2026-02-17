"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "./time-picker";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Seleccionar fecha y hora</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row p-2 gap-2">
            <div className="rounded-md border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </div>
            <div className="border-l pl-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Hora</span>
                    </div>
                    <TimePicker date={date} setDate={setDate} />
                </div>
            </div>
          </div>
      </PopoverContent>
    </Popover>
  );
}
