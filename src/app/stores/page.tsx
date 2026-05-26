import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StoresDirectory } from "@/components/StoresDirectory";
import { filtersFromSearchParams } from "@/lib/filters";
import {
  getCities,
  getCategories,
  getRegions,
  getStores,
} from "@/lib/stores";

export const dynamic = "force-dynamic";

interface StoresPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function StoresLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full max-w-xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function StoresContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = filtersFromSearchParams(searchParams);
  const q =
    typeof searchParams.q === "string"
      ? searchParams.q
      : Array.isArray(searchParams.q)
        ? searchParams.q[0] ?? ""
        : "";
  const pageParam = searchParams.page;
  const page = Math.max(
    1,
    parseInt(
      typeof pageParam === "string" ? pageParam : "1",
      10
    ) || 1
  );

  const [result, cities, categories, regions] = await Promise.all([
    getStores(
      {
        cities: filters.cities,
        categories: filters.categories,
        regions: filters.regions,
        q,
      },
      page
    ),
    getCities(),
    getCategories(),
    getRegions(),
  ]);

  const searchKey = JSON.stringify({ filters, q, page });

  return (
    <StoresDirectory
      initialStores={result.stores}
      initialTotal={result.total}
      initialPage={page}
      initialQuery={q}
      initialFilters={filters}
      searchKey={searchKey}
      availableCities={cities}
      availableCategories={categories}
      availableRegions={regions}
    />
  );
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<StoresLoading />}>
      <StoresContent searchParams={params} />
    </Suspense>
  );
}
