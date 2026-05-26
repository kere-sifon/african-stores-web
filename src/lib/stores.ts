import { connectDB } from "@/lib/db";
import Store, { IStore, toIStore } from "@/lib/models/store";
import { deslugify, slugify } from "@/lib/utils";

import { STORES_PER_PAGE } from "@/lib/constants";

export { STORES_PER_PAGE };

export interface StoreFilters {
  cities?: string[];
  categories?: string[];
  regions?: string[];
  q?: string;
}

export interface CityCount {
  city: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

/** Only list stores with at least a non-empty address or phone number. */
const CONTACTABLE_STORE_FILTER = {
  $expr: {
    $or: [
      {
        $gt: [
          {
            $strLenCP: {
              $trim: { input: { $ifNull: ["$address", ""] } },
            },
          },
          0,
        ],
      },
      {
        $gt: [
          {
            $strLenCP: {
              $trim: { input: { $ifNull: ["$phone", ""] } },
            },
          },
          0,
        ],
      },
    ],
  },
};

export function hasRequiredContactInfo(store: {
  address?: string | null;
  phone?: string | null;
}): boolean {
  return Boolean(store.address?.trim() || store.phone?.trim());
}

function withContactableFilter(
  query: Record<string, unknown>
): Record<string, unknown> {
  if (Object.keys(query).length === 0) {
    return { ...CONTACTABLE_STORE_FILTER };
  }
  return { $and: [query, CONTACTABLE_STORE_FILTER] };
}

function buildFilterQuery(filters: StoreFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filters.cities && filters.cities.length > 0) {
    query.city = { $in: filters.cities };
  }

  if (filters.categories && filters.categories.length > 0) {
    query.category = { $in: filters.categories };
  }

  if (filters.regions && filters.regions.length > 0) {
    query.region_focus = { $in: filters.regions };
  }

  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { name: regex },
      { description: regex },
      { city: regex },
      { products_and_specialties: regex },
    ];
  }

  return withContactableFilter(query);
}

export async function getStores(
  filters: StoreFilters = {},
  page = 1
): Promise<{ stores: IStore[]; total: number }> {
  await connectDB();

  const query = buildFilterQuery(filters);
  const skip = Math.max(0, (page - 1) * STORES_PER_PAGE);

  const [docs, total] = await Promise.all([
    Store.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(STORES_PER_PAGE)
      .lean(),
    Store.countDocuments(query),
  ]);

  return {
    stores: docs.map((doc) => toIStore(doc)),
    total,
  };
}

export async function getStoreBySlug(slug: string): Promise<IStore | null> {
  await connectDB();

  const select =
    "+name_lower +city_lower name city category region_focus address province postal_code phone website email hours description products_and_specialties source_url created_at";

  const allStores = await Store.find(withContactableFilter({}))
    .select(select)
    .lean();

  const match = allStores.find((doc) => {
    const city = doc.city ?? "";
    return slugify(doc.name, city) === slug;
  });

  if (match && hasRequiredContactInfo(match)) {
    return toIStore(match);
  }

  const { name, city } = deslugify(slug);
  const byLower = await Store.findOne(
    withContactableFilter({
      name_lower: name.toLowerCase(),
      city_lower: city.toLowerCase(),
    })
  )
    .select(select)
    .lean();

  if (byLower && hasRequiredContactInfo(byLower)) {
    return toIStore(byLower);
  }

  const byNameCity = await Store.findOne(
    withContactableFilter({
      name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      city: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    })
  )
    .select(select)
    .lean();

  return byNameCity && hasRequiredContactInfo(byNameCity)
    ? toIStore(byNameCity)
    : null;
}

export async function getStats(): Promise<{
  total: number;
  cities: CityCount[];
  categories: CategoryCount[];
}> {
  await connectDB();

  const [total, cityAgg, categoryAgg] = await Promise.all([
    Store.countDocuments(CONTACTABLE_STORE_FILTER),
    Store.aggregate<CityCount>([
      { $match: { ...CONTACTABLE_STORE_FILTER, city: { $nin: [null, ""] } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $project: { _id: 0, city: "$_id", count: 1 } },
      { $sort: { count: -1, city: 1 } },
    ]),
    Store.aggregate<CategoryCount>([
      { $match: CONTACTABLE_STORE_FILTER },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
      { $sort: { count: -1, category: 1 } },
    ]),
  ]);

  return { total, cities: cityAgg, categories: categoryAgg };
}

export async function getRecentStores(limit = 6): Promise<IStore[]> {
  await connectDB();

  const docs = await Store.find(withContactableFilter({}))
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return docs.map((doc) => toIStore(doc));
}

export async function getCities(): Promise<string[]> {
  await connectDB();

  const cities = await Store.distinct("city", {
    ...CONTACTABLE_STORE_FILTER,
    city: { $nin: [null, ""] },
  });

  return (cities as string[]).sort((a, b) => a.localeCompare(b));
}

export async function getCategories(): Promise<string[]> {
  await connectDB();

  const categories = await Store.distinct(
    "category",
    CONTACTABLE_STORE_FILTER
  );
  return (categories as string[]).sort((a, b) => a.localeCompare(b));
}

export async function getRegions(): Promise<string[]> {
  await connectDB();

  const regions = await Store.distinct("region_focus", {
    ...CONTACTABLE_STORE_FILTER,
    region_focus: { $nin: [null, ""] },
  });

  return (regions as string[]).sort((a, b) => a.localeCompare(b));
}

export async function getStoresByCity(city: string): Promise<IStore[]> {
  await connectDB();

  const docs = await Store.find(withContactableFilter({ city }))
    .sort({ name: 1 })
    .lean();
  return docs.map((doc) => toIStore(doc));
}

export async function getAllStoreSlugs(): Promise<string[]> {
  await connectDB();

  const docs = await Store.find(withContactableFilter({}))
    .select("name city")
    .lean();
  return docs.map((doc) => slugify(doc.name, doc.city ?? ""));
}
