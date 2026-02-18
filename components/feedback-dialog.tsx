"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ArrowRight, Save, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "success" | "error";
  title?: string;
  message?: string;
  userName?: string;
  meetingName?: string;
  errorMessage?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  type,
  title,
  message,
  userName,
  meetingName,
  errorMessage,
  onPrimaryAction,
  onSecondaryAction,
}: FeedbackDialogProps) {
  
  const isSuccess = type === "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[400px] border-none shadow-2xl overflow-hidden bg-white text-slate-900 rounded-[2.5rem]">
        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Icon Section */}
          <div className="mb-6 relative">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {isSuccess ? (
                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" strokeWidth={2.5} />
                  </motion.div>
                  {/* Subtle pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center relative">
                  <AlertTriangle className="h-10 w-10 text-orange-500" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-pulse" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Title */}
          <DialogTitle className="text-xl font-black text-slate-900 leading-tight mb-2">
            {title || (isSuccess ? `¡Todo listo, ${userName || "Usuario"}!` : "Lo lamento, no pudimos crear tu reunión")}
          </DialogTitle>

          {/* Message */}
          <p className="text-sm font-medium text-slate-500 px-4 leading-relaxed mb-8">
            {message || (isSuccess 
              ? `La reunión para ${meetingName || "el equipo"} ha sido agendada y las notificaciones han sido enviadas al equipo.`
              : "Hubo un problema técnico al conectar con el servidor. No te preocupes, los datos están guardados en el Modo Blindado (Offline)."
            )}
          </p>

          {/* Technical Detail (Error Only) */}
          {!isSuccess && errorMessage && (
            <div className="mb-8 p-3 bg-slate-50 rounded-xl w-full">
              <p className="text-[10px] font-mono text-slate-400 text-left break-all">
                Error: {errorMessage}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button
              onClick={onPrimaryAction}
              className={isSuccess 
                ? "w-full h-14 bg-[#D32F2F] hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                : "w-full h-14 bg-white hover:bg-red-50 text-[#D32F2F] border-2 border-[#D32F2F] font-black uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              }
            >
              {isSuccess ? (
                <>
                  VER EN MI AGENDA
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  REINTENTAR AHORA
                  <RotateCcw className="h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onSecondaryAction || (() => onOpenChange(false))}
              className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl h-10 flex items-center justify-center gap-2"
            >
              {isSuccess ? (
                "Cerrar"
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Guardar Borrador
                </>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
