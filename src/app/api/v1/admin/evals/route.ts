import { NextRequest, NextResponse } from "next/server";
import { getEvalTrend, getProvincesWithTrendData } from "@/lib/ops";

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
      getEvalTrend(province, limit),
      getProvincesWithTrendData(),
    ]);

    return NextResponse.json({ trend, provinces });
  } catch (error) {
    console.error("GET /api/v1/admin/evals:", error);
    return NextResponse.json(
      { error: "Failed to fetch eval trend" },
      { status: 500 }
    );
  }
}
