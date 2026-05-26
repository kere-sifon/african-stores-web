import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import {
  getAllStoreSlugs,
  getStoreBySlug,
} from "@/lib/stores";
import { formatPhone } from "@/lib/utils";

export const dynamic = "force-static";
export const dynamicParams = true;

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllStoreSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Store not found" };
  return {
    title: store.name,
    description:
      store.description ??
      `${store.name} — ${store.category} in ${store.city ?? "Canada"}`,
  };
}

export default async function StoreDetailPage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const addressParts = [
    store.address,
    store.city,
    store.province,
    store.postal_code,
  ].filter(Boolean);

  const websiteUrl = store.website
    ? store.website.startsWith("http")
      ? store.website
      : `https://${store.website}`
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/stores"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to directory
      </Link>

      <header className="border-b border-border-warm pb-8">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <CategoryBadge category={store.category} />
          {store.region_focus && (
            <span className="rounded-full bg-forest/10 px-3 py-1 text-sm font-medium text-forest">
              {store.region_focus}
            </span>
          )}
        </div>
        <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
          {store.name}
        </h1>
        {store.city && (
          <p className="mt-2 text-lg text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-5 w-5 text-forest shrink-0" aria-hidden />
            {store.city}
            {store.province ? `, ${store.province}` : ""}
          </p>
        )}

        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-card-warm hover:bg-accent/90 transition-colors"
          >
            <Globe className="h-4 w-4" aria-hidden />
            Visit Website
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </a>
        )}
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {addressParts.length > 0 && (
          <div className="rounded-xl border border-border-warm bg-card-warm p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Address
            </h2>
            <p className="text-ink flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-forest mt-0.5" aria-hidden />
              <span>{addressParts.join(", ")}</span>
            </p>
          </div>
        )}

        {store.phone && (
          <div className="rounded-xl border border-border-warm bg-card-warm p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Phone
            </h2>
            <a
              href={`tel:${store.phone.replace(/\s/g, "")}`}
              className="text-ink hover:text-accent inline-flex items-center gap-2"
            >
              <Phone className="h-4 w-4 text-forest" aria-hidden />
              {formatPhone(store.phone)}
            </a>
          </div>
        )}

        {store.email && (
          <div className="rounded-xl border border-border-warm bg-card-warm p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Email
            </h2>
            <a
              href={`mailto:${store.email}`}
              className="text-ink hover:text-accent inline-flex items-center gap-2 break-all"
            >
              <Mail className="h-4 w-4 text-forest shrink-0" aria-hidden />
              {store.email}
            </a>
          </div>
        )}

        {store.hours && (
          <div className="rounded-xl border border-border-warm bg-card-warm p-4 sm:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Hours
            </h2>
            <p className="text-ink whitespace-pre-line flex gap-2">
              <Clock className="h-4 w-4 shrink-0 text-forest mt-0.5" aria-hidden />
              {store.hours}
            </p>
          </div>
        )}
      </div>

      {store.description && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-ink mb-3">
            About
          </h2>
          <p className="text-ink/90 leading-relaxed whitespace-pre-line">
            {store.description}
          </p>
        </section>
      )}

      {store.products_and_specialties.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-ink mb-4">
            Products & specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {store.products_and_specialties.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border-warm bg-cream px-3 py-1.5 text-sm text-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
