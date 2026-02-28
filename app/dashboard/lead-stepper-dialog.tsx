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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
    UserPlus, 
    ChevronRight, 
    ChevronLeft, 
    Building2, 
    UserCircle, 
    Briefcase, 
    FileText, 
    MapPin, 
    Layers, 
    Dices
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createLead } from "@/lib/actions/leads";

interface LeadStepperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
    { id: 'POTENTIAL_CLIENT', name: 'Cliente Potencial', icon: <UserCircle className="h-4 w-4" /> },
    { id: 'JOB_CANDIDATE', name: 'Candidato / CV', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'SERVICE_OFFER', name: 'Oferta de Servicio', icon: <FileText className="h-4 w-4" /> },
    { id: 'NO_RESPONSE', name: 'Sin Respuesta', icon: <Dices className="h-4 w-4" /> },
    { id: 'CONFUSED', name: 'Confundido', icon: <Dices className="h-4 w-4" /> },
];

export function LeadStepperDialog({ open, onOpenChange }: LeadStepperDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kommoIdError, setKommoIdError] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    contactName: "",
    kommoId: "",
    brand: "AZUR" as "AZUR" | "COCINAPRO",
    category: "POTENTIAL_CLIENT",
    phone: "",
    leadEntryDate: new Date().toISOString().split('T')[0],
    // Extension fields
    address: "",
    squareMeters: "",
    materials: "",
    hasBlueprints: false,
    requirementsDetail: "",
    companyName: "",
    offerDetails: "",
    cvAnalysisSummary: "",
    fileUrl: "",
    reasonDetail: ""
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      setKommoIdError(false);
      setFormData({
        contactName: "",
        kommoId: "",
        brand: "AZUR",
        category: "POTENTIAL_CLIENT",
        phone: "",
        leadEntryDate: new Date().toISOString().split('T')[0],
        address: "",
        squareMeters: "",
        materials: "",
        hasBlueprints: false,
        requirementsDetail: "",
        companyName: "",
        offerDetails: "",
        cvAnalysisSummary: "",
        fileUrl: "",
        reasonDetail: ""
      });
    }
  }, [open]);

  const handleNext = () => {
    if (!formData.contactName || !formData.kommoId) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await createLead({
        ...formData,
        squareMeters: formData.squareMeters ? parseFloat(formData.squareMeters) : null
      });

      if (result.success) {
        onOpenChange(false);
      } else {
        if (result.error?.includes("leads.kommo_id")) {
          setKommoIdError(true);
          setStep(1); // Go back to first step to show error
        } else {
          alert("Error al registrar lead: " + result.error);
        }
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
      <DialogContent className="p-0 overflow-hidden sm:max-w-[550px] max-h-[90vh] flex flex-col border-none shadow-2xl [&>button]:text-white [&>button]:opacity-100">
        <DialogHeader className="bg-[#1a1c1e] px-8 py-4 text-white relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Registro de Lead</DialogTitle>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Ingreso manual desde Kommo</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between px-4">
            <div className="flex flex-col items-center flex-1 relative">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black z-10 transition-all duration-500",
                step >= 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110" : "bg-slate-800 text-slate-500"
              )}>
                1
              </div>
              <span className={cn(
                "text-[9px] uppercase tracking-[0.2em] mt-3 font-black",
                step >= 1 ? "text-blue-500" : "text-slate-500"
              )}>Origen</span>
              <div className={cn(
                "absolute h-1 w-[calc(100%-2.5rem)] left-[calc(50%+1.25rem)] top-5 transition-all duration-700",
                step > 1 ? "bg-blue-600" : "bg-slate-800"
              )} />
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black z-10 transition-all duration-500",
                step >= 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110" : "bg-slate-800 text-slate-500"
              )}>
                2
              </div>
              <span className={cn(
                "text-[9px] uppercase tracking-[0.2em] mt-3 font-black",
                step >= 2 ? "text-blue-500" : "text-slate-500"
              )}>Clasificación</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar flex-1">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre en Kommo</Label>
                  <Input
                    placeholder="Ej. Juan Pérez - Azur"
                    className="h-11 border-slate-200 rounded-xl font-bold text-sm"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celular / WhatsApp</Label>
                    <Input
                      placeholder="+51 999..."
                      className="h-11 border-slate-200 rounded-xl font-bold text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha de Ingreso</Label>
                    <Input
                      type="date"
                      className="h-11 border-slate-200 rounded-xl font-bold text-sm"
                      value={formData.leadEntryDate}
                      onChange={(e) => setFormData({ ...formData, leadEntryDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID de Conversación</Label>
                    <Input
                      placeholder="98234..."
                      className={cn(
                        "h-11 border-slate-200 rounded-xl font-mono font-bold",
                        kommoIdError && "border-red-500 bg-red-50 text-red-900 focus:border-red-600 focus:ring-red-100"
                      )}
                      value={formData.kommoId}
                      onChange={(e) => {
                        setFormData({ ...formData, kommoId: e.target.value });
                        setKommoIdError(false);
                      }}
                    />
                    {kommoIdError && (
                      <p className="text-[9px] text-red-600 font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                        ¡Este ID ya está registrado!
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marca AzurOS</Label>
                    <Select value={formData.brand} onValueChange={(v: any) => setFormData({ ...formData, brand: v })}>
                      <SelectTrigger className="h-11 border-slate-200 rounded-xl font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AZUR">AZUR</SelectItem>
                        <SelectItem value="COCINAPRO">COCINAPRO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría Inicial</Label>
                  <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-11 border-slate-200 rounded-xl font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="font-bold">
                              {cat.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {formData.category === 'POTENTIAL_CLIENT' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dirección del Proyecto</Label>
                            <Input 
                                placeholder="Calle, Distrito, Ciudad" 
                                className="h-11 rounded-xl"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metraje (m²)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="h-11 rounded-xl"
                                    value={formData.squareMeters}
                                    onChange={e => setFormData({...formData, squareMeters: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col justify-center space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">¿Tiene Planos?</Label>
                                    <Switch 
                                        checked={formData.hasBlueprints}
                                        onCheckedChange={v => setFormData({...formData, hasBlueprints: v})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalle de Requerimientos</Label>
                            <Textarea 
                                placeholder="¿Qué busca el cliente?" 
                                className="rounded-xl min-h-[80px]"
                                value={formData.requirementsDetail}
                                onChange={e => setFormData({...formData, requirementsDetail: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {formData.category === 'JOB_CANDIDATE' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Análisis Inicial CEO</Label>
                            <Textarea 
                                placeholder="Resumen del perfil y por qué es interesante..." 
                                className="rounded-xl min-h-[100px]"
                                value={formData.cvAnalysisSummary}
                                onChange={e => setFormData({...formData, cvAnalysisSummary: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link al CV (Google Drive/URL)</Label>
                            <Input 
                                placeholder="https://..." 
                                className="h-11 rounded-xl"
                                value={formData.fileUrl}
                                onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {(formData.category === 'CONFUSED' || formData.category === 'NO_RESPONSE') && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explicación del Descarte</Label>
                        <Textarea 
                            placeholder="¿Por qué se considera ruido?" 
                            className="rounded-xl min-h-[120px]"
                            value={formData.reasonDetail}
                            onChange={e => setFormData({...formData, reasonDetail: e.target.value})}
                        />
                    </div>
                )}

                {formData.category === 'SERVICE_OFFER' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre de la Empresa</Label>
                            <Input 
                                placeholder="Sourcing S.A.C" 
                                className="h-11 rounded-xl"
                                value={formData.companyName}
                                onChange={e => setFormData({...formData, companyName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalle de la Oferta</Label>
                            <Textarea 
                                placeholder="¿Qué servicios ofrecen?" 
                                className="rounded-xl min-h-[100px]"
                                value={formData.offerDetails}
                                onChange={e => setFormData({...formData, offerDetails: e.target.value})}
                            />
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/80 p-6 gap-3 sm:gap-0 border-t border-slate-100">
          {step === 1 ? (
            <>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-red-600 font-extrabold uppercase tracking-widest text-[10px]"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-xl transition-all active:scale-95 gap-2"
                onClick={handleNext}
              >
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-900 font-extrabold uppercase tracking-widest text-[10px] gap-2"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                onClick={handleSubmit}
              >
                {loading ? "PROCESANDO..." : "REGISTRAR LEAD"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
