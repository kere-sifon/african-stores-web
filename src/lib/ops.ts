import { connectDB } from "@/lib/db";
import CrawlHistory, {
  ICrawlHistory,
  toICrawlHistory,
} from "@/lib/models/crawlHistory";
import { toIPendingReview } from "@/lib/models/pendingReview";
import PendingReview from "@/lib/models/pendingReview";

/**
 * PROVINCE_ROTATION mirrors provinces.py's PROVINCE_ROTATION list exactly.
 * Kept here rather than derived from crawl_history so that provinces with
 * zero crawl history yet still show up as "never crawled" rather than
 * being silently absent from the coverage view.
 */
export const PROVINCE_ROTATION = [
  "Ontario",
  "Quebec",
  "Alberta",
  "British Columbia",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Prince Edward Island",
  "Newfoundland",
] as const;

export interface ProvinceCoverage {
  province: string;
  last_crawled_at: Date | null;
  days_since_crawl: number | null;
  stores_saved: number | null;
  run_id: string | null;
}

/**
 * Mirrors crawl_tracker.get_crawl_coverage() — for each province in the
 * rotation, find its most recent crawl_history record (if any) and compute
 * days since last crawl. Provinces never crawled show null fields rather
 * than being omitted, so the dashboard can render a clear "never crawled"
 * state per province.
 */
export async function getCrawlCoverage(): Promise<ProvinceCoverage[]> {
  await connectDB();

  const results: ProvinceCoverage[] = [];
  const now = Date.now();

  for (const province of PROVINCE_ROTATION) {
    const record = await CrawlHistory.findOne({ province })
      .sort({ last_crawled_at: -1 })
      .lean();

    if (!record) {
      results.push({
        province,
        last_crawled_at: null,
        days_since_crawl: null,
        stores_saved: null,
        run_id: null,
      });
      continue;
    }

    const crawledAt = record.last_crawled_at as Date | undefined;
    const daysSince = crawledAt
      ? Math.floor((now - new Date(crawledAt).getTime()) / 86_400_000)
      : null;

    results.push({
      province,
      last_crawled_at: crawledAt ?? null,
      days_since_crawl: daysSince,
      stores_saved: (record.stores_saved as number) ?? null,
      run_id: (record.run_id as string) ?? null,
    });
  }

  return results;
}

/** Most recent N crawl_history records across all provinces, newest first. */
export async function getRecentCrawls(limit = 10): Promise<ICrawlHistory[]> {
  await connectDB();

  const docs = await CrawlHistory.find({})
    .sort({ last_crawled_at: -1 })
    .limit(limit)
    .lean();

  return docs.map((doc) => toICrawlHistory(doc));
}

export interface ReviewQueueStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

/** Mirrors pending_review.get_review_stats() — counts by status. */
export async function getReviewQueueStats(): Promise<ReviewQueueStats> {
  await connectDB();

  const [pending, approved, rejected] = await Promise.all([
    PendingReview.countDocuments({ status: "pending" }),
    PendingReview.countDocuments({ status: "approved" }),
    PendingReview.countDocuments({ status: "rejected" }),
  ]);

  return { pending, approved, rejected, total: pending + approved + rejected };
}

/** Most recent N pending review entries, for a small preview on the status page. */
export async function getRecentPendingReviews(limit = 5) {
  await connectDB();

  const docs = await PendingReview.find({ status: "pending" })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return docs.map((doc) => toIPendingReview(doc));
}

export type CoverageStatus = "never" | "fresh" | "due" | "stale";

/**
 * Coverage freshness classification. The crawl rotation is one province per
 * week (10 provinces / 10 weeks), so "stale" means a province has gone
 * meaningfully longer than one full rotation cycle without being crawled —
 * a signal the scheduled cron may have silently stopped running, not just
 * normal rotation lag. Exported as a pure function so it's unit-testable
 * without a database connection.
 */
export function coverageStatus(entry: ProvinceCoverage): CoverageStatus {
  if (entry.last_crawled_at === null || entry.days_since_crawl === null) {
    return "never";
  }
  if (entry.days_since_crawl <= 14) return "fresh";
  if (entry.days_since_crawl <= 70) return "due"; // within ~one rotation cycle
  return "stale";
}

export interface OpsOverview {
  coverage: ProvinceCoverage[];
  recentCrawls: ICrawlHistory[];
  reviewStats: ReviewQueueStats;
  recentReviews: ReturnType<typeof toIPendingReview>[];
}

/** Single aggregated fetch for the /ops status page — one round trip, four queries in parallel. */
export async function getOpsOverview(): Promise<OpsOverview> {
  await connectDB();

  const [coverage, recentCrawls, reviewStats, recentReviews] =
    await Promise.all([
      getCrawlCoverage(),
      getRecentCrawls(10),
      getReviewQueueStats(),
      getRecentPendingReviews(5),
    ]);

  return { coverage, recentCrawls, reviewStats, recentReviews };
}
