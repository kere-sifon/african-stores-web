import { err, ok, options } from "@/app/api/v1/_lib/response";
import { getStoreBySlug } from "@/lib/stores";

export const dynamic = "force-dynamic";

interface StoreRouteProps {
  params: Promise<{ slug: string }>;
}

export function OPTIONS() {
  return options();
}

export async function GET(_request: Request, { params }: StoreRouteProps) {
  try {
    const { slug } = await params;
    const store = await getStoreBySlug(slug);

    if (!store) {
      return err("Store not found", 404);
    }

    return ok(store);
  } catch {
    return err("Failed to fetch store");
  }
}
