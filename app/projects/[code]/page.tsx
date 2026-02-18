import ModelViewer from "@/components/projects/ModelViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProjectDetailPage({
  params,
  searchParams
}: {
  params: { code: string } | any;
  searchParams: { fileId?: string } | any;
}) {
  const { code } = await params;
  const { fileId } = await searchParams;

  if (!fileId) {
    redirect("/projects");
  }

  const modelSrc = `/api/projects/model?fileId=${fileId}`;

  return (
    <main className="h-screen w-screen flex flex-col bg-[#0A0A0A] overflow-hidden relative">
      {/* Immersive View */}
      <div className="flex-1 w-full h-full relative">
        <ModelViewer src={modelSrc} />
      </div>

      {/* Control Overlay */}
      <div className="absolute top-8 left-8 right-8 flex items-start justify-between pointer-events-none">
        <Link href="/projects" className="pointer-events-auto">
          <Button variant="ghost" className="bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 rounded-full py-6 px-6">
            <ArrowLeft className="h-5 w-5 mr-3" />
            <span className="font-bold text-sm tracking-tight">SALIR DEL PORTAL</span>
          </Button>
        </Link>

        <div className="text-right">
            <p className="text-red-500 font-black text-[10px] tracking-[0.3em] uppercase mb-1">Proyecto Activo</p>
            <p className="text-white font-bold text-2xl tracking-tighter">REF: {code.toUpperCase()}</p>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 right-8 pointer-events-none text-right">
         <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">
           Modelado de Alta Precisión por Azur Architecture
         </p>
      </div>
    </main>
  );
}
