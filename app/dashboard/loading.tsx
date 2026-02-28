import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-slate-100" />
            <Skeleton className="h-3 w-32 bg-slate-100/50" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-100" />
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Skeleton className="h-14 w-80 rounded-2xl bg-white border border-slate-200" />
        <Skeleton className="h-14 w-40 rounded-2xl bg-white border border-slate-200" />
      </div>

      {/* Stats Bar Skeleton */}
      <div className="grid gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-white border border-slate-100" />
        ))}
      </div>

      {/* Table Skeletons */}
      <div className="grid lg:grid-cols-5 gap-8">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-[2rem] bg-white border border-slate-200" />
        <Skeleton className="lg:col-span-3 h-[400px] rounded-[2rem] bg-white border border-slate-200" />
      </div>
    </div>
  );
}
