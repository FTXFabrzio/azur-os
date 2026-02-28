import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black -z-10" />
      
      <div className="w-full max-w-[500px] space-y-8 animate-pulse text-center">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full bg-zinc-900 border border-red-900/20" />
          <div className="space-y-3">
             <Skeleton className="h-8 w-48 bg-zinc-900 mx-auto" />
             <Skeleton className="h-4 w-64 bg-zinc-900/50 mx-auto" />
          </div>
        </div>

        <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 space-y-6">
           <Skeleton className="h-14 w-full bg-zinc-900 rounded-2xl" />
           <Skeleton className="h-14 w-full bg-red-900/20 rounded-2xl border border-red-900/10" />
        </div>

        <div className="flex justify-center">
          <Skeleton className="h-3 w-32 bg-zinc-900/30" />
        </div>
      </div>
    </div>
  );
}
