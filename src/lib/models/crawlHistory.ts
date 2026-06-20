import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * Mirrors crawl_tracker.py's crawl_history collection. This is written by
 * the Python agent (crawl_tracker.record_province_crawl), never by the web
 * app — the web app only reads it for the /ops dashboard.
 */

export interface IEvalSummary {
  counts: number;
  averages: {
    search_precision: number;
    validator_accuracy: number;
    storage_new_insert_rate: number;
  };
  worst: Record<string, { score: number; where: string }>;
  totals: { total_saved: number; total_errors: number };
}

export interface ITokenUsageSummary {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  by_agent: Record<
    string,
    {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      cost_usd: number;
      calls: number;
    }
  >;
  by_agent_and_call_type: Record<
    string,
    {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      cost_usd: number;
      calls: number;
    }
  >;
}

export interface ICrawlHistory {
  id: string;
  province: string;
  last_crawled_at: Date | null;
  stores_saved: number;
  cities_crawled: string[];
  week_number: number;
  year: number;
  run_id: string;
  eval_summary: IEvalSummary | null;
  token_usage_summary: ITokenUsageSummary | null;
}

interface ICrawlHistoryDocument extends Document {
  province: string;
  last_crawled_at: Date;
  stores_saved: number;
  cities_crawled: string[];
  week_number: number;
  year: number;
  run_id: string;
  eval_summary?: IEvalSummary;
  token_usage_summary?: ITokenUsageSummary;
}

const crawlHistorySchema = new Schema<ICrawlHistoryDocument>(
  {
    province: { type: String, required: true },
    last_crawled_at: { type: Date, required: true },
    stores_saved: { type: Number, default: 0 },
    cities_crawled: { type: [String], default: [] },
    week_number: { type: Number, required: true },
    year: { type: Number, required: true },
    run_id: { type: String, default: "local" },
    // eval_summary / token_usage_summary are loosely-typed nested objects
    // written by Python — Schema.Types.Mixed avoids needing to keep this
    // TS schema in lockstep with every field Python might add.
    eval_summary: { type: Schema.Types.Mixed, default: null },
    token_usage_summary: { type: Schema.Types.Mixed, default: null },
  },
  {
    collection: "crawl_history",
    timestamps: false,
  }
);

crawlHistorySchema.index(
  { province: 1, year: 1, week_number: 1 },
  { unique: true }
);
crawlHistorySchema.index({ province: 1, last_crawled_at: -1 });

const CrawlHistory: Model<ICrawlHistoryDocument> =
  mongoose.models.CrawlHistory ??
  mongoose.model<ICrawlHistoryDocument>("CrawlHistory", crawlHistorySchema);

export default CrawlHistory;

export function toICrawlHistory(
  doc: ICrawlHistoryDocument | Record<string, unknown>
): ICrawlHistory {
  const raw = doc as ICrawlHistoryDocument & { _id?: { toString(): string } };
  const id = raw._id?.toString() ?? String((raw as { _id?: unknown })._id);
  return {
    id,
    province: raw.province,
    last_crawled_at: raw.last_crawled_at ?? null,
    stores_saved: raw.stores_saved ?? 0,
    cities_crawled: raw.cities_crawled ?? [],
    week_number: raw.week_number,
    year: raw.year,
    run_id: raw.run_id ?? "local",
    eval_summary: (raw.eval_summary as IEvalSummary) ?? null,
    token_usage_summary:
      (raw.token_usage_summary as ITokenUsageSummary) ?? null,
  };
}
