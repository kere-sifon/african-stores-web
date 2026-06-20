import { NextRequest, NextResponse } from "next/server";
import { getReviewQueue, getReviewQueueStats } from "@/lib/ops";
import type { ReviewStatus } from "@/lib/models/pendingReview";

export const dynamic = "force-dynamic";

const VALID_STATUSES: (ReviewStatus | "all")[] = [
  "pending",
  "approved",
  "rejected",
  "all",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get("status") ?? "pending";
    const status = (
      VALID_STATUSES.includes(statusParam as ReviewStatus | "all")
        ? statusParam
        : "pending"
    ) as ReviewStatus | "all";
    const limit = Math.min(
      500,
      Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10) || 100)
    );

    const [queue, stats] = await Promise.all([
      getReviewQueue(status, limit),
      getReviewQueueStats(),
    ]);

    return NextResponse.json({ queue, stats });
  } catch (error) {
    console.error("GET /api/v1/admin/review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review queue" },
      { status: 500 }
    );
  }
}
