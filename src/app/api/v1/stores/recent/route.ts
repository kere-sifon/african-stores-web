import { err, ok, options } from "@/app/api/v1/_lib/response";
import { getRecentStores } from "@/lib/stores";

export const dynamic = "force-dynamic";

function parseLimit(value: string | null): number {
  if (!value) return 6;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return 6;
  return Math.min(20, Math.max(1, parsed));
}

export function OPTIONS() {
  return options();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));

    const stores = await getRecentStores(limit);

    return ok(stores, { count: stores.length });
  } catch {
    return err("Failed to fetch recent stores");
  }
}
