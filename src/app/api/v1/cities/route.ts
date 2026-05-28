import { err, ok, options } from "@/app/api/v1/_lib/response";
import { getCities } from "@/lib/stores";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export async function GET() {
  try {
    const cities = await getCities();
    return ok(cities, { count: cities.length }, 300);
  } catch {
    return err("Failed to fetch cities");
  }
}
