import { NextRequest, NextResponse } from "next/server";

/**
 * Password-gates /ops and /api/v1/admin/* only — the public store directory
 * and its API routes are completely unaffected. This exists because Vercel's
 * Deployment Protection is whole-domain (or whole-production-domain on
 * Pro+), with no path-level scoping on any plan: see
 * https://vercel.com/docs/deployment-protection. A shared-password cookie
 * check here is the simplest correct fix for "protect only /ops" on Hobby.
 *
 * Required env var: OPS_PASSWORD (set in Vercel project settings, and in
 * .env.local for local dev — see .env.local.example).
 *
 * This is intentionally simple — a single shared password, not per-user
 * accounts. That's an appropriate level of protection for a solo-maintained
 * internal ops dashboard, not a multi-tenant admin panel.
 */

const PROTECTED_PREFIXES = ["/ops", "/api/v1/admin"];
const COOKIE_NAME = "ops_auth";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Cookie value is a hash of the password, not the password itself — so the
 * cookie alone doesn't leak the literal password if inspected, and rotating
 * OPS_PASSWORD automatically invalidates all existing sessions (the stored
 * hash no longer matches the freshly computed one).
 */
async function expectedCookieValue(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const opsPassword = process.env.OPS_PASSWORD;

  // Fail closed: if OPS_PASSWORD isn't configured, block access rather than
  // leaving /ops open. This should only happen if the env var was missed
  // during deployment setup.
  if (!opsPassword) {
    return new NextResponse(
      "Ops dashboard is not configured (OPS_PASSWORD missing).",
      { status: 503 }
    );
  }

  const expected = await expectedCookieValue(opsPassword);
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (cookie === expected) {
    return NextResponse.next();
  }

  // Login form submission
  if (request.method === "POST" && pathname === "/ops/login") {
    const formData = await request.formData();
    const submitted = formData.get("password");

    if (typeof submitted === "string" && submitted === opsPassword) {
      const response = NextResponse.redirect(new URL("/ops", request.url));
      response.cookies.set(COOKIE_NAME, expected, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE_SECONDS,
        path: "/",
      });
      return response;
    }

    return NextResponse.redirect(new URL("/ops/login?error=1", request.url));
  }

  // Allow the login page itself to render without a valid cookie
  if (pathname === "/ops/login") {
    return NextResponse.next();
  }

  // Any other protected path without a valid cookie → redirect to login
  return NextResponse.redirect(new URL("/ops/login", request.url));
}

export const config = {
  matcher: ["/ops/:path*", "/api/v1/admin/:path*"],
};
