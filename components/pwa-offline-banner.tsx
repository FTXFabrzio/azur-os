"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAOfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-600 text-white overflow-hidden shrink-0"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <WifiOff className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Modo Offline Activo</span>
                <span className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Los datos se sincronizarán al recuperar conexión</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-white/50" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Azur OS Blindado</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
