import { err, ok, options } from "@/app/api/v1/_lib/response";
import { getCategories } from "@/lib/stores";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export async function GET() {
  try {
    const categories = await getCategories();
    return ok(categories, { count: categories.length }, 300);
  } catch {
    return err("Failed to fetch categories");
  }
}
