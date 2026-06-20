import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CostTrendCharts } from "@/components/ops/CostTrendCharts";
import { OpsNav } from "@/components/ops/OpsNav";
import { getCostTrend, getProvincesWithTrendData } from "@/lib/ops";

export const dynamic = "force-dynamic";

function CostsLoading() {
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

async function CostsContent() {
  let trend: Awaited<ReturnType<typeof getCostTrend>> = [];
  let provinces: string[] = [];
  let loadFailed = false;

  try {
    [trend, provinces] = await Promise.all([
      getCostTrend(undefined, 50),
      getProvincesWithTrendData(),
    ]);
  } catch (error) {
    console.error("Failed to load cost trend:", error);
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <OpsNav />
      {loadFailed && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load cost data right now. The database may be
          unavailable — try again shortly.
        </p>
      )}
      <CostTrendCharts initialTrend={trend} initialProvinces={provinces} />
    </div>
  );
}

export default function CostsPage() {
  return (
    <Suspense fallback={<CostsLoading />}>
      <CostsContent />
    </Suspense>
  );
}
