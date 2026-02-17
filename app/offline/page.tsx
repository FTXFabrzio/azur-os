"use client";

import { WifiOff, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-slate-800">
        <WifiOff className="w-12 h-12 text-slate-500 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-t from-slate-400 to-white bg-clip-text text-transparent">
        Estás sin conexión
      </h1>
      <p className="text-slate-400 max-w-md mb-8">
        Parece que no tienes conexión a internet en este momento. La aplicación necesita una conexión para cargar nuevo contenido.
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => typeof window !== 'undefined' && window.location.reload()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          Reintentar
        </button>
        <Link 
          href="/"
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95"
        >
          Volver al Inicio
        </Link>
      </div>
      
      <div className="mt-12 text-slate-600 text-xs">
        Azur OS Architecture • Offline Mode
      </div>
    </div>
  );
}
