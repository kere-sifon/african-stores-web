"use client";

import { useCallback, useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CostTrendPoint } from "@/lib/ops";

interface CostTrendChartsProps {
  initialTrend: CostTrendPoint[];
  initialProvinces: string[];
}

const AGENT_COLORS = {
  search_cost_usd: "#c84b11",
  validate_cost_usd: "#2d6a4f",
  storage_cost_usd: "#f4a261",
} as const;

function CostTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toFixed(4)}
        </p>
      ))}
      <p className="mt-1 border-t border-border pt-1 font-medium">
        Total: ${total.toFixed(4)}
      </p>
    </div>
  );
}

function EmptyTrendState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <p>No cost data yet for this filter.</p>
      <p className="text-xs">
        Token/cost tracking is recorded starting with the cost-tracking
        feature — older crawls won&apos;t appear here.
      </p>
    </div>
  );
}

export function CostTrendCharts({
  initialTrend,
  initialProvinces,
}: CostTrendChartsProps) {
  const [trend, setTrend] = useState(initialTrend);
  const [province, setProvince] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleProvinceChange = useCallback((value: string) => {
    setProvince(value);
    startTransition(async () => {
      const params = new URLSearchParams();
      if (value) params.set("province", value);
      const res = await fetch(`/api/v1/admin/costs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTrend(data.trend);
      }
    });
  }, []);

  const totalCost = trend.reduce((sum, p) => sum + p.total_cost_usd, 0);
  const totalTokens = trend.reduce((sum, p) => sum + p.total_tokens, 0);
  const costPerRun = trend.length ? totalCost / trend.length : 0;

  const agentTotals = trend.reduce(
    (acc, p) => ({
      search: acc.search + p.search_cost_usd,
      validate: acc.validate + p.validate_cost_usd,
      storage: acc.storage + p.storage_cost_usd,
    }),
    { search: 0, validate: 0, storage: 0 }
  );
  const costliestAgent = (
    Object.entries(agentTotals) as [string, number][]
  ).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Token &amp; cost trend
          </h1>
          <p className="text-sm text-muted-foreground">
            Per-agent token usage and Bedrock Haiku 4.5 cost, per crawl run.
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
              ${totalCost.toFixed(4)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Total cost</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold">
              ${costPerRun.toFixed(4)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Avg cost per run
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold">
              {totalTokens.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total tokens
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="px-4">
            <p className="font-mono text-2xl font-semibold capitalize">
              {costliestAgent && costliestAgent[1] > 0
                ? costliestAgent[0]
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Costliest agent
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={isPending ? "opacity-60 transition-opacity" : ""}>
        <CardHeader>
          <CardTitle>Cost per run, by agent</CardTitle>
          <CardDescription>
            Stacked by specialist agent (search / validate / storage) — each
            run made 6 LLM calls total, 2 per agent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <EmptyTrendState />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trend} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `$${v.toFixed(3)}`}
                />
                <Tooltip content={<CostTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="search_cost_usd"
                  name="Search"
                  stackId="cost"
                  fill={AGENT_COLORS.search_cost_usd}
                />
                <Bar
                  dataKey="validate_cost_usd"
                  name="Validate"
                  stackId="cost"
                  fill={AGENT_COLORS.validate_cost_usd}
                />
                <Bar
                  dataKey="storage_cost_usd"
                  name="Storage"
                  stackId="cost"
                  fill={AGENT_COLORS.storage_cost_usd}
                />
              </BarChart>
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
                    <th className="py-2 pr-4 font-medium">Tokens</th>
                    <th className="py-2 pr-4 font-medium">Search</th>
                    <th className="py-2 pr-4 font-medium">Validate</th>
                    <th className="py-2 pr-4 font-medium">Storage</th>
                    <th className="py-2 pr-4 font-medium">Total cost</th>
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
                        {point.total_tokens.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        ${point.search_cost_usd.toFixed(4)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        ${point.validate_cost_usd.toFixed(4)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        ${point.storage_cost_usd.toFixed(4)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono font-medium">
                        ${point.total_cost_usd.toFixed(4)}
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
