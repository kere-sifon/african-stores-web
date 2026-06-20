import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OpsNav } from "@/components/ops/OpsNav";
import { ReviewQueueList } from "@/components/ops/ReviewQueueList";
import { getReviewQueue, getReviewQueueStats } from "@/lib/ops";

export const dynamic = "force-dynamic";

function ReviewLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function ReviewContent() {
  let queue: Awaited<ReturnType<typeof getReviewQueue>> = [];
  let stats: Awaited<ReturnType<typeof getReviewQueueStats>> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };
  let loadFailed = false;

  try {
    [queue, stats] = await Promise.all([
      getReviewQueue("pending", 100),
      getReviewQueueStats(),
    ]);
  } catch (error) {
    console.error("Failed to load review queue:", error);
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <OpsNav />
      {loadFailed && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load the review queue right now. The database may be
          unavailable — try again shortly.
        </p>
      )}
      <ReviewQueueList initialQueue={queue} initialStats={stats} />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <ReviewContent />
    </Suspense>
  );
}
