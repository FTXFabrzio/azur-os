"use client";

import { useEffect, useState, useRef } from "react";
import { saveSubscriptionAction, getSubscriptionStatusAction } from "@/lib/actions/pwa-actions";
import { 
  ShieldCheck, 
  Database, 
  Key, 
  Terminal, 
  Trash2, 
  RefreshCw, 
  Eraser, 
  Zap,
  Globe,
  AlertCircle,
  CheckCircle2,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type LogType = "success" | "error" | "warning" | "info";

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: LogType;
  details?: any;
}

export default function PushDebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [swStatus, setSwStatus] = useState<string>("Buscando...");
  const [dbStatus, setDbStatus] = useState<string>("Buscando...");
  const [vapidKey, setVapidKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogType = "info", details?: any) => {
    setLogs(prev => [
      ...prev, 
      { 
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(), 
        message, 
        type,
        details
      }
    ]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Check VAPID Key visibility
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    setVapidKey(key ? `${key.substring(0, 15)}...${key.substring(key.length - 15)}` : "MISSING");
    
    // Check SW Registrations
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            setSwStatus(regs.length > 0 ? `${regs.length} Activo(s)` : "No detectado");
            regs.forEach(reg => {
              addLog(`Service Worker encontrado: ${reg.scope}`, "info", { 
                scope: reg.scope, 
                active: !!reg.active, 
                waiting: !!reg.waiting, 
                installing: !!reg.installing 
              });
            });
        });
    } else {
        setSwStatus("No soportado");
        addLog("Service Worker no es soportado por el navegador", "warning");
    }

    // Check DB Status
    getSubscriptionStatusAction().then(res => {
        setDbStatus(res.hasSubscription ? "Suscrito" : "No registrado");
        if (res.hasSubscription) {
          addLog("Suscripción encontrada en base de datos", "success");
        } else {
          addLog("Sin suscripción activa en servidor", "warning");
        }
    });

  }, []);

  const registerSW = async () => {
    try {
        setLoading(true);
        addLog("Iniciando registro de /sw.js...", "info");
        const reg = await navigator.serviceWorker.register("/sw.js");
        addLog(`✅ Registro exitoso. Scope: ${reg.scope}`, "success");
        setSwStatus("Registrado");
    } catch (e: any) {
        addLog(`❌ Error de Registro: ${e.message}`, "error", e);
    } finally {
        setLoading(false);
    }
  };

  const nukeSW = async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) {
      addLog("No hay Service Workers para eliminar", "warning");
      return;
    }

    for (const reg of regs) {
        await reg.unregister();
        addLog(`🗑️ Eliminado: ${reg.scope}`, "info");
    }
    setSwStatus("Limpio");
    addLog("Todos los Service Workers han sido eliminados", "success");
  };

  const manualSubscribe = async () => {
    try {
        setLoading(true);
        addLog("🚀 Iniciando Proceso de Suscripción...", "info");
        
        const reg = await navigator.serviceWorker.ready;
        addLog("Service Worker reporta estado: LISTO.", "success");
        
        const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!key) {
          addLog("ERROR CRÍTICO: No se encontró NEXT_PUBLIC_VAPID_PUBLIC_KEY", "error");
          throw new Error("No VAPID Key in ENV");
        }

        addLog("Convirtiendo VAPID Key para Push Manager...", "info");
        const appServerKey = urlBase64ToUint8Array(key);
        
        addLog("Solicitando permiso y suscripción a PushManager...", "info");
        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey
        });
        
        addLog("✅ Endpoint obtenido del navegador", "success", sub.toJSON());
        
        addLog("Sincronizando con base de datos de Azur OS...", "info");
        const res = await saveSubscriptionAction(sub.toJSON());
        
        if (res.success) {
            addLog("🎉 ÉXITO: Suscripción guardada y activa en DB!", "success");
            setDbStatus("Suscrito");
        } else {
            addLog(`❌ Error en Servidor: ${res.error}`, "error", res);
        }

    } catch (e: any) {
        addLog(`❌ FALLO EN SUSCRIPCIÓN: ${e.message}`, "error", {
          message: e.message,
          stack: e.stack,
          name: e.name,
          api_code: e.code || "UNKNOWN"
        });
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Header */}
      <div className="px-4 pt-6 lg:px-8 lg:pt-8 mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest mb-1">
              <Zap className="h-3 w-3" />
              Infrastructure Debugger
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Push <span className="text-red-600">Diagnostics</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="rounded-xl h-10 border-slate-200 text-slate-600 font-bold gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recargar</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={nukeSW}
              className="rounded-xl h-10 border-red-100 text-red-600 hover:bg-red-50 font-bold gap-2"
            >
              <Eraser className="h-4 w-4" />
              <span>Nuke SW</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 space-y-8">
        
        {/* Metric Cards - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DiagnosticCard 
            icon={<Globe className="h-5 w-5" />}
            title="Service Worker"
            value={swStatus}
            status={swStatus.includes("Activo") || swStatus === "Registrado" ? "ok" : "warning"}
          />
          <DiagnosticCard 
            icon={<Database className="h-5 w-5" />}
            title="Base de Datos"
            value={dbStatus}
            status={dbStatus === "Suscrito" ? "ok" : "warning"}
          />
          <DiagnosticCard 
            icon={<Key className="h-5 w-5" />}
            title="VAPID Key"
            value={vapidKey}
            status={vapidKey !== "MISSING" ? "ok" : "error"}
            isMono
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-3xl border border-slate-200/60 shadow-sm">
           <Button 
             onClick={registerSW} 
             disabled={loading}
             className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-xl shadow-lg"
           >
             1. Registrar SW
           </Button>
           
           <Button 
             onClick={manualSubscribe} 
             disabled={loading}
             className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-xl shadow-lg shadow-red-600/20 gap-2"
           >
             <ShieldCheck className="h-4 w-4" />
             2. Suscribir y Sincronizar
           </Button>

           <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

           <Button 
             variant="ghost" 
             onClick={() => navigator.serviceWorker.register("/mock-sw.js").then(r => addLog("✅ MOCK Registered: " + r.scope, "success")).catch(e => addLog("❌ MOCK Failed: " + e.message, "error"))}
             className="text-slate-400 font-bold text-[10px] uppercase tracking-widest h-12 px-6 rounded-xl hover:bg-white transition-all"
           >
             Mock SW
           </Button>
        </div>

        {/* Pro Console */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <Terminal className="h-4 w-4" />
              Debug Console
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearLogs}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 font-black text-[9px] uppercase tracking-[0.2em] rounded-lg gap-2"
            >
              <Trash className="h-3 w-3" />
              Limpiar
            </Button>
          </div>

          <div 
            ref={scrollRef}
            className="bg-[#0F172A]/95 backdrop-blur-xl border border-slate-800 rounded-3xl h-[500px] overflow-y-auto p-6 font-mono text-[11px] shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-30" />
            
            <AnimatePresence mode="popLayout">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-slate-400">
                  <Terminal className="h-12 w-12 mb-4" />
                  <p className="uppercase tracking-widest font-black">Esperando acciones...</p>
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-slate-600 shrink-0 select-none">
                        [{log.timestamp.toLocaleTimeString([], { hour12: false })}]
                      </span>
                      
                      <div className="flex-1">
                        <span className={cn(
                          "font-bold",
                          log.type === "success" && "text-emerald-400",
                          log.type === "error" && "text-red-400 font-black",
                          log.type === "warning" && "text-amber-400",
                          log.type === "info" && "text-blue-400"
                        )}>
                          {log.message}
                        </span>

                        {log.details && (
                          <div className="mt-2 p-3 bg-black/40 rounded-xl border border-slate-800/50 text-slate-400 overflow-x-auto">
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>

                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full mt-1 shrink-0",
                        log.type === "success" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                        log.type === "error" && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                        log.type === "warning" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                        log.type === "info" && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      )} />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function DiagnosticCard({ 
  icon, 
  title, 
  value, 
  status,
  isMono
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  status: "ok" | "error" | "warning";
  isMono?: boolean;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-red-500/20 transition-all duration-500">
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12 transition-all duration-500",
        status === "ok" && "bg-emerald-100/50 group-hover:bg-emerald-200/50",
        status === "warning" && "bg-amber-100/50 group-hover:bg-amber-200/50",
        status === "error" && "bg-red-100/50 group-hover:bg-red-200/50"
      )} />
      
      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
           <div className={cn(
             "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300",
             status === "ok" && "bg-emerald-50 text-emerald-600",
             status === "warning" && "bg-amber-50 text-amber-600",
             status === "error" && "bg-red-50 text-red-600"
           )}>
             {icon}
           </div>
           
           <div className={cn(
             "h-2 w-2 rounded-full",
             status === "ok" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
             status === "warning" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
             status === "error" && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
           )} />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
          <p className={cn(
            "text-lg font-black tracking-tight truncate",
            isMono ? "font-mono text-sm break-all" : "text-slate-900"
          )}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
