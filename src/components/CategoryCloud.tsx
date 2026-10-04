"use client";

import Link from "next/link";
import { useState } from "react";
import { getCategoryColor } from "@/lib/utils";

interface CategoryCount {
  category: string;
  count: number;
}

interface CategoryCloudProps {
  categories: CategoryCount[];
  /** How many tags to show before “Show more”. Default 14. */
  initialVisible?: number;
}

const SIZE_CLASSES = [
  "text-[11px] px-2 py-0.5",
  "text-xs px-2.5 py-1",
  "text-sm px-3 py-1",
] as const;

function sizeIndexForCount(count: number, min: number, max: number): number {
  if (max <= min) return 1;
  const ratio = (count - min) / (max - min);
  return Math.min(
    SIZE_CLASSES.length - 1,
    Math.max(0, Math.round(ratio * (SIZE_CLASSES.length - 1)))
  );
}

export function CategoryCloud({
  categories,
  initialVisible = 14,
}: CategoryCloudProps) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  const ordered = [...categories].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.category.localeCompare(b.category);
  });

  const visible = expanded
    ? ordered
    : ordered.slice(0, initialVisible);
  const hiddenCount = Math.max(0, ordered.length - initialVisible);

  const counts = visible.map((c) => c.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start sm:gap-2"
        role="list"
        aria-label="Store categories"
      >
        {visible.map(({ category, count }) => {
          const sizeClass =
            SIZE_CLASSES[sizeIndexForCount(count, min, max)];
          return (
            <Link
              key={category}
              href={`/stores?category=${encodeURIComponent(category)}`}
              role="listitem"
              title={`${count} ${count === 1 ? "store" : "stores"}`}
              className={`inline-flex items-center rounded-full font-medium transition-opacity hover:opacity-80 ${sizeClass} ${getCategoryColor(category)}`}
            >
              {category}
              <span className="ml-1 opacity-60 tabular-nums text-[0.85em]">
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <div className="flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-accent hover:underline"
            aria-expanded={expanded}
          >
            {expanded
              ? "Show fewer categories"
              : `Show ${hiddenCount} more categories`}
          </button>
        </div>
      )}
    </div>
  );
}
