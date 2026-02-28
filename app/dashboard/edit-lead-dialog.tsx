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
    Pencil,
    ChevronRight, 
    ChevronLeft, 
    UserCircle, 
    Briefcase, 
    FileText, 
    Dices
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateLead } from "@/lib/actions/leads";
import { Lead } from "./columns";

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const CATEGORIES = [
    { id: 'POTENTIAL_CLIENT', name: 'Cliente Potencial' },
    { id: 'JOB_CANDIDATE', name: 'Candidato / CV' },
    { id: 'SERVICE_OFFER', name: 'Oferta de Servicio' },
    { id: 'NO_RESPONSE', name: 'Sin Respuesta' },
    { id: 'CONFUSED', name: 'Confundido' },
    { id: 'NOT_INTERESTED', name: 'No Interesado' },
    { id: 'MANUAL_FOLLOW_UP', name: 'Intento / Seguimiento' },
];

const STATUSES = [
    { id: 'PENDING', name: 'Pendiente' },
    { id: 'WAITING_FOR_DATE', name: 'Por Programar' },
    { id: 'SCHEDULED', name: 'Programado' },
    { id: 'ARCHIVED', name: 'Archivado' },
];

export function EditLeadDialog({ open, onOpenChange, lead }: EditLeadDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    contactName: "",
    kommoId: "",
    brand: "AZUR" as "AZUR" | "COCINAPRO",
    category: "POTENTIAL_CLIENT",
    status: "PENDING",
    phone: "",
    leadEntryDate: "",
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
    if (open && lead) {
      setStep(1);
      setFormData({
        contactName: lead.contactName || "",
        kommoId: lead.kommoId || "",
        brand: lead.brand || "AZUR",
        category: lead.category || "POTENTIAL_CLIENT",
        status: lead.status || "PENDING",
        phone: lead.phone || "",
        leadEntryDate: lead.leadEntryDate || "",
        address: lead.prospect?.address || "",
        squareMeters: lead.prospect?.squareMeters?.toString() || "",
        materials: lead.prospect?.materials || "",
        hasBlueprints: lead.prospect?.hasBlueprints || false,
        requirementsDetail: lead.prospect?.requirementsDetail || "",
        companyName: lead.businessResource?.companyName || "",
        offerDetails: lead.businessResource?.offerDetails || "",
        cvAnalysisSummary: lead.businessResource?.cvAnalysisSummary || "",
        fileUrl: lead.businessResource?.fileUrl || "",
        reasonDetail: lead.discardReason?.reasonDetail || ""
      });
    }
  }, [open, lead]);

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!lead) return;
    setLoading(true);
    try {
      const result = await updateLead(lead.id, {
        ...formData,
        squareMeters: formData.squareMeters ? parseFloat(formData.squareMeters) : null
      });

      if (result.success) {
        onOpenChange(false);
      } else {
        alert("Error al actualizar lead");
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[550px] max-h-[90vh] flex flex-col border-none shadow-2xl [&>button]:text-white">
        <DialogHeader className="bg-[#1a1c1e] px-8 py-4 text-white relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Editar Información</DialogTitle>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Refinar detalles del Lead</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between px-4">
            <div className="flex flex-col items-center flex-1 relative">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black z-10 transition-all duration-500",
                step >= 1 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/40 scale-110" : "bg-slate-800 text-slate-500"
              )}>
                1
              </div>
              <span className={cn(
                "text-[9px] uppercase tracking-[0.2em] mt-3 font-black",
                step >= 1 ? "text-amber-500" : "text-slate-500"
              )}>Básico</span>
              <div className={cn(
                "absolute h-1 w-[calc(100%-2.5rem)] left-[calc(50%+1.25rem)] top-5 transition-all duration-700",
                step > 1 ? "bg-amber-500" : "bg-slate-800"
              )} />
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black z-10 transition-all duration-500",
                step >= 2 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/40 scale-110" : "bg-slate-800 text-slate-500"
              )}>
                2
              </div>
              <span className={cn(
                "text-[9px] uppercase tracking-[0.2em] mt-3 font-black",
                step >= 2 ? "text-amber-500" : "text-slate-500"
              )}>Avanzado</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar flex-1">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre de Lead</Label>
                  <Input
                    className="h-11 border-slate-200 rounded-xl font-bold text-sm"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celular / WhatsApp</Label>
                    <Input
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marca</Label>
                    <Select value={formData.brand} onValueChange={(v: any) => setFormData({ ...formData, brand: v })}>
                      <SelectTrigger className="h-11 border-slate-200 rounded-xl font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AZUR">AZUR</SelectItem>
                        <SelectItem value="COCINAPRO">COCINAPRO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Actual</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="h-11 border-slate-200 rounded-xl font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</Label>
                  <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-11 border-slate-200 rounded-xl font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {formData.category === 'POTENTIAL_CLIENT' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dirección</Label>
                            <Input className="h-11 rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metraje (m²)</Label>
                                <Input type="number" className="h-11 rounded-xl" value={formData.squareMeters} onChange={e => setFormData({...formData, squareMeters: e.target.value})} />
                            </div>
                            <div className="flex flex-col justify-center space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Planos</Label>
                                    <Switch checked={formData.hasBlueprints} onCheckedChange={v => setFormData({...formData, hasBlueprints: v})} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requerimientos</Label>
                            <Textarea className="rounded-xl min-h-[80px]" value={formData.requirementsDetail} onChange={e => setFormData({...formData, requirementsDetail: e.target.value})} />
                        </div>
                    </div>
                )}
                {/* Add other categories if needed or just use current structure */}
                {formData.category === 'JOB_CANDIDATE' && (
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Análisis CV</Label>
                        <Textarea className="rounded-xl min-h-[100px]" value={formData.cvAnalysisSummary} onChange={e => setFormData({...formData, cvAnalysisSummary: e.target.value})} />
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archivo URL</Label>
                        <Input className="h-11 rounded-xl" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} />
                    </div>
                )}
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/80 p-6 gap-3 sm:gap-0 border-t border-slate-100">
          <Button variant="ghost" className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {step === 1 ? (
            <Button className="bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-xl transition-all active:scale-95 gap-2" onClick={handleNext}>Continuar <ChevronRight className="h-4 w-4" /></Button>
          ) : (
            <div className="flex gap-3">
                <Button variant="ghost" className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px] gap-2" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4" /> Atrás</Button>
                <Button disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-xl shadow-xl shadow-amber-500/20" onClick={handleSubmit}>{loading ? "ACTUALIZANDO..." : "GUARDAR CAMBIOS"}</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
