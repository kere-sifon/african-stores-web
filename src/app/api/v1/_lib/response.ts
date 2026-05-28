import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function ok(
  data: unknown,
  meta: unknown = null,
  cacheSeconds = 0
) {
  const cacheControl =
    cacheSeconds > 0
      ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=60`
      : "no-store";

  return NextResponse.json(
    { data, meta, error: null },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": cacheControl,
      },
    }
  );
}

export function err(message: string, status = 500) {
  return NextResponse.json(
    { data: null, meta: null, error: message },
    {
      status,
      headers: {
        ...CORS_HEADERS,
      },
    }
  );
}

export function options() {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
    },
  });
}
