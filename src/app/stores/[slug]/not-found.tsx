import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink">
        Store not found
      </h1>
      <p className="mt-2 text-muted-foreground">
        This listing may have been removed or the link is incorrect.
      </p>
      <Link
        href="/stores"
        className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-card-warm hover:bg-accent/90"
      >
        Back to directory
      </Link>
    </div>
  );
}
