import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { StoreGrid } from "@/components/StoreGrid";
import { getCities, getStoresByCity } from "@/lib/stores";

export const dynamic = "force-dynamic";

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: CityPageProps) {
  const { city } = await params;
  const decoded = decodeURIComponent(city);
  return {
    title: `Stores in ${decoded}`,
    description: `African stores and markets in ${decoded}, Canada.`,
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: cityParam } = await params;
  const city = decodeURIComponent(cityParam);

  const [stores, allCities] = await Promise.all([
    getStoresByCity(city),
    getCities(),
  ]);

  if (!allCities.some((c) => c.toLowerCase() === city.toLowerCase())) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Home
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-forest">
          <MapPin className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
            {city}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {stores.length}{" "}
            {stores.length === 1 ? "store" : "stores"} in this city
          </p>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-warm py-16 text-center">
          <p className="text-muted-foreground">No stores listed in {city} yet.</p>
          <Link
            href="/stores"
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
          >
            Browse all stores
          </Link>
        </div>
      ) : (
        <StoreGrid stores={stores} />
      )}
    </div>
  );
}
