"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

export default function SentryExamplePage() {
  const [hasSentError, setHasSentError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    async function checkConnectivity() {
      const result = await Sentry.diagnoseSdkConnectivity();
      setIsConnected(result !== "sentry-unreachable");
    }
    void checkConnectivity();
  }, []);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold text-ink">
        Sentry Test Page
      </h1>
      <p className="text-muted-foreground">
        Click the button to throw a sample error. If setup is correct, it will
        appear under Issues in your Sentry project (
        <code className="text-sm">quephase-gm / javascript-nextjs</code>).
      </p>

      <button
        type="button"
        className="mt-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-card-warm hover:bg-accent/90"
        onClick={async () => {
          await Sentry.startSpan(
            {
              name: "Example Frontend Span",
              op: "test",
            },
            async () => {
              const res = await fetch("/api/sentry-example-api");
              if (!res.ok) {
                setHasSentError(true);
                throw new SentryExampleFrontendError(
                  "This error is raised on the frontend of the example page."
                );
              }
            }
          );
        }}
      >
        Throw Sample Error
      </button>

      {hasSentError ? (
        <p className="text-sm text-forest">
          Sample error was sent. Check your{" "}
          <a
            href="https://quephase-gm.sentry.io/issues/?project=javascript-nextjs"
            className="underline hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sentry Issues
          </a>
          .
        </p>
      ) : !isConnected ? (
        <p className="text-sm text-destructive">
          Sentry looks unreachable (ad blocker or missing{" "}
          <code>NEXT_PUBLIC_SENTRY_DSN</code>).
        </p>
      ) : null}
    </main>
  );
}
