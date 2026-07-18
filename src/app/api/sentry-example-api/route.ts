import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

/** Intentionally throws so Sentry can capture a backend sample error. */
export function GET() {
  throw new SentryExampleAPIError(
    "This error is raised on the backend of the example page."
  );
  return NextResponse.json({ data: "unreachable" });
}
