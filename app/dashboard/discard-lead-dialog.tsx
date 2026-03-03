"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  MessageSquare,
  SearchX,
  UserX,
  AlertTriangle,
  Building2,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { archiveLead, createDirectDiscard } from "@/lib/actions/leads"

interface DiscardLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: any // Optional if direct creation
}

const CATEGORIES = [
  { id: "NO_RESPONSE", label: "No Responde", icon: <UserX className="h-4 w-4" /> },
  { id: "CONFUSED", label: "Confundido", icon: <SearchX className="h-4 w-4" /> },
]

const REASONS: Record<string, string[]> = {
  "NO_RESPONSE": [
    "El cliente no estuvo de acuerdo con el precio",
    "El cliente estaba indeciso sobre su proyecto",
    "El cliente no proporciono los datos",
    "El cliente nunca respondio el primer mensaje",
    "El cliente se encontraba fuera del rango operativo (provincia)"
  ],
  "CONFUSED": [
    "El cliente no deseaba nuestros servicios",
    "El cliente pensaba que vendíamos construcciones hechas",
    "El cliente pensaba que vendíamos en unitario"
  ]
}

const PERIODS = ["FEBRERO", "MARZO", "ABRIL"]

export function DiscardLeadDialog({ open, onOpenChange, lead }: DiscardLeadDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("NO_RESPONSE")
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [customReason, setCustomReason] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const month = new Date().getMonth() // 0-11
    if (month === 1) return "FEBRERO"
    if (month === 2) return "MARZO"
    if (month === 3) return "ABRIL"
    return "MARZO"
  })
  const [brand, setBrand] = useState<"AZUR" | "COCINAPRO">("AZUR")
  const [kommoId, setKommoId] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Status feedback
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const isDirectMode = !lead;

  const handleDiscard = async () => {
    if (!selectedReason && selectedReason !== "Otro") {
      setStatus('error')
      setErrorMessage("Olvidaste seleccionar el motivo del descarte. Por favor elige uno de la lista.")
      return
    }

    if (isDirectMode && (!kommoId || !contactName)) {
        setStatus('error')
        setErrorMessage("¡Casi listo! Necesitamos al menos el ID de Kommo y el Nombre para que el registro de auditoría sea válido.")
        return
    }

    setLoading(true)
    setStatus('idle')
    try {
      const finalReason = selectedReason === "Otro" ? customReason : selectedReason

      let result;
      if (isDirectMode) {
        result = await createDirectDiscard({
            brand,
            category: selectedCategory,
            reason: finalReason,
            period: selectedPeriod,
            kommoId,
            contactName,
            phone
        });
      } else {
        result = await archiveLead(lead.id, finalReason, selectedCategory, selectedPeriod)
      }
      
      if (result.success) {
        setStatus('success')
        setSelectedReason("")
        setCustomReason("")
        setKommoId("")
        setContactName("")
        setPhone("")
        // Auto close after 2 seconds
        setTimeout(() => {
            onOpenChange(false)
            setStatus('idle')
        }, 2500)
      } else {
        setStatus('error')
        setErrorMessage(result.error || "Hubo un problema técnico al guardar el descarte. Por favor intenta de nuevo.")
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage("Vaya, algo salió mal en la conexión. Asegúrate de tener internet e intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
        <div className="bg-[#1a1c1e] p-8 text-white relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-red-500/20 p-3 rounded-2xl">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">
                {isDirectMode ? "Registrar Descarte Directo" : "Eliminar Lead"}
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Registro de estadísticas de pérdida</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[60vh] custom-scrollbar relative">
          {/* Feedback Overlay */}
          {status !== 'idle' && (
              <div className={cn(
                  "absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300",
                  status === 'success' ? "bg-emerald-500 text-white" : "bg-white"
              )}>
                  <div className={cn(
                      "p-6 rounded-full border-4 mb-4",
                      status === 'success' ? "border-white" : "border-red-100 bg-red-50"
                  )}>
                      {status === 'success' ? (
                          <Check className="h-12 w-12 text-white animate-bounce" />
                      ) : (
                          <SearchX className="h-12 w-12 text-red-600 animate-pulse" />
                      )}
                  </div>
                  <h3 className={cn(
                      "text-2xl font-black uppercase tracking-tighter mb-2",
                      status === 'success' ? "text-white" : "text-slate-900"
                  )}>
                      {status === 'success' ? "¡Mapeo Exitoso!" : "¡Ups! Algo faltó"}
                  </h3>
                  <p className={cn(
                      "text-xs font-bold leading-relaxed max-w-[280px]",
                      status === 'success' ? "text-white/80" : "text-slate-500"
                  )}>
                      {status === 'success' 
                        ? "Hemos guardado el registro correctamente. El lead ha sido filtrado para el histórico." 
                        : errorMessage}
                  </p>
                  {status === 'error' && (
                      <Button 
                        variant="outline" 
                        onClick={() => setStatus('idle')}
                        className="mt-6 border-slate-200 text-slate-900 font-black text-[10px] uppercase h-10 px-8 rounded-xl"
                      >
                          Entendido, corregir
                      </Button>
                  )}
              </div>
          )}

          <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contabilizar en Mes de:</Label>
              <div className="flex gap-2">
                  {PERIODS.map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        className={cn(
                            "flex-1 py-3 rounded-2xl border-2 transition-all font-black text-[10px] tracking-widest",
                            selectedPeriod === p ? "bg-slate-900 border-slate-900 text-white" : "border-slate-100 text-slate-400"
                        )}
                      >
                          {p}
                      </button>
                  ))}
              </div>
          </div>

          {isDirectMode ? (
              <div className="space-y-6">
                  <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seleccionar Marca</Label>
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setBrand("AZUR")}
                            className={cn(
                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                brand === "AZUR" ? "border-slate-900 bg-slate-50" : "border-slate-100 opacity-60"
                            )}
                          >
                              <div className="bg-slate-900 p-2 rounded-lg"><Building2 className="h-4 w-4 text-white" /></div>
                              <span className="text-[10px] font-black uppercase">AZUR</span>
                          </button>
                          <button 
                            onClick={() => setBrand("COCINAPRO")}
                            className={cn(
                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                brand === "COCINAPRO" ? "border-red-600 bg-red-50" : "border-slate-100 opacity-60"
                            )}
                          >
                              <div className="bg-red-600 p-2 rounded-lg"><Building2 className="h-4 w-4 text-white" /></div>
                              <span className="text-[10px] font-black uppercase">COCINAPRO</span>
                          </button>
                      </div>
                  </div>

                  <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Datos del Lead (Para Auditoría)</Label>
                      <div className="space-y-3">
                          <div className="space-y-1.5">
                              <Input 
                                  placeholder="ID de Kommo (Link o Número)" 
                                  className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold"
                                  value={kommoId}
                                  onChange={(e) => setKommoId(e.target.value)}
                              />
                          </div>
                          <div className="space-y-1.5">
                              <Input 
                                  placeholder="Nombre del Contacto" 
                                  className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold"
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                              />
                          </div>
                          <div className="space-y-1.5">
                              <Input 
                                  placeholder="Celular / WhatsApp" 
                                  className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                              />
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lead a Eliminar</span>
                <span className="text-sm font-bold text-slate-900">{lead.contactName}</span>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">ID: {lead.kommoId}</div>
            </div>
          )}

          <div className="space-y-3">
             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría del Descarte</Label>
             <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(cat.id)
                            setSelectedReason("")
                        }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            selectedCategory === cat.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
             </div>
          </div>

          <div className="space-y-3">
             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motivo Específico</Label>
             <div className="space-y-2">
                {REASONS[selectedCategory].map((reason) => (
                    <button
                        key={reason}
                        onClick={() => setSelectedReason(reason)}
                        className={cn(
                            "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group",
                            selectedReason === reason 
                                ? "border-slate-900 bg-slate-50" 
                                : "border-slate-100 hover:border-slate-200"
                        )}
                    >
                        <span className={cn(
                            "text-xs font-bold leading-tight flex-1",
                            selectedReason === reason ? "text-slate-900" : "text-slate-500"
                        )}>
                            {reason}
                        </span>
                        {selectedReason === reason ? (
                            <Check className="h-4 w-4 text-slate-900" />
                        ) : (
                            <ChevronRight className="h-3 w-3 text-slate-200 group-hover:text-slate-400" />
                        )}
                    </button>
                ))}
                <button
                    onClick={() => setSelectedReason("Otro")}
                    className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                        selectedReason === "Otro" ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                    )}
                >
                    <span className={cn(
                        "text-xs font-bold flex-1",
                        selectedReason === "Otro" ? "text-slate-900" : "text-slate-500"
                    )}>Otro Motivo</span>
                    {selectedReason === "Otro" && <Check className="h-4 w-4 text-slate-900" />}
                </button>
             </div>
          </div>

          {selectedReason === "Otro" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <textarea 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-medium focus:outline-none focus:border-slate-900 transition-colors"
                    placeholder="Especificar motivo detallado..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                  />
              </div>
          )}

          <div className="flex items-start gap-3 bg-red-50 p-4 rounded-3xl border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-900/60 leading-relaxed uppercase tracking-tighter">
                  ESTO ELIMINARÁ EL REGISTRO POR COMPLETO DE LA TABLA DE LEADS PERO LO SUMARÁ AL CONTEO DE ESTADÍSTICAS POR {selectedCategory.replace('_', ' ')}.
              </p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 bg-white">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 mr-2"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDiscard}
            disabled={loading || !selectedReason || (selectedReason === "Otro" && !customReason)}
            className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all"
          >
            {loading ? "PROCESANDO..." : "CONFIRMAR ELIMINAR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
