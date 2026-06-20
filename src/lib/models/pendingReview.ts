import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * Mirrors pending_review.py's pending_review collection. Written by the
 * Python agent's Validator (low-confidence candidates) and updated by
 * approve/reject actions — those actions can originate from either the
 * Python CLI or, once built, the /ops review queue UI calling this same
 * collection directly.
 */

export interface IPendingReviewStore {
  name?: string;
  category?: string;
  city?: string;
  province?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  source_url?: string;
  confidence?: string;
  [key: string]: unknown;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IPendingReview {
  id: string;
  store: IPendingReviewStore;
  city: string;
  category: string;
  reason: string;
  run_id: string;
  status: ReviewStatus;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  rejection_reason?: string | null;
}

interface IPendingReviewDocument extends Document {
  store: IPendingReviewStore;
  city: string;
  category: string;
  reason: string;
  run_id: string;
  status: ReviewStatus;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  rejection_reason?: string | null;
}

const pendingReviewSchema = new Schema<IPendingReviewDocument>(
  {
    store: { type: Schema.Types.Mixed, required: true },
    city: { type: String, required: true },
    category: { type: String, default: "" },
    reason: { type: String, default: "" },
    run_id: { type: String, default: "local" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    created_at: { type: Date, default: Date.now },
    reviewed_at: { type: Date, default: null },
    reviewed_by: { type: String, default: null },
    rejection_reason: { type: String, default: null },
  },
  {
    collection: "pending_review",
    timestamps: false,
  }
);

pendingReviewSchema.index({ status: 1, created_at: -1 });
pendingReviewSchema.index({ city: 1, status: 1 });

const PendingReview: Model<IPendingReviewDocument> =
  mongoose.models.PendingReview ??
  mongoose.model<IPendingReviewDocument>("PendingReview", pendingReviewSchema);

export default PendingReview;

export function toIPendingReview(
  doc: IPendingReviewDocument | Record<string, unknown>
): IPendingReview {
  const raw = doc as IPendingReviewDocument & { _id?: { toString(): string } };
  const id = raw._id?.toString() ?? String((raw as { _id?: unknown })._id);
  return {
    id,
    store: raw.store ?? {},
    city: raw.city,
    category: raw.category ?? "",
    reason: raw.reason ?? "",
    run_id: raw.run_id ?? "local",
    status: raw.status ?? "pending",
    created_at: raw.created_at,
    reviewed_at: raw.reviewed_at ?? null,
    reviewed_by: raw.reviewed_by ?? null,
    rejection_reason: raw.rejection_reason ?? null,
  };
}
