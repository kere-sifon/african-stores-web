"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filter, Loader2 } from "lucide-react";
import { FilterSidebar } from "@/components/FilterSidebar";
import type { FilterState } from "@/lib/filters";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { StoreGrid } from "@/components/StoreGrid";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IStore } from "@/lib/models/store";
import { STORES_PER_PAGE } from "@/lib/constants";

interface StoresDirectoryProps {
  initialStores: IStore[];
  initialTotal: number;
  initialPage: number;
  initialQuery: string;
  initialFilters: FilterState;
  /** Stable key from URL params — avoids sync loops from new object references */
  searchKey: string;
  availableCities: string[];
  availableCategories: string[];
  availableRegions: string[];
}

function buildSearchParams(
  filters: FilterState,
  q: string,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.cities.length) params.set("city", filters.cities.join(","));
  if (filters.categories.length)
    params.set("category", filters.categories.join(","));
  if (filters.regions.length) params.set("region", filters.regions.join(","));
  if (q.trim()) params.set("q", q.trim());
  if (page > 1) params.set("page", String(page));
  return params;
}

function filtersEqual(a: FilterState, b: FilterState): boolean {
  return (
    a.cities.join() === b.cities.join() &&
    a.categories.join() === b.categories.join() &&
    a.regions.join() === b.regions.join()
  );
}

export function StoresDirectory({
  initialStores,
  initialTotal,
  initialPage,
  initialQuery,
  initialFilters,
  searchKey,
  availableCities,
  availableCategories,
  availableRegions,
}: StoresDirectoryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [stores, setStores] = useState(initialStores);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    setStores(initialStores);
    setTotal(initialTotal);
    setPage(initialPage);
    setQuery(initialQuery);
    setFilters(initialFilters);
  }, [searchKey, initialStores, initialTotal, initialPage, initialQuery, initialFilters]);

  const totalPages = Math.max(1, Math.ceil(total / STORES_PER_PAGE));

  const currentParamsString = useMemo(() => {
    return buildSearchParams(filters, query, page).toString();
  }, [filters, query, page]);

  const applyFilters = useCallback(
    (nextFilters: FilterState, nextQuery: string, nextPage: number) => {
      const params = buildSearchParams(nextFilters, nextQuery, nextPage);
      const nextParamsString = params.toString();

      if (
        nextParamsString === currentParamsString &&
        filtersEqual(nextFilters, filters) &&
        nextQuery === query &&
        nextPage === page
      ) {
        return;
      }

      setFilters(nextFilters);
      setQuery(nextQuery);
      setPage(nextPage);

      const path = `/stores${nextParamsString ? `?${nextParamsString}` : ""}`;
      startTransition(() => {
        router.replace(path, { scroll: false });
      });
    },
    [currentParamsString, filters, query, page, router]
  );

  const handleFilterChange = useCallback(
    (nextFilters: FilterState) => {
      applyFilters(nextFilters, query, 1);
    },
    [applyFilters, query]
  );

  const handleSearch = useCallback(
    (q: string) => {
      applyFilters(filters, q, 1);
    },
    [applyFilters, filters]
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      applyFilters(filters, query, nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [applyFilters, filters, query]
  );

  const activeFilterCount =
    filters.cities.length +
    filters.categories.length +
    filters.regions.length;

  const resultLabel =
    total === 0
      ? "No stores found"
      : total === 1
        ? "1 store"
        : `${total} stores`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
          Store Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse African grocery stores, markets, and specialty shops.
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          defaultValue={query}
          navigateOnSubmit={false}
          onSearch={handleSearch}
        />
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <FilterSidebar
            availableCities={availableCities}
            availableCategories={availableCategories}
            availableRegions={availableRegions}
            filters={filters}
            onChange={handleFilterChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Updating…
                </span>
              ) : (
                resultLabel
              )}
            </p>

            <Sheet>
              <SheetTrigger
                className="lg:hidden inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border-warm bg-background px-3 text-sm font-medium hover:bg-muted/60"
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs text-card-warm">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-card-warm">
                <SheetHeader>
                  <SheetTitle className="font-heading">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    availableCities={availableCities}
                    availableCategories={availableCategories}
                    availableRegions={availableRegions}
                    filters={filters}
                    onChange={handleFilterChange}
                    className="border-0 p-0 shadow-none"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {stores.length === 0 && !isPending ? (
            <div className="rounded-xl border border-dashed border-border-warm bg-card-warm/50 py-16 text-center">
              <p className="font-heading text-lg text-ink">No stores found</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Try adjusting your filters or search term. New stores are added
                as our directory grows.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-border-warm"
                onClick={() =>
                  applyFilters(
                    { cities: [], categories: [], regions: [] },
                    "",
                    1
                  )
                }
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <StoreGrid stores={stores} />
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-10"
          />
        </div>
      </div>
    </div>
  );
}
