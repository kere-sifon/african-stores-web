import { NextResponse } from "next/server";
import { rejectReview } from "@/lib/ops";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    let reason = "";
    try {
      const body = await request.json();
      if (typeof body?.reason === "string") {
        reason = body.reason;
      }
    } catch {
      // No body or invalid JSON — proceed with empty reason rather than failing.
    }

    const result = await rejectReview(id, "ops-dashboard", reason);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`POST /api/v1/admin/review/[id]/reject:`, error);
    return NextResponse.json(
      { error: "Failed to reject review" },
      { status: 500 }
    );
  }
}
