import Link from "next/link";
import { getCategoryColor } from "@/lib/utils";

interface CategoryCount {
  category: string;
  count: number;
}

interface CategoryCloudProps {
  categories: CategoryCount[];
}

const SIZE_CLASSES = [
  "text-xs px-2.5 py-1",
  "text-sm px-3 py-1.5",
  "text-base px-3.5 py-1.5",
  "text-lg px-4 py-2",
  "text-xl px-5 py-2.5 font-semibold",
] as const;

function sizeIndexForCount(
  count: number,
  min: number,
  max: number
): number {
  if (max <= min) return 2;
  const ratio = (count - min) / (max - min);
  return Math.min(
    SIZE_CLASSES.length - 1,
    Math.max(0, Math.round(ratio * (SIZE_CLASSES.length - 1)))
  );
}

export function CategoryCloud({ categories }: CategoryCloudProps) {
  if (categories.length === 0) return null;

  const counts = categories.map((c) => c.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  // Larger (more common) categories first so the cloud reads with clear hierarchy
  const ordered = [...categories].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.category.localeCompare(b.category);
  });

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4"
      role="list"
      aria-label="Store categories"
    >
      {ordered.map(({ category, count }) => {
        const sizeClass =
          SIZE_CLASSES[sizeIndexForCount(count, min, max)];
        return (
          <Link
            key={category}
            href={`/stores?category=${encodeURIComponent(category)}`}
            role="listitem"
            title={`${count} ${count === 1 ? "store" : "stores"}`}
            className={`inline-flex items-center rounded-full font-medium transition-all hover:scale-105 hover:opacity-90 ${sizeClass} ${getCategoryColor(category)}`}
          >
            {category}
            <span className="ml-1.5 opacity-70 tabular-nums text-[0.85em]">
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
