import Link from "next/link";

export default function CityNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink">City not found</h1>
      <p className="mt-2 text-muted-foreground">We don&apos;t have listings for this city yet.</p>
      <Link
        href="/stores"
        className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
      >
        View all stores
      </Link>
    </div>
  );
}
