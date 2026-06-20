import { connectDB } from "@/lib/db";
import CrawlHistory, {
  ICrawlHistory,
  toICrawlHistory,
} from "@/lib/models/crawlHistory";
import { toIPendingReview } from "@/lib/models/pendingReview";
import PendingReview, {
  IPendingReviewStore,
  ReviewStatus,
} from "@/lib/models/pendingReview";
import Store from "@/lib/models/store";
import { slugify } from "@/lib/utils";

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

export interface EvalTrendPoint {
  id: string;
  province: string;
  date: string; // ISO date string, for chart x-axis
  search_precision: number;
  validator_accuracy: number;
  storage_new_insert_rate: number;
  total_saved: number;
  total_errors: number;
  runs_evaluated: number;
}

/**
 * Eval scores across crawl_history records, oldest first (chart-friendly
 * chronological order — opposite of getRecentCrawls, which is newest-first
 * for a "recent activity" list). Only records with eval_summary populated
 * are included; older records predating the eval-loop feature are skipped
 * rather than rendered as zero, which would be misleading on a trend chart.
 */
export async function getEvalTrend(
  province?: string,
  limit = 50
): Promise<EvalTrendPoint[]> {
  await connectDB();

  const query: Record<string, unknown> = { eval_summary: { $ne: null } };
  if (province) query.province = province;

  const docs = await CrawlHistory.find(query)
    .sort({ last_crawled_at: -1 })
    .limit(limit)
    .lean();

  return docs
    .map((doc) => {
      const evalSummary = doc.eval_summary as
        | ICrawlHistory["eval_summary"]
        | undefined;
      if (!evalSummary) return null;
      return {
        id: String(doc._id),
        province: doc.province as string,
        date: doc.last_crawled_at
          ? new Date(doc.last_crawled_at as Date).toISOString().slice(0, 10)
          : "",
        search_precision: evalSummary.averages.search_precision,
        validator_accuracy: evalSummary.averages.validator_accuracy,
        storage_new_insert_rate: evalSummary.averages.storage_new_insert_rate,
        total_saved: evalSummary.totals.total_saved,
        total_errors: evalSummary.totals.total_errors,
        runs_evaluated: evalSummary.counts,
      };
    })
    .filter((point): point is EvalTrendPoint => point !== null)
    .reverse(); // oldest first for chart x-axis
}

export interface CostTrendPoint {
  id: string;
  province: string;
  date: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  search_cost_usd: number;
  validate_cost_usd: number;
  storage_cost_usd: number;
}

/**
 * Token/cost data across crawl_history records, oldest first. Only records
 * with token_usage_summary populated are included — same reasoning as
 * getEvalTrend: skip pre-feature records rather than show misleading zeros.
 */
export async function getCostTrend(
  province?: string,
  limit = 50
): Promise<CostTrendPoint[]> {
  await connectDB();

  const query: Record<string, unknown> = { token_usage_summary: { $ne: null } };
  if (province) query.province = province;

  const docs = await CrawlHistory.find(query)
    .sort({ last_crawled_at: -1 })
    .limit(limit)
    .lean();

  return docs
    .map((doc) => {
      const usage = doc.token_usage_summary as
        | ICrawlHistory["token_usage_summary"]
        | undefined;
      if (!usage) return null;
      const byAgent = usage.by_agent ?? {};
      return {
        id: String(doc._id),
        province: doc.province as string,
        date: doc.last_crawled_at
          ? new Date(doc.last_crawled_at as Date).toISOString().slice(0, 10)
          : "",
        total_input_tokens: usage.total_input_tokens,
        total_output_tokens: usage.total_output_tokens,
        total_tokens: usage.total_tokens,
        total_cost_usd: usage.total_cost_usd,
        search_cost_usd: byAgent.search?.cost_usd ?? 0,
        validate_cost_usd: byAgent.validate?.cost_usd ?? 0,
        storage_cost_usd: byAgent.storage?.cost_usd ?? 0,
      };
    })
    .filter((point): point is CostTrendPoint => point !== null)
    .reverse();
}

