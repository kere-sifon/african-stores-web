import { NextResponse } from "next/server";
import { getOpsOverview } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const overview = await getOpsOverview();
    return NextResponse.json(overview);
  } catch (error) {
    console.error("GET /api/v1/admin/ops-status:", error);
    return NextResponse.json(
      { error: "Failed to fetch ops overview" },
      { status: 500 }
    );
  }
}
