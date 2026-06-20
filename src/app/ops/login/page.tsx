import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function LoginForm({ hasError }: { hasError: boolean }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crawl operations</CardTitle>
        <CardDescription>
          Sign in to view coverage, eval scores, cost, and the review queue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action="/ops/login" className="space-y-3">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              placeholder="Password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {hasError && (
            <p className="text-sm text-destructive">
              Incorrect password. Try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function OpsLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm hasError={hasError} />
      </Suspense>
    </div>
  );
}
