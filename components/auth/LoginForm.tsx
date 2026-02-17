"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { authenticate } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authenticate(username, password);
      
      if (result.success) {
        // We simulate a small delay to keep the loading animation feel
        setTimeout(() => {
          const username = result.user?.username;
          // Strict RBAC: Only 'fortex' goes to /dashboard.
          if (username === "fortex") {
            router.push("/dashboard");
          } else {
            router.push("/work");
          }
        }, 800);
      } else {
        setError(result.error || "Credenciales incorrectas");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error de conexión");
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
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-azur-red/50 to-transparent" />

        <div className="flex flex-col items-center mb-6">
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/50 font-sans mb-6 font-medium">
            Fortex Digital Solutions
          </p>

          {/* Logo Icon similar to reference */}
          <div className="relative mb-5">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border-2 border-dashed border-azur-red/30 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-[3px] border-azur-red flex items-center justify-center shadow-[0_0_20px_rgba(211,47,47,0.4)]">
                <div className="w-8 h-8 border-t-2 border-white rounded-full opacity-80" />
              </div>
            </motion.div>
            <div className="absolute -inset-2 bg-azur-red/10 blur-xl rounded-full -z-10" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Azur OS</h2>
          <p className="text-zinc-500 text-xs font-medium">Ingrese sus credenciales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center py-2 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-azur-red transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-[#050505] border border-[#2A2A2A] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF3131] transition-all duration-300 text-sm shadow-inner"
                placeholder="Nombre de Usuario"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-azur-red transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-3 bg-[#050505] border border-[#2A2A2A] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF3131] transition-all duration-300 text-sm shadow-inner"
                placeholder="Contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-white transition-colors"
               >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-gradient-to-r from-[#FF3131] to-[#D70000] text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(215,0,0,0.3)] hover:shadow-[0_0_30px_rgba(215,0,0,0.5)]",
              "transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 group border border-red-500/20",
              isLoading && "opacity-80 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Ingresar</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

    </motion.div>
  );
}
