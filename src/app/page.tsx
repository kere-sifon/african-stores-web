import Link from "next/link";
import { ArrowRight, Building2, MapPin, Store } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { StoreGrid } from "@/components/StoreGrid";
import {
  getRecentStores,
  getStats,
} from "@/lib/stores";
import { getCategoryColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stats = { total: 0, cities: [] as { city: string; count: number }[], categories: [] as { category: string; count: number }[] };
  let recentStores: Awaited<ReturnType<typeof getRecentStores>> = [];

  try {
    [stats, recentStores] = await Promise.all([
      getStats(),
      getRecentStores(6),
    ]);
  } catch {
    // Empty state handled below
  }

  const cityCount = stats.cities.length;
  const categoryCount = stats.categories.length;
  const isEmpty = stats.total === 0;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border-warm bg-gradient-to-br from-cream via-card-warm to-amber/20">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,#2d6a4f33_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#c84b1122_0%,transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-wider text-forest">
            Directory · Canada
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-ink sm:text-5xl lg:text-6xl text-balance max-w-2xl">
            African Stores Canada
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Find grocery stores, markets, restaurants, and specialty shops
            serving African communities near you.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border-warm bg-card-warm py-12 text-center">
            <Store className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 font-heading text-lg text-ink">
              No stores in the directory yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon — our crawler adds new listings regularly.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Stores listed" value={stats.total} icon={Store} />
            <StatCard label="Cities covered" value={cityCount} icon={MapPin} />
            <StatCard
              label="Categories"
              value={categoryCount}
              icon={Building2}
            />
          </div>
        )}
      </section>

      {!isEmpty && stats.cities.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold text-ink">
              Browse by city
            </h2>
            <Link
              href="/stores"
              className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.cities.map(({ city, count }) => (
              <Link
                key={city}
                href={`/cities/${encodeURIComponent(city)}`}
                className="group rounded-xl border border-border-warm bg-card-warm p-5 transition-all hover:border-forest/40 hover:shadow-md"
              >
                <MapPin className="h-5 w-5 text-forest mb-2" aria-hidden />
                <h3 className="font-heading text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                  {city}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {count} {count === 1 ? "store" : "stores"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!isEmpty && stats.categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-ink mb-4">
            Browse by category
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map(({ category }) => (
              <Link
                key={category}
                href={`/stores?category=${encodeURIComponent(category)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 ${getCategoryColor(category)}`}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentStores.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold text-ink">
              Recently added
            </h2>
            <Link
              href="/stores"
              className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1"
            >
              Full directory
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <StoreGrid stores={recentStores} />
        </section>
      )}
    </div>
  );
}
