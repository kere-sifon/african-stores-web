import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Fraunces } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "African Stores Canada",
    template: "%s | African Stores Canada",
  },
  description:
    "Discover African grocery stores, markets, restaurants, and specialty shops across Canada.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "African Stores Canada",
    description:
      "Directory of African grocery stores, markets, and specialty shops in Canada.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border-warm bg-card-warm py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-muted-foreground">
            <p className="font-heading text-ink">African Stores Canada</p>
            <p className="mt-1">
              Celebrating African businesses across the country.
            </p>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link
                href="/support"
                className="text-accent hover:underline font-medium"
              >
                Support
              </Link>
              <Link
                href="/privacy"
                className="text-accent hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
