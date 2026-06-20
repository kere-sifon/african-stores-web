import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OpsNav } from "@/components/ops/OpsNav";
import { OpsStatusOverview } from "@/components/ops/OpsStatusOverview";
import { getOpsOverview, type OpsOverview } from "@/lib/ops";

export const dynamic = "force-dynamic";

function OpsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

const EMPTY_OVERVIEW: OpsOverview = {
  coverage: [],
  recentCrawls: [],
  reviewStats: { pending: 0, approved: 0, rejected: 0, total: 0 },
  recentReviews: [],
};

async function OpsContent() {
  let overview = EMPTY_OVERVIEW;
  let loadFailed = false;

  try {
    overview = await getOpsOverview();
  } catch (error) {
    console.error("Failed to load ops overview:", error);
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Crawl operations
        </h1>
        <p className="text-sm text-muted-foreground">
          Coverage, eval scores, cost, and review queue for the African
          Stores Canada crawler.
        </p>
      </div>
      <OpsNav />
      {loadFailed && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load operational data right now. The database may be
          unavailable — try again shortly.
        </p>
      )}
      <OpsStatusOverview overview={overview} />
    </div>
  );
}

export default function OpsPage() {
  return (
    <Suspense fallback={<OpsLoading />}>
      <OpsContent />
    </Suspense>
  );
}
