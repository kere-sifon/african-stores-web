"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1)
  );

  const withEllipsis: (number | "ellipsis")[] = [];
  let last = 0;
  for (const p of pages) {
    if (p - last > 1) withEllipsis.push("ellipsis");
    withEllipsis.push(p);
    last = p;
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="border-border-warm"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {withEllipsis.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(item)}
            className={cn(
              "min-w-9",
              item === page
                ? "bg-accent text-card-warm hover:bg-accent/90"
                : "border-border-warm"
            )}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="border-border-warm"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
