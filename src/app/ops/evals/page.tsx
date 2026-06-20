import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EvalTrendCharts } from "@/components/ops/EvalTrendCharts";
import { OpsNav } from "@/components/ops/OpsNav";
import { getEvalTrend, getProvincesWithTrendData } from "@/lib/ops";

export const dynamic = "force-dynamic";

function EvalsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

async function EvalsContent() {
  let trend: Awaited<ReturnType<typeof getEvalTrend>> = [];
  let provinces: string[] = [];
  let loadFailed = false;

  try {
    [trend, provinces] = await Promise.all([
      getEvalTrend(undefined, 50),
      getProvincesWithTrendData(),
    ]);
  } catch (error) {
    console.error("Failed to load eval trend:", error);
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <OpsNav />
      {loadFailed && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load eval data right now. The database may be
          unavailable — try again shortly.
        </p>
      )}
      <EvalTrendCharts initialTrend={trend} initialProvinces={provinces} />
    </div>
  );
}

export default function EvalsPage() {
  return (
    <Suspense fallback={<EvalsLoading />}>
      <EvalsContent />
    </Suspense>
  );
}
