import { err, ok, options } from "@/app/api/v1/_lib/response";
import { getRegions } from "@/lib/stores";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export async function GET() {
  try {
    const regions = await getRegions();
    return ok(regions, { count: regions.length }, 300);
  } catch {
    return err("Failed to fetch regions");
  }
}
