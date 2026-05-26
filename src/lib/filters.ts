import { parseFilterParam } from "@/lib/utils";

export interface FilterState {
  cities: string[];
  categories: string[];
  regions: string[];
}

export function filtersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): FilterState {
  return {
    cities: parseFilterParam(searchParams.city),
    categories: parseFilterParam(searchParams.category),
    regions: parseFilterParam(searchParams.region),
  };
}
