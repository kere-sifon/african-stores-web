"use client";

import { useCallback, useState, useTransition } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvalTrendPoint } from "@/lib/ops";

interface EvalTrendChartsProps {
  initialTrend: EvalTrendPoint[];
  initialProvinces: string[];
}

const METRIC_COLORS = {
  search_precision: "#c84b11", // primary (terracotta)
  validator_accuracy: "#2d6a4f", // secondary (forest)
  storage_new_insert_rate: "#f4a261", // accent
} as const;

function ScoreTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(3)}
        </p>
      ))}
    </div>
  );
}

function EmptyTrendState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <p>No eval data yet for this filter.</p>
      <p className="text-xs">
        Eval scores are recorded starting with the eval-loop feature — older
        crawls won&apos;t appear here.
      </p>
    </div>
  );
}

export function EvalTrendCharts({
  initialTrend,
  initialProvinces,
}: EvalTrendChartsProps) {
  const [trend, setTrend] = useState(initialTrend);
  const [province, setProvince] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleProvinceChange = useCallback((value: string) => {
    setProvince(value);
    startTransition(async () => {
      const params = new URLSearchParams();
      if (value) params.set("province", value);
      const res = await fetch(`/api/v1/admin/evals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTrend(data.trend);
      }
    });
  }, []);

  const totalSaved = trend.reduce((sum, p) => sum + p.total_saved, 0);
  const totalErrors = trend.reduce((sum, p) => sum + p.total_errors, 0);
  const avgSearchPrecision = trend.length
    ? trend.reduce((sum, p) => sum + p.search_precision, 0) / trend.length
    : 0;
  const avgValidatorAccuracy = trend.length
    ? trend.reduce((sum, p) => sum + p.validator_accuracy, 0) / trend.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Eval scores over time
          </h1>
          <p className="text-sm text-muted-foreground">
            Search precision, validator accuracy, and storage new-insert rate
            per crawl run.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Province</span>
          <select
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All provinces</option>
            {initialProvinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold">
              {avgSearchPrecision.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Avg search precision
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold">
              {avgValidatorAccuracy.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Avg validator accuracy
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold">{totalSaved}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total stores saved
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold">{totalErrors}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total pipeline errors
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={isPending ? "opacity-60 transition-opacity" : ""}>
        <CardHeader>
          <CardTitle>Per-agent eval scores</CardTitle>
          <CardDescription>
            One point per crawl run. Scores are averages across all
            (city, category) combinations evaluated in that run.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <EmptyTrendState />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trend} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip content={<ScoreTooltip />} />
                <Line
                  type="monotone"
                  dataKey="search_precision"
                  name="Search precision"
                  stroke={METRIC_COLORS.search_precision}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="validator_accuracy"
                  name="Validator accuracy"
                  stroke={METRIC_COLORS.validator_accuracy}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="storage_new_insert_rate"
                  name="Storage new-insert rate"
                  stroke={METRIC_COLORS.storage_new_insert_rate}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run detail</CardTitle>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs to show.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Province</th>
                    <th className="py-2 pr-4 font-medium">Runs evaluated</th>
                    <th className="py-2 pr-4 font-medium">Search precision</th>
                    <th className="py-2 pr-4 font-medium">Validator accuracy</th>
                    <th className="py-2 pr-4 font-medium">Storage insert rate</th>
                    <th className="py-2 pr-4 font-medium">Saved</th>
                    <th className="py-2 pr-4 font-medium">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {[...trend].reverse().map((point) => (
                    <tr
                      key={point.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                        {point.date}
                      </td>
                      <td className="py-2.5 pr-4 font-medium">
                        {point.province}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {point.runs_evaluated}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {point.search_precision.toFixed(3)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {point.validator_accuracy.toFixed(3)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {point.storage_new_insert_rate.toFixed(3)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {point.total_saved}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {point.total_errors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
