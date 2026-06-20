import { NextResponse } from "next/server";
import { approveReview } from "@/lib/ops";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const result = await approveReview(id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`POST /api/v1/admin/review/[id]/approve:`, error);
    return NextResponse.json(
      { error: "Failed to approve review" },
      { status: 500 }
    );
  }
}
