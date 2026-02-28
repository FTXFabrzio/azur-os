"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FolderPlus, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  Plus
} from "lucide-react";
import { cn, generateSecureCode } from "@/lib/utils";
import { createProject, registerProjectFileLink } from "@/lib/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link2 } from "lucide-react";

const UPLOAD_LIMIT_MB = 8;

interface ProjectStepperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  driveFileId?: string;
  etiqueta: string;
  descripcion: string;
}

export function ProjectStepperDialog({
  open,
  onOpenChange,
}: ProjectStepperDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [manualLink, setManualLink] = useState({ url: "", tag: "PLANOS", description: "" });
  const [isLinking, setIsLinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectName && step === 1 && !projectCode) {
      setProjectCode(generateSecureCode(projectName));
    }
  }, [projectName, step, projectCode]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setProjectName("");
      setProjectCode("");
      setFiles([]);
      setProjectId(null);
      setDriveFolderId(null);
      setLoading(false);
      setManualLink({ url: "", tag: "PLANOS", description: "" });
      setIsLinking(false);
    }
  }, [open]);

  const handleNext = async () => {
    if (step === 1) {
      if (!projectName || !projectCode) return;
      
      setLoading(true);
      try {
        const result = await createProject(projectName, projectCode);
        if (result.success && result.data) {
          setProjectId(result.data.id);
          setDriveFolderId(result.data.driveFolderId);
          setStep(2);
        } else {
          alert("Error: " + result.error);
        }
      } catch (err) {
        alert("Error al crear proyecto");
      } finally {
        setLoading(false);
      }
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
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (index: number, field: 'etiqueta' | 'descripcion', value: string) => {
    setFiles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const startUploads = async () => {
    if (!projectId || !driveFolderId) return;
    setLoading(true);

    const uploadPromises = files.map((fileObj, index) => {
      if (fileObj.status === 'completed' || fileObj.status === 'uploading') return Promise.resolve();

      return new Promise<void>((resolve) => {
        setFiles(prev => {
          const next = [...prev];
          next[index].status = 'uploading';
          next[index].progress = 0;
          return next;
        });

        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('projectId', projectId);
        formData.append('driveFolderId', driveFolderId);
        formData.append('etiqueta', fileObj.etiqueta);
        formData.append('descripcion', fileObj.descripcion);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/projects/upload', true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setFiles(prev => {
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
              setFiles(prev => {
                const next = [...prev];
                next[index].status = 'completed';
                next[index].progress = 100;
                return next;
              });
            } else {
              setFiles(prev => {
                const next = [...prev];
                next[index].status = 'error';
                next[index].error = response.error || "Error desconocido";
                return next;
              });
            }
          } else {
            setFiles(prev => {
              const next = [...prev];
              next[index].status = 'error';
              next[index].error = `Error del servidor: ${xhr.status}`;
              return next;
            });
          }
          resolve();
        };

        xhr.onerror = () => {
          setFiles(prev => {
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

    await Promise.all(uploadPromises);
    setLoading(false);
    
    const allDone = files.every((f) => f.status === 'completed');
    if (allDone && files.length > 0) {
      setTimeout(() => onOpenChange(false), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[600px] border-none shadow-2xl bg-[#0a0a0a] text-zinc-100">
        <DialogHeader className="bg-gradient-to-r from-red-950/50 to-black px-6 py-6 text-white relative border-b border-red-900/20">
          <div className="flex items-center gap-4">
            <div className="bg-red-600/20 p-2.5 rounded-xl border border-red-500/30">
              <FolderPlus className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tighter uppercase">Nuevo Proyecto Azur</DialogTitle>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Evolución de infraestructura digital</p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between px-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1 relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all duration-500",
                  step >= i ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-zinc-800 text-zinc-500"
                )}>
                  {i}
                </div>
                <span className={cn(
                  "text-[9px] uppercase tracking-[0.2em] mt-2 font-black",
                  step >= i ? "text-red-500" : "text-zinc-600"
                )}>
                  {i === 1 ? "Definición" : "Archivos"}
                </span>
                
                {i === 1 && (
                  <div className={cn(
                    "absolute h-[1px] w-[calc(100%-2.5rem)] left-[calc(50%+1.25rem)] top-4 transition-all duration-700",
                    step > 1 ? "bg-red-600" : "bg-zinc-800"
                  )} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="p-8 min-h-[300px] bg-[#0a0a0a]">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nombre del Proyecto</Label>
                <Input
                  placeholder="Ej. Edificio Residencial Azur"
                  className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-red-600/50 text-white rounded-xl"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Código de Acceso</Label>
                <div className="relative group">
                  <Input
                    placeholder="Generando código..."
                    readOnly
                    className="h-12 bg-zinc-900/80 border-red-900/20 text-red-500 font-mono font-bold tracking-[0.3em] rounded-xl pr-12 text-center"
                    value={projectCode}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw 
                      className="h-4 w-4 text-zinc-600 cursor-pointer hover:text-red-500 transition-colors" 
                      onClick={() => setProjectCode(generateSecureCode(projectName))}
                    />
                  </div>
                </div>
                <p className="text-[9px] text-zinc-600 font-medium px-1 italic">
                  * Este código será el identificador único para la carpeta en Drive y el acceso del cliente.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-zinc-900 rounded-xl p-1 mb-6">
                  <TabsTrigger value="upload" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Subir Archivos
                  </TabsTrigger>
                  <TabsTrigger value="link" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Vincular Drive
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                  <div 
                    className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-zinc-900/20 hover:bg-red-900/5 hover:border-red-900/30 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-zinc-800 p-4 rounded-full group-hover:bg-red-600/10 transition-colors">
                      <Upload className="h-6 w-6 text-zinc-500 group-hover:text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-zinc-300">Seleccionar Planos o Archivos</p>
                      <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Soporta .glb, .pdf, .jpg, .png</p>
                    </div>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect}
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {files.map((fileObj, idx) => (
                        <div key={idx} className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl relative group overflow-hidden">
                          <div 
                            className="absolute inset-x-0 bottom-0 h-1 bg-red-600/20 transition-all duration-300"
                            style={{ width: `${fileObj.progress}%` }}
                          />
                          
                          <div className="flex items-center gap-4">
                            <div className="bg-zinc-800 p-2 rounded-lg">
                              <FileText className="h-4 w-4 text-zinc-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-200 truncate pr-6">{fileObj.file.name}</p>
                              <div className="flex items-center gap-2">
                                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">
                                   {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB • {fileObj.status}
                                 </p>
                                 {fileObj.file.size > UPLOAD_LIMIT_MB * 1024 * 1024 && fileObj.status === 'uploading' && (
                                    <Badge className="bg-red-600/10 text-red-500 border-red-500/20 text-[7px] h-3 px-1 animate-pulse">
                                      TRANSMITIENDO ALTA PRECISIÓN...
                                    </Badge>
                                 )}
                              </div>
                            </div>
                            
                            {fileObj.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : fileObj.status === 'error' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : fileObj.status === 'uploading' ? (
                              <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                            ) : (
                              <X 
                                className="h-4 w-4 text-zinc-600 hover:text-white cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(idx);
                                }}
                              />
                            )}
                          </div>
                          
                          {fileObj.status === 'pending' && (
                            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800">
                              <div className="space-y-1">
                                <Label className="text-[8px] font-black uppercase text-zinc-500">Tag</Label>
                                <Input 
                                  value={fileObj.etiqueta}
                                  onChange={(e) => updateFileMetadata(idx, 'etiqueta', e.target.value.toUpperCase())}
                                  className="h-7 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-200 rounded-lg"
                                />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <Label className="text-[8px] font-black uppercase text-zinc-500">Descripción</Label>
                                <Input 
                                  value={fileObj.descripcion}
                                  onChange={(e) => updateFileMetadata(idx, 'descripcion', e.target.value)}
                                  className="h-7 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-200 rounded-lg"
                                />
                              </div>
                            </div>
                          )}
                          
                          {fileObj.error && (
                            <p className="text-[9px] text-red-400 mt-2 font-medium">{fileObj.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <Button
                      disabled={loading || files.every(f => f.status === 'completed')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-900/20 active:scale-95 px-10 rounded-xl"
                      onClick={startUploads}
                    >
                      {loading ? "Sincronizando..." : "Iniciar Carga Maestro"}
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="link" className="space-y-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Url de Google Drive</Label>
                        <div className="relative">
                          <Input 
                            placeholder="https://drive.google.com/file/d/..."
                            className="h-12 bg-zinc-900 border-zinc-800 rounded-xl pr-12 focus:border-red-600/50 text-white"
                            value={manualLink.url}
                            onChange={(e) => setManualLink({...manualLink, url: e.target.value})}
                          />
                          <Link2 className="absolute right-4 top-4 h-4 w-4 text-zinc-600" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tag</Label>
                          <Input 
                            placeholder="PLANOS"
                            className="h-12 bg-zinc-900 border-zinc-800 rounded-xl uppercase font-black text-[10px] text-white"
                            value={manualLink.tag}
                            onChange={(e) => setManualLink({...manualLink, tag: e.target.value.toUpperCase()})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Descripción</Label>
                          <Input 
                            placeholder="Descripción opcional"
                            className="h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white"
                            value={manualLink.description}
                            onChange={(e) => setManualLink({...manualLink, description: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl gap-2 active:scale-95 transition-all"
                      disabled={!manualLink.url || isLinking}
                      onClick={async () => {
                        if (!projectId) return;
                        setIsLinking(true);
                        try {
                          const res = await registerProjectFileLink({
                            projectId,
                            driveFileLink: manualLink.url,
                            etiqueta: manualLink.tag || "PLANOS",
                            descripcion: manualLink.description || "Archivo vía Link"
                          });
                          if (res.success) {
                            setTimeout(() => onOpenChange(false), 1000);
                          } else {
                            alert("Error: " + res.error);
                          }
                        } catch (err) {
                          alert("Error al vincular");
                        } finally {
                          setIsLinking(false);
                        }
                      }}
                    >
                      {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Finalizar y Vincular
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter className="bg-zinc-900/30 p-6 gap-3 sm:gap-0 border-t border-zinc-900/50">
          {step === 1 ? (
            <>
              <Button
                variant="ghost"
                className="text-zinc-500 hover:text-zinc-300 hover:bg-transparent font-black text-[10px] uppercase tracking-widest"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                disabled={!projectName || !projectCode || loading}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-900/20 active:scale-95 gap-2 px-8 rounded-xl"
                onClick={handleNext}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preparar Entorno"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                disabled={loading || isLinking}
                className="text-zinc-500 hover:text-zinc-300 hover:bg-transparent font-black text-[10px] uppercase tracking-widest gap-2"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Configuración
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
