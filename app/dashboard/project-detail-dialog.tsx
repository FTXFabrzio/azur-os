"use client";

import React, { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Plus
} from "lucide-react";
import { DataTable } from "./data-table";
import { fileColumns } from "./columns";
import { getDriveFolderByCode, registerProjectFileLink } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link2 } from "lucide-react";

const UPLOAD_LIMIT_MB = 8; // Safely below Vercel's 10MB limit

interface ProjectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  etiqueta: string;
  descripcion: string;
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  project,
}: ProjectDetailDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadingFile[]>([]);
  const [manualLink, setManualLink] = useState({ url: "", tag: "PLANOS", description: "" });
  const [isLinking, setIsLinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project) return null;

  const handleManualLinkSubmit = async () => {
    if (!manualLink.url) return;
    setIsLinking(true);
    try {
      const res = await registerProjectFileLink({
        projectId: project.id,
        driveFileLink: manualLink.url,
        etiqueta: manualLink.tag || "PLANOS",
        descripcion: manualLink.description || "Archivo vía Link"
      });
      if (res.success) {
        setManualLink({ url: "", tag: "PLANOS", description: "" });
        // Optional: show a toast or message
      } else {
        alert("Error: " + res.error);
      }
    } catch (err) {
      alert("Error al vincular archivo");
    } finally {
      setIsLinking(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
        etiqueta: file.name.split('.').pop()?.toUpperCase() || "FILE",
        descripcion: file.name
      }));
      setUploadFiles(prev => [...prev, ...newFiles]);
    }
  };

  const updateFileField = (index: number, field: 'etiqueta' | 'descripcion', value: string) => {
    setUploadFiles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUploads = async () => {
    setIsUploading(true);
    
    // We need the driveFolderId. If not in project, try to find it.
    let driveFolderId = project.driveFolderId;
    if (!driveFolderId) {
       driveFolderId = await getDriveFolderByCode(project.codigo);
    }

    if (!driveFolderId) {
      alert("No se pudo encontrar la carpeta de Drive del proyecto.");
      setIsUploading(false);
      return;
    }

    const promises = uploadFiles.map((fileObj, index) => {
      if (fileObj.status === 'completed' || fileObj.status === 'uploading') return Promise.resolve();

      return new Promise<void>((resolve) => {
        setUploadFiles(prev => {
          const next = [...prev];
          next[index].status = 'uploading';
          next[index].progress = 0;
          return next;
        });

        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('projectId', project.id);
        formData.append('driveFolderId', driveFolderId);
        formData.append('etiqueta', fileObj.etiqueta);
        formData.append('descripcion', fileObj.descripcion);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/projects/upload', true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadFiles(prev => {
              const next = [...prev];
              next[index].progress = percent;
              return next;
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              setUploadFiles(prev => {
                const next = [...prev];
                next[index].status = 'completed';
                next[index].progress = 100;
                return next;
              });
            } else {
              setUploadFiles(prev => {
                const next = [...prev];
                next[index].status = 'error';
                next[index].error = response.error || "Error desconocido";
                return next;
              });
            }
          } else {
            setUploadFiles(prev => {
              const next = [...prev];
              next[index].status = 'error';
              next[index].error = `Error del servidor: ${xhr.status}`;
              return next;
            });
          }
          resolve();
        };

        xhr.onerror = () => {
          setUploadFiles(prev => {
            const next = [...prev];
            next[index].status = 'error';
            next[index].error = "Error de red";
            return next;
          });
          resolve();
        };

        xhr.send(formData);
      });
    });

    await Promise.all(promises);
    setIsUploading(false);
    
    const allDone = uploadFiles.every(f => f.status === 'completed');
    if (allDone && uploadFiles.length > 0) {
       setTimeout(() => {
         setUploadFiles([]);
         // Note: dashboard will revalidate via server action or mutate
       }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] p-0 overflow-hidden border-none bg-slate-50 shadow-2xl rounded-[2rem]">
        <DialogHeader className="bg-slate-900 text-white p-8 relative overflow-hidden">
          {/* Decor background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <Badge className="bg-red-600 text-[10px] font-black tracking-widest uppercase mb-2 border-none">
                Proyecto Activo
              </Badge>
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none">
                {project.nombre}
              </DialogTitle>
              <p className="text-slate-400 font-mono text-xs tracking-[0.3em] font-bold">COD: {project.codigo}</p>
            </div>
            
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Archivos Totales</p>
               <p className="text-4xl font-black text-white">{project.archivos?.length || 0}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8 bg-white">
          
          {/* Actual Files Table */}
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 rounded-2xl p-1 mb-8">
              <TabsTrigger value="list" className="rounded-xl text-[10px] font-black uppercase tracking-widest">
                <FileText className="h-3.5 w-3.5 mr-2" />
                Sincronizados
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Upload className="h-3.5 w-3.5 mr-2" />
                Cargar
              </TabsTrigger>
              <TabsTrigger value="link" className="rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Link2 className="h-3.5 w-3.5 mr-2" />
                Vincular Drive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Documentación Sincronizada</h3>
              </div>

              {project.archivos && project.archivos.length > 0 ? (
                 <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <DataTable columns={fileColumns} data={project.archivos} />
                 </div>
              ) : (
                  <div className="border-2 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-slate-400 gap-3 grayscale opacity-50">
                     <FileText className="h-10 w-10" />
                     <p className="text-xs font-bold uppercase tracking-widest">Sin documentación cargada</p>
                  </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <div 
                className="border-2 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-red-50/30 hover:border-red-100 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">Seleccionar nuevos archivos</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Carga automática con túnel de alta capacidad</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect}
                />
              </div>

              {/* New Files to Upload List */}
              {uploadFiles.length > 0 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-3">
                       {uploadFiles.map((f, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-2xl border border-red-200/50 shadow-sm space-y-4">
                             <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                   <div className="bg-slate-50 p-2 rounded-lg">
                                     <FileText className="h-4 w-4 text-slate-400" />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 truncate">{f.file.name}</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        {f.file.size > UPLOAD_LIMIT_MB * 1024 * 1024 && f.status === 'uploading' && (
                                           <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-black h-4 px-1.5 animate-pulse">
                                             Transmitiendo datos de alta precisión...
                                           </Badge>
                                        )}
                                      </div>
                                   </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                                    onClick={() => removeUploadFile(idx)}
                                  >
                                    <X className="h-4 w-4 text-slate-400" />
                                  </Button>
                             </div>

                             <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                   <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Etiqueta</Label>
                                   <Input 
                                      value={f.etiqueta}
                                      onChange={(e) => updateFileField(idx, 'etiqueta', e.target.value.toUpperCase())}
                                      className="h-9 text-[11px] font-bold rounded-xl border-slate-200"
                                      placeholder="PLANOS, 3D..."
                                   />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                   <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Descripción</Label>
                                   <Input 
                                      value={f.descripcion}
                                      onChange={(e) => updateFileField(idx, 'descripcion', e.target.value)}
                                      className="h-9 text-[11px] font-bold rounded-xl border-slate-200"
                                      placeholder="Nombre descriptivo del archivo"
                                   />
                                </div>
                             </div>

                             {(f.status === 'uploading' || f.status === 'completed') && (
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className={cn(
                                       "h-full transition-all duration-300",
                                       f.status === 'completed' ? "bg-emerald-500" : "bg-red-600"
                                     )}
                                     style={{ width: `${f.progress}%` }}
                                   />
                                </div>
                             )}

                             {f.status === 'error' && (
                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg">{f.error}</p>
                             )}
                          </div>
                       ))}
                    </div>

                    <Button 
                      className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-red-900/10 gap-2"
                      onClick={startUploads}
                      disabled={isUploading || uploadFiles.every(f => f.status === 'completed')}
                    >
                      {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {isUploading ? "Sincronizando Archivos..." : "Iniciar Carga Maestro"}
                    </Button>
                 </div>
              )}
            </TabsContent>

            <TabsContent value="link" className="space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Url de Google Drive</Label>
                    <div className="relative">
                      <Input 
                        placeholder="https://drive.google.com/file/d/..."
                        className="h-12 bg-white border-slate-200 rounded-xl pr-12 focus:ring-red-600/20"
                        value={manualLink.url}
                        onChange={(e) => setManualLink({...manualLink, url: e.target.value})}
                      />
                      <Link2 className="absolute right-4 top-4 h-4 w-4 text-slate-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tag</Label>
                      <Input 
                        placeholder="MODELO 3D"
                        className="h-12 bg-white border-slate-200 rounded-xl uppercase font-black text-[10px]"
                        value={manualLink.tag}
                        onChange={(e) => setManualLink({...manualLink, tag: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</Label>
                      <Input 
                        placeholder="Descripción opcional del archivo"
                        className="h-12 bg-white border-slate-200 rounded-xl"
                        value={manualLink.description}
                        onChange={(e) => setManualLink({...manualLink, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-900 uppercase">Nota sobre permisos</p>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      Asegúrate de que el archivo tenga permisos de lectura para cualquier persona con el link o que esté compartido con la cuenta de servicio de AzurOS.
                    </p>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
                  disabled={!manualLink.url || isLinking}
                  onClick={handleManualLinkSubmit}
                >
                  {isLinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Vincular Documento Externo
                </Button>
              </div>
            </TabsContent>
          </Tabs>

        </div>

        <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100">
           <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest"
            onClick={() => onOpenChange(false)}
           >
             Cerrar Panel
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
