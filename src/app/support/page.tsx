import type { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://african-stores-web.vercel.app";

const GITHUB_REPO = "https://github.com/kere-sifon/african-stores-web";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with the African Stores Canada website and iOS app.",
  alternates: {
    canonical: "/support",
  },
};

const sections = [
  {
    title: "How can we help?",
    body: `African Stores Canada helps you find African grocery stores, markets, and specialty shops across Canada. Use this page for help with the website, the iOS app, or business listings in the directory.`,
  },
  {
    title: "Frequently asked questions",
    body: `**How do I find stores near me?**
Browse the directory, search by name or city, or filter by category and region on the Stores page.

**Is the app free?**
Yes. Browsing the directory is free. We do not charge users to view store listings.

**Where does listing data come from?**
Store information is compiled from publicly available sources and updated over time. Details such as hours or phone numbers may change—confirm with the business before visiting.

**Why is a store missing or incorrect?**
Listings are added and refreshed on a rolling basis. If a store should be listed, removed, or corrected, contact us (see below) with the store name, city, and what should change.

**The app is not loading data**
Check your internet connection. If the problem continues, try again later or use the website at the same domain. Server maintenance may briefly affect the API.`,
  },
  {
    title: "Report a listing issue",
    body: `To request a new listing, correction, or removal, open an issue on our GitHub repository and include:

- Store name and city
- What is wrong or what you would like added
- A source link (website, map, or public listing) when possible

We review requests as capacity allows and cannot guarantee every submission will be published.`,
  },
  {
    title: "Contact support",
    body: `The best way to reach us is through GitHub:

${GITHUB_REPO}/issues

Open a new issue and choose a short title describing your question (for example: "Wrong address for store in Toronto" or "App search not working"). We aim to respond when we can; this is a community directory project, not a 24/7 call centre.`,
  },
];

function renderParagraph(text: string) {
  const blocks = text.split("\n\n");
  return blocks.map((block, index) => {
    if (block.startsWith("**") && block.includes("**")) {
      const firstBreak = block.indexOf("\n");
      if (firstBreak === -1) {
        return (
          <p key={index} className="text-ink/90 leading-relaxed">
            {block.replace(/\*\*/g, "")}
          </p>
        );
      }
      const heading = block.slice(0, firstBreak).replace(/\*\*/g, "");
      const body = block.slice(firstBreak + 1);
      return (
        <div key={index} className="space-y-2">
          <h3 className="font-medium text-ink">{heading}</h3>
          <p className="text-ink/90 leading-relaxed whitespace-pre-line">
            {body}
          </p>
        </div>
      );
    }
    if (block.startsWith("http")) {
      return (
        <p key={index} className="text-ink/90 leading-relaxed">
          <a
            href={block}
            className="font-medium text-accent hover:underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {block}
          </a>
        </p>
      );
    }
    return (
      <p
        key={index}
        className="text-ink/90 leading-relaxed whitespace-pre-line"
      >
        {block.replace(/\*\*(.*?)\*\*/g, "$1")}
      </p>
    );
  });
}

export default function SupportPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-border-warm pb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-forest">
          Help
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-ink sm:text-4xl">
          Support
        </h1>
       
      </header>

      <div className="mt-10 space-y-10">
        {sections.slice(0, 3).map((section) => (
          <section key={section.title}>
            <h2 className="font-heading text-xl font-semibold text-ink mb-4">
              {section.title}
            </h2>
            <div className="space-y-4">{renderParagraph(section.body)}</div>
          </section>
        ))}

        <section>
          <h2 className="font-heading text-xl font-semibold text-ink mb-4">
            Privacy
          </h2>
          <p className="text-ink/90 leading-relaxed">
            For how we handle information when you use the website or app, see
            our{" "}
            <Link
              href="/privacy"
              className="font-medium text-accent hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        {sections.slice(3).map((section) => (
          <section key={section.title}>
            <h2 className="font-heading text-xl font-semibold text-ink mb-4">
              {section.title}
            </h2>
            <div className="space-y-4">{renderParagraph(section.body)}</div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border-warm bg-card-warm p-5">
        <h2 className="font-heading text-lg font-semibold text-ink">
          Quick links
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/stores" className="text-accent hover:underline">
              Browse store directory
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </li>
          <li>
            <a
              href={GITHUB_REPO}
              className="text-accent hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub — report an issue
            </a>
          </li>
        </ul>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        <Link href="/" className="text-accent hover:underline">
          ← Back to home
        </Link>
      </p>
    </article>
  );
}
