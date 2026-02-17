"use client";

import { usePWA } from "@/lib/hooks/usePWA";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";

export const PWAInstallPrompt = () => {
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar si es instalable y no está en modo standalone
    if (isInstallable && !isStandalone) {
      // Pequeño delay para no interrumpir al usuario inmediatamente
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl bg-opacity-90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Download className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Instalar App</h3>
            <p className="text-slate-400 text-xs">Accede rápido desde tu pantalla de inicio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={installApp}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};
