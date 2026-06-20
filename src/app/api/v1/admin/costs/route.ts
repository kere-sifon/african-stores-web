import { NextRequest, NextResponse } from "next/server";
import { getCostTrend, getProvincesWithTrendData } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const province = searchParams.get("province") ?? undefined;
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50)
    );

    const [trend, provinces] = await Promise.all([
      getCostTrend(province, limit),
      getProvincesWithTrendData(),
    ]);

    return NextResponse.json({ trend, provinces });
  } catch (error) {
    console.error("GET /api/v1/admin/costs:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost trend" },
      { status: 500 }
    );
  }
}
