"use client";

import { useCallback, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReviewQueueStats } from "@/lib/ops";
import type { IPendingReview, ReviewStatus } from "@/lib/models/pendingReview";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface ReviewQueueListProps {
  initialQueue: IPendingReview[];
  initialStats: ReviewQueueStats;
}

type ActionState = { id: string; kind: "approve" | "reject" } | null;

function StatusBadge({ status }: { status: ReviewStatus }) {
  if (status === "approved") {
    return <Badge variant="secondary">Approved</Badge>;
  }
  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="outline">Pending</Badge>;
}

function ReviewCard({
  review,
  onApprove,
  onReject,
  pendingAction,
}: {
  review: IPendingReview;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  pendingAction: ActionState;
}) {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isApproving =
    pendingAction?.id === review.id && pendingAction.kind === "approve";
  const isRejecting =
    pendingAction?.id === review.id && pendingAction.kind === "reject";
  const isBusy = isApproving || isRejecting;

  const store = review.store;

  return (
    <Card>
      <CardContent className="space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{store.name ?? "Unnamed candidate"}</p>
            <p className="text-xs text-muted-foreground">
              {review.city}
              {store.category ? ` · ${store.category}` : ""}
            </p>
          </div>
          <StatusBadge status={review.status} />
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
          {store.address && (
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd>{store.address}</dd>
            </div>
          )}
          {store.phone && (
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{store.phone}</dd>
            </div>
          )}
          {store.website && (
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd className="truncate">{store.website}</dd>
            </div>
          )}
          {store.source_url && (
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd className="truncate">{store.source_url}</dd>
            </div>
          )}
        </dl>

        {store.description && (
          <p className="text-xs text-muted-foreground">{store.description}</p>
        )}

        <p className="text-xs italic text-muted-foreground">
          Flagged: {review.reason}
        </p>

        {review.status === "pending" && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => onApprove(review.id)}
              disabled={isBusy}
            >
              {isApproving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Approve
            </Button>
            {!showRejectReason ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectReason(true)}
                disabled={isBusy}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            ) : (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-w-[160px] flex-1 rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(review.id, rejectReason)}
                  disabled={isBusy}
                >
                  {isRejecting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Confirm reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRejectReason(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {review.status !== "pending" && review.reviewed_at && (
          <p className="text-xs text-muted-foreground">
            {review.status === "approved" ? "Approved" : "Rejected"}{" "}
            {new Date(review.reviewed_at).toLocaleString("en-CA")}
            {review.rejection_reason ? ` — ${review.rejection_reason}` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ReviewQueueList({
  initialQueue,
  initialStats,
}: ReviewQueueListProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [stats, setStats] = useState(initialStats);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">(
    "pending"
  );
  const [pendingAction, setPendingAction] = useState<ActionState>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const refetch = useCallback((status: ReviewStatus | "all") => {
    startTransition(async () => {
      const res = await fetch(`/api/v1/admin/review?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue);
        setStats(data.stats);
      }
    });
  }, []);

  const handleFilterChange = useCallback(
    (status: ReviewStatus | "all") => {
      setStatusFilter(status);
      refetch(status);
    },
    [refetch]
  );

  const handleApprove = useCallback(
    async (id: string) => {
      setErrorMessage(null);
      setPendingAction({ id, kind: "approve" });
      try {
        const res = await fetch(`/api/v1/admin/review/${id}/approve`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error ?? "Failed to approve");
        } else {
          refetch(statusFilter);
        }
      } catch {
        setErrorMessage("Network error — failed to approve");
      } finally {
        setPendingAction(null);
      }
    },
    [refetch, statusFilter]
  );

  const handleReject = useCallback(
    async (id: string, reason: string) => {
      setErrorMessage(null);
      setPendingAction({ id, kind: "reject" });
      try {
        const res = await fetch(`/api/v1/admin/review/${id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error ?? "Failed to reject");
        } else {
          refetch(statusFilter);
        }
      } catch {
        setErrorMessage("Network error — failed to reject");
      } finally {
        setPendingAction(null);
      }
    },
    [refetch, statusFilter]
  );

  const filters: { value: ReviewStatus | "all"; label: string }[] = [
    { value: "pending", label: `Pending (${stats.pending})` },
    { value: "approved", label: `Approved (${stats.approved})` },
    { value: "rejected", label: `Rejected (${stats.rejected})` },
    { value: "all", label: `All (${stats.total})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Review queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Low-confidence stores flagged by the Validator Agent. Approve to
            save into the directory, or reject to discard.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {queue.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nothing here</CardTitle>
            <CardDescription>
              No {statusFilter === "all" ? "" : statusFilter} reviews right
              now.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {queue.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onReject={handleReject}
              pendingAction={pendingAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
