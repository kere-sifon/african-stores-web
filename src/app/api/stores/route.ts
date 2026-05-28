import { NextRequest, NextResponse } from "next/server";
import { STORES_PER_PAGE } from "@/lib/constants";
import { getStores } from "@/lib/stores";
import { parseFilterParam } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const cities = parseFilterParam(searchParams.get("city") ?? undefined);
    const categories = parseFilterParam(
      searchParams.get("category") ?? undefined
    );
    const regions = parseFilterParam(searchParams.get("region") ?? undefined);
    const q = searchParams.get("q") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? String(STORES_PER_PAGE), 10) || STORES_PER_PAGE)
    );

    const { stores, total } = await getStores(
      { cities, categories, regions, q },
      page,
      limit
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      stores,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("GET /api/stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
