"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { findProjectByCode } from "@/lib/actions/projects";

export function ProjectForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [projectCode, setProjectCode] = useState("");
  const [feedback, setFeedback] = useState<{
    open: boolean;
    type: "success" | "error";
    title?: string;
    message?: string;
  }>({ open: false, type: "error" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCode) return;
    
    setIsLoading(true);

    try {
      const result = await findProjectByCode(projectCode);
      
      if (result.success && result.data) {
        // Delay for vibe
        setTimeout(() => {
          router.push(`/projects/${projectCode}?fileId=${result.data.fileId}`);
        }, 800);
      } else {
        setFeedback({
          open: true,
          type: "error",
          title: "Código Inválido",
          message: "Lo lamento, no pudimos encontrar tu proyecto."
        });
        setIsLoading(false);
      }
    } catch (err) {
      setFeedback({
        open: true,
        type: "error",
        title: "Error de Conexión",
        message: "Hubo un problema al conectar con el servidor de archivos."
      });
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-[500px] z-20 px-6 py-10"
    >
      <div className="bg-[#0D0D0D]/90 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden">
        
        {/* Top Highlight */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        <div className="flex flex-col items-center mb-8">
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/50 font-sans mb-6 font-medium">
            Portal de Clientes Premium
          </p>

          <div className="relative mb-6">
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-[3px] border-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(211,47,47,0.4)]">
                <Search size={20} className="text-white opacity-80" />
              </div>
            </motion.div>
            <div className="absolute -inset-2 bg-red-600/10 blur-xl rounded-full -z-10" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Portal de Proyectos</h2>
          <p className="text-zinc-500 text-xs text-center font-medium max-w-[280px]">
            Ingrese su código exclusivo para visualizar su diseño 3D interactivo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <span className="text-xs font-bold font-mono">CODE</span>
              </div>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                className="block w-full pl-16 pr-4 py-4 bg-[#050505] border border-[#2A2A2A] rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:border-red-600 transition-all duration-300 text-sm font-bold tracking-widest shadow-inner"
                placeholder="EJ: 001"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-gradient-to-r from-red-600 to-[#B71C1C] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(215,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(215,0,0,0.5)]",
              "transition-all duration-300 transform active:scale-[0.97] flex items-center justify-center gap-3 group border border-red-500/20 uppercase tracking-widest text-xs",
              isLoading && "opacity-80 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Visualizar Proyecto</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <FeedbackDialog 
        open={feedback.open}
        onOpenChange={(open) => setFeedback({ ...feedback, open })}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onPrimaryAction={() => setFeedback({ ...feedback, open: false })}
      />
    </motion.div>
  );
}
