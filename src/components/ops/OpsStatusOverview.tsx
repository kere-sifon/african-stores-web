import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { coverageStatus, type OpsOverview, type ProvinceCoverage } from "@/lib/ops";
import { AlertCircle, CheckCircle2, Clock, Inbox } from "lucide-react";

function formatRelativeDays(days: number | null): string {
  if (days === null) return "never";
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

const STATUS_BADGE: Record<
  ReturnType<typeof coverageStatus>,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  fresh: { label: "Fresh", variant: "secondary" },
  due: { label: "Due soon", variant: "outline" },
  stale: { label: "Stale", variant: "destructive" },
  never: { label: "Never crawled", variant: "destructive" },
};

function ProvinceCoverageTable({ coverage }: { coverage: ProvinceCoverage[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Province</th>
            <th className="py-2 pr-4 font-medium">Last crawled</th>
            <th className="py-2 pr-4 font-medium">Stores saved</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {coverage.map((entry) => {
            const status = coverageStatus(entry);
            const badge = STATUS_BADGE[status];
            return (
              <tr
                key={entry.province}
                className="border-b border-border/60 last:border-0"
              >
                <td className="py-2.5 pr-4 font-medium">{entry.province}</td>
                <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                  {formatRelativeDays(entry.days_since_crawl)}
                </td>
                <td className="py-2.5 pr-4 font-mono">
                  {entry.stores_saved ?? "—"}
                </td>
                <td className="py-2.5 pr-4">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "good";
}) {
  const toneClass =
    tone === "warning"
      ? "text-destructive"
      : tone === "good"
        ? "text-secondary"
        : "text-foreground";

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3 px-4">
        <Icon className={`h-5 w-5 ${toneClass}`} aria-hidden />
        <div>
          <p className="font-mono text-2xl font-semibold leading-none">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OpsStatusOverview({ overview }: { overview: OpsOverview }) {
  const { coverage, recentCrawls, reviewStats, recentReviews } = overview;

  const staleCount = coverage.filter(
    (c) => coverageStatus(c) === "stale" || coverageStatus(c) === "never"
  ).length;
  const lastCrawl = recentCrawls[0] ?? null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={Clock}
          label="Last crawl"
          value={
            lastCrawl
              ? new Date(lastCrawl.last_crawled_at ?? "").toLocaleDateString(
                  "en-CA"
                )
              : "—"
          }
        />
        <SummaryCard
          icon={AlertCircle}
          label="Provinces stale or never crawled"
          value={staleCount}
          tone={staleCount > 0 ? "warning" : "good"}
        />
        <SummaryCard
          icon={Inbox}
          label="Pending review"
          value={reviewStats.pending}
          tone={reviewStats.pending > 0 ? "warning" : "good"}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Total stores saved (recent crawls)"
          value={recentCrawls.reduce((sum, c) => sum + c.stores_saved, 0)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Province coverage</CardTitle>
          <CardDescription>
            One province crawled per week on rotation. A province is flagged
            stale if it hasn&apos;t been crawled in over one full rotation
            cycle (~70 days).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProvinceCoverageTable coverage={coverage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent crawl runs</CardTitle>
          <CardDescription>
            Most recent {recentCrawls.length} crawl_history records, across
            all provinces.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentCrawls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No crawl history yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Province</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Saved</th>
                    <th className="py-2 pr-4 font-medium">Search precision</th>
                    <th className="py-2 pr-4 font-medium">Validator accuracy</th>
                    <th className="py-2 pr-4 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCrawls.map((crawl) => (
                    <tr
                      key={crawl.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium">
                        {crawl.province}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                        {crawl.last_crawled_at
                          ? new Date(crawl.last_crawled_at).toLocaleDateString(
                              "en-CA"
                            )
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {crawl.stores_saved}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {crawl.eval_summary
                          ? crawl.eval_summary.averages.search_precision.toFixed(
                              3
                            )
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {crawl.eval_summary
                          ? crawl.eval_summary.averages.validator_accuracy.toFixed(
                              3
                            )
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {crawl.token_usage_summary
                          ? `$${crawl.token_usage_summary.total_cost_usd.toFixed(4)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review queue</CardTitle>
          <CardDescription>
            Low-confidence stores flagged by the Validator Agent, awaiting
            approval or rejection. {reviewStats.approved} approved,{" "}
            {reviewStats.rejected} rejected to date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing pending review right now.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentReviews.map((review) => (
                <li key={review.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {review.store.name ?? "Unnamed candidate"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.city} · {review.reason}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(review.created_at).toLocaleDateString("en-CA")}
                    </Badge>
                  </div>
                  <Separator className="mt-3" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