/** Distinct provinces that have eval_summary or token_usage_summary data, for a filter dropdown. */
export async function getProvincesWithTrendData(): Promise<string[]> {
  await connectDB();

  const provinces = await CrawlHistory.distinct("province", {
    $or: [{ eval_summary: { $ne: null } }, { token_usage_summary: { $ne: null } }],
  });

  return (provinces as string[]).sort((a, b) => a.localeCompare(b));
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

/**
 * Full review queue listing for the /ops/review page — all pending entries
 * by default, or filter by status to see history. Unlike
 * getRecentPendingReviews (used for the small status-page preview), this
 * has no hard limit beyond the page-level `limit` param, since the review
 * queue page is meant to be worked through in full.
 */
export async function getReviewQueue(
  status: ReviewStatus | "all" = "pending",
  limit = 100
) {
  await connectDB();

  const query = status === "all" ? {} : { status };
  const docs = await PendingReview.find(query)
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return docs.map((doc) => toIPendingReview(doc));
}

export interface ReviewActionResult {
  success: boolean;
  message: string;
}

/** Safely coerce an unknown candidate field to a non-empty string, or null. */
function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** Safely coerce an unknown candidate field to a string array. */
function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

/**
 * Validate a candidate store has the minimum fields needed to save —
 * mirrors models.StoreInfo's required fields (name, category) plus the
 * same contact-info quality gate tools.py's store_meets_quality enforces
 * (at least one of address/phone/website). Returns an error message if
 * invalid, or null if the candidate passes.
 */
export function validateReviewCandidate(
  store: IPendingReviewStore
): string | null {
  if (!store.name || !store.name.trim()) {
    return "Candidate is missing a name";
  }
  if (!store.category || !store.category.trim()) {
    return "Candidate is missing a category";
  }
  const hasContact = Boolean(
    store.address?.trim() || store.phone?.trim() || store.website?.trim()
  );
  if (!hasContact) {
    return "Candidate has no address, phone, or website";
  }
  return null;
}

/**
 * Approve a pending review: validates the candidate, upserts it into the
 * main stores collection (same name_lower+city_lower dedup key the Python
 * agent uses — see storage_mongo.py's save_store), then marks the review
 * approved. Mirrors pending_review.approve_review's behavior exactly,
 * including the race-condition guard (only proceeds if status is still
 * "pending" at update time) and refusing to re-approve an already-decided
 * review.
 */
export async function approveReview(
  reviewId: string,
  reviewedBy = "ops-dashboard"
): Promise<ReviewActionResult> {
  await connectDB();

  const review = await PendingReview.findById(reviewId);
  if (!review) {
    return { success: false, message: `Review ${reviewId} not found` };
  }
  if (review.status !== "pending") {
    return {
      success: false,
      message: `Review ${reviewId} already ${review.status}`,
    };
  }

  const candidate = review.store;
  const validationError = validateReviewCandidate(candidate);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const name = candidate.name as string;
  const city = (candidate.city as string) ?? review.city;
  const nameLower = name.trim().toLowerCase();
  const cityLower = (city ?? "").trim().toLowerCase();

  const existing = await Store.findOne({
    name_lower: nameLower,
    city_lower: cityLower,
  }).select("_id");

  if (existing) {
    // Already in the directory (e.g. saved by a later crawl before this
    // review was actioned) — mark the review approved without a duplicate
    // insert, matching save_store's "Already in database" outcome.
    const result = await PendingReview.updateOne(
      { _id: reviewId, status: "pending" },
      {
        $set: {
          status: "approved",
          reviewed_at: new Date(),
          reviewed_by: reviewedBy,
        },
      }
    );
    if (result.matchedCount === 0) {
      return {
        success: false,
        message: `Review ${reviewId} was updated by someone else — refresh and retry`,
      };
    }
    return {
      success: true,
      message: `${name} (${city}) was already in the directory — review marked approved`,
    };
  }

  await Store.create({
    name,
    category: candidate.category,
    region_focus: asStringOrNull(candidate.region_focus),
    address: asStringOrNull(candidate.address),
    city: city ?? null,
    province: asStringOrNull(candidate.province),
    postal_code: asStringOrNull(candidate.postal_code),
    phone: asStringOrNull(candidate.phone),
    website: asStringOrNull(candidate.website),
    email: asStringOrNull(candidate.email),
    hours: asStringOrNull(candidate.hours),
    description: asStringOrNull(candidate.description),
    products_and_specialties: asStringArray(candidate.products_and_specialties),
    source_url: asStringOrNull(candidate.source_url),
    slug: slugify(name, city ?? ""),
    name_lower: nameLower,
    city_lower: cityLower,
  });

  const result = await PendingReview.updateOne(
    { _id: reviewId, status: "pending" },
    {
      $set: {
        status: "approved",
        reviewed_at: new Date(),
        reviewed_by: reviewedBy,
      },
    }
  );

  if (result.matchedCount === 0) {
    // Store was already saved above — don't report this as a failure,
    // mirroring approve_review's same "saved but status update failed"
    // tolerance.
    return {
      success: true,
      message: `Saved ${name} (${city}), but review status update raced — refresh to confirm`,
    };
  }

  return { success: true, message: `Approved and saved: ${name} (${city})` };
}

/**
 * Reject a pending review: marks it rejected, never writes to the main
 * stores collection. Mirrors pending_review.reject_review exactly.
 */
export async function rejectReview(
  reviewId: string,
  reviewedBy = "ops-dashboard",
  reason = ""
): Promise<ReviewActionResult> {
  await connectDB();

  const result = await PendingReview.updateOne(
    { _id: reviewId, status: "pending" },
    {
      $set: {
        status: "rejected",
        reviewed_at: new Date(),
        reviewed_by: reviewedBy,
        rejection_reason: reason,
      },
    }
  );

  if (result.matchedCount === 0) {
    return {
      success: false,
      message: `Review ${reviewId} not found or not pending`,
    };
  }

  return { success: true, message: `Rejected review ${reviewId}` };
}