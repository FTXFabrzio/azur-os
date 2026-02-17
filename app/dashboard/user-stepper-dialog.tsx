"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ChevronRight, ChevronLeft, Shield, UserCircle, Briefcase, Settings, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStepperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { createUser } from "@/lib/actions/users";
// Use crypto.randomUUID() instead of uuid package

const mockRoles = [
  { id: "CEO", name: "CEO" },
  { id: "ARCHITECT", name: "Arquitecto" },
  { id: "COMMERCIAL", name: "Comercial" },
  { id: "ADMIN", name: "Administrador" },
];

export function UserStepperDialog({
  open,
  onOpenChange,
}: UserStepperDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Identity
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    password: "",
    role: "COMMERCIAL" as "CEO" | "ARCHITECT" | "COMMERCIAL" | "ADMIN",
    phone: "",
  });

  // Step 2: Specific Profile
  const [profileType, setProfileType] = useState('none');

  // Reset step and data when opening
  useEffect(() => {
    if (open) {
      setStep(1);
      setUserData({
        name: "",
        username: "",
        password: "",
        role: "COMMERCIAL",
        phone: "",
      });
      setProfileType('none');
    }
  }, [open]);

  useEffect(() => {
    if (!userData.role) {
      setProfileType('none');
      return;
    }

    if (userData.role === "ARCHITECT") {
      setProfileType('technician');
    } else if (userData.role === "COMMERCIAL") {
      setProfileType('partner');
    } else {
      setProfileType('none');
    }
  }, [userData.role]);

  const handleNext = () => {
    if (!userData.name || !userData.role || !userData.username || !userData.password) {
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await createUser({
        id: crypto.randomUUID(),
        name: userData.name,
        username: userData.username,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        isAvailableEarly: false,
      });

      if (result.success) {
        onOpenChange(false);
      } else {
        alert("Error al crear usuario");
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[500px] border-none shadow-2xl [&>button]:text-white [&>button]:opacity-100">
        <DialogHeader className="bg-[#1a1c1e] px-6 py-6 text-white relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30">
              <UserPlus className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Registro de Usuario</DialogTitle>
              <p className="text-slate-400 text-xs mt-1">Siga los pasos para configurar la nueva cuenta.</p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between px-2">
            <div className="flex flex-col items-center flex-1 relative">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors duration-300",
                step >= 1 ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
              )}>
                1
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-widest mt-2 font-bold",
                step >= 1 ? "text-blue-500" : "text-slate-500"
              )}>Identidad</span>
              
              <div className={cn(
                "absolute h-0.5 w-[calc(100%-2rem)] left-[calc(50%+1rem)] top-4 transition-colors duration-300",
                step > 1 ? "bg-blue-600" : "bg-slate-700"
              )} />
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors duration-300",
                step >= 2 ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
              )}>
                2
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-widest mt-2 font-bold text-center",
                step >= 2 ? "text-blue-500" : "text-slate-500"
              )}>Perfil Específico</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2 col-span-2">
                  <Label className="text-slate-900 font-medium flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-slate-400" />
                    Nombre Completo
                  </Label>
                  <Input
                    placeholder="Ej. Juan Pérez"
                    className="h-11 border-slate-200"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">Username</Label>
                    <Input
                      placeholder="jperez"
                      className="h-11 border-slate-200"
                      value={userData.username}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">Contraseña</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-11 border-slate-200"
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-slate-900 font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    Teléfono
                  </Label>
                  <Input
                    placeholder="+51 ..."
                    className="h-11 border-slate-200"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-slate-900 font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Rol del Sistema
                  </Label>
                  <Select
                    value={userData.role}
                    onValueChange={(v) => setUserData({ ...userData, role: v as any })}
                  >
                    <SelectTrigger className="h-11 border-slate-200">
                      <SelectValue placeholder="Asignar permisos" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  Información Complementaria
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Settings className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No se requieren campos adicionales para este rol.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/80 p-6 gap-2 sm:gap-0 border-t border-slate-100">
          {step === 1 ? (
            <>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700 font-medium"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md active:scale-95 gap-2 px-6"
                onClick={handleNext}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700 font-medium gap-2"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md active:scale-95 px-8"
                onClick={handleSubmit}
              >
                {loading ? "Creando..." : "Crear Usuario"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
