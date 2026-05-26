import Link from "next/link";
import { MapPin, Store } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-warm bg-card-warm/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-card-warm">
            <Store className="h-5 w-5" aria-hidden />
          </span>
          <div className="leading-tight">
            <span className="font-heading text-lg font-semibold text-ink group-hover:text-accent transition-colors">
              African Stores
            </span>
            <span className="block text-xs text-muted-foreground">Canada</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/stores"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-muted/60 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/stores"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card-warm hover:bg-accent/90 transition-colors"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Find stores
          </Link>
        </nav>
      </div>
    </header>
  );
}
