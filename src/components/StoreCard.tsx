import Link from "next/link";
import { Globe, MapPin, Phone } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { IStore } from "@/lib/models/store";
import { excerpt, formatPhone, slugify } from "@/lib/utils";

interface StoreCardProps {
  store: IStore;
}

export function StoreCard({ store }: StoreCardProps) {
  const slug = slugify(store.name, store.city ?? "");
  const href = `/stores/${slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border-warm bg-card-warm p-5 shadow-sm transition-all hover:border-accent/40 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-ink group-hover:text-accent transition-colors line-clamp-2">
          {store.name}
        </h3>
        <CategoryBadge category={store.category} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {store.city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {store.city}
            {store.province ? `, ${store.province}` : ""}
          </span>
        )}
        {store.region_focus && (
          <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
            {store.region_focus}
          </span>
        )}
      </div>

      {store.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {excerpt(store.description, 140)}
        </p>
      )}

      {(store.phone || store.website) && (
        <div className="mt-4 flex items-center gap-3 border-t border-border-warm pt-3 text-muted-foreground">
          {store.phone && (
            <span className="inline-flex items-center gap-1 text-xs" title={formatPhone(store.phone)}>
              <Phone className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Phone available</span>
            </span>
          )}
          {store.website && (
            <span className="inline-flex items-center gap-1 text-xs">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Website available</span>
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
