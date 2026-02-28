import { ProjectForm } from "@/components/projects/ProjectForm";
import { CircuitBackground } from "@/components/ui/CircuitBackground";
import { Suspense } from "react";
import Loading from "./loading";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative select-none">
      {/* Immersive background with circuits */}
      <CircuitBackground />

      {/* Main Content */}
      <Suspense fallback={<Loading />}>
        <ProjectForm />
      </Suspense>

      {/* Corner accents for the "almost full screen card" feeling */}
      <div className="fixed top-0 left-0 w-full h-full border-[20px] border-black pointer-events-none z-30 opacity-50" />
      
      {/* Decorative vertical lines on sides */}
      <div className="fixed left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-red-600/20 to-transparent" />
      <div className="fixed right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-red-600/20 to-transparent" />

      {/* Footer text */}
      <div className="fixed bottom-10 left-0 right-0 text-center z-20">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em] blur-[0.3px]">
        Fortex Digital Solutions &copy; 2026
        </p>
      </div>
    </main>
  );
}
