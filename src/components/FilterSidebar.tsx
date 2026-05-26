"use client";

import { useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { FilterState } from "@/lib/filters";

export type { FilterState };

interface FilterSidebarProps {
  availableCities: string[];
  availableCategories: string[];
  availableRegions: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div>
      <h3 className="font-heading text-sm font-semibold text-ink mb-3">
        {title}
      </h3>
      <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <li key={option}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink hover:text-accent transition-colors">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option)}
                  className="h-4 w-4 rounded border-border-warm text-accent focus:ring-accent"
                />
                <span>{option}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FilterSidebar({
  availableCities,
  availableCategories,
  availableRegions,
  filters,
  onChange,
  className,
}: FilterSidebarProps) {
  const toggle = useCallback(
    (key: keyof FilterState, value: string) => {
      const current = filters[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onChange({ ...filters, [key]: next });
    },
    [filters, onChange]
  );

  const clearAll = () => {
    onChange({ cities: [], categories: [], regions: [] });
  };

  const hasFilters =
    filters.cities.length > 0 ||
    filters.categories.length > 0 ||
    filters.regions.length > 0;

  return (
    <aside
      className={cn(
        "rounded-xl border border-border-warm bg-card-warm p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold text-ink">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup
        title="City"
        options={availableCities}
        selected={filters.cities}
        onToggle={(v) => toggle("cities", v)}
      />

      <Separator className="my-4 bg-border-warm" />

      <FilterGroup
        title="Category"
        options={availableCategories}
        selected={filters.categories}
        onToggle={(v) => toggle("categories", v)}
      />

      {availableRegions.length > 0 && (
        <>
          <Separator className="my-4 bg-border-warm" />
          <FilterGroup
            title="Region focus"
            options={availableRegions}
            selected={filters.regions}
            onToggle={(v) => toggle("regions", v)}
          />
        </>
      )}
    </aside>
  );
}
