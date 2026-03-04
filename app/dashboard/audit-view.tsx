"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, History, UserX, Phone, Calendar, Hash, Building2, Zap, ExternalLink } from 'lucide-react'
import { searchDiscardedLeads } from '@/lib/actions/leads'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export function AuditView() {
  const [searchId, setSearchId] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const data = await searchDiscardedLeads(searchId)
    setResults(data)
    setLoading(false)
  }

  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-6">
         <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-2xl border border-red-200">
                <History className="h-5 w-5 text-red-600" />
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Mapping Histórico</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Busca leads descartados por ID de Kommo para defender tu gestión</p>
            </div>
         </div>
         <Badge className="bg-red-500 text-white border-none px-6 py-2 rounded-full font-black text-xs tracking-widest shadow-lg shadow-red-200">
            BASE HISTÓRICA
         </Badge>
      </div>

      <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Ingresa ID de Kommo o Nombre..." 
                className="pl-10 h-12 rounded-xl border-slate-200 text-sm font-medium"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-8 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest gap-2"
            >
              {loading ? "Buscando..." : "Consultar Registro"}
            </Button>
          </div>

          <div className="space-y-4">
             {results.length > 0 ? (
                results.map((item) => (
                  <div key={item.id} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-amber-200 transition-all duration-300 relative">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div className="col-span-2 space-y-1">
                           <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-black text-base uppercase tracking-tight">{item.contactName}</span>
                              <Badge className={item.brand === 'AZUR' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}>{item.brand}</Badge>
                           </div>
                           <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex-wrap">
                              {(() => {
                                 let href = null;
                                 let displayId = item.kommoId || "N/A";
                                 const isUrl = displayId.includes('http');
                                 
                                 if (isUrl) {
                                    href = displayId.trim();
                                    const match = href.match(/leads\/detail\/(\d+)/);
                                    if (match) {
                                        displayId = match[1];
                                    } else {
                                        displayId = "Ver en Kommo";
                                    }
                                 }

                                 return href ? (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors px-2 py-0.5 rounded border border-blue-100 w-fit">
                                       <ExternalLink className="h-3 w-3" /> {displayId}
                                    </a>
                                 ) : (
                                    <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-100 w-fit">
                                       <Hash className="h-3 w-3" /> {displayId}
                                    </span>
                                 )
                              })()}
                              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {item.phone || 'SIN TELÉFONO'}</span>
                           </div>
                        </div>
                        
                        <div className="space-y-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Motivo de Descarte</span>
                           <div className="flex flex-col">
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50 rounded-full font-black text-[9px] px-3 py-1 w-fit uppercase">
                                 {item.category}: {item.reason}
                              </Badge>
                           </div>
                        </div>

                        <div className="md:text-right space-y-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registro de Registro</span>
                           <div className="flex items-center md:justify-end gap-1.5 text-slate-700 font-bold text-[11px] uppercase">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {item.discardedAt ? format(new Date(item.discardedAt), "PPP p", { locale: es }) : 'N/A'}
                           </div>
                        </div>
                     </div>
                  </div>
                ))
             ) : (
                !loading && (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                     <div className="bg-slate-50 p-6 rounded-full mb-4">
                        {searchId ? <UserX className="h-10 w-10 text-slate-200" /> : <History className="h-10 w-10 text-slate-200" />}
                     </div>
                     <h4 className="text-slate-900 font-black uppercase tracking-tighter text-xl">Sin resultados</h4>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                        {searchId ? "No encontramos registros históricos para este ID o nombre en Azur OS." : "Aún no hay registros en el historial de descartados."}
                     </p>
                  </div>
                )
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
