import type { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://african-stores-web.vercel.app";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for the African Stores Canada website and mobile app.",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  {
    title: "Overview",
    body: `African Stores Canada ("we", "us", or "our") operates the website at ${siteUrl.replace(/^https?:\/\//, "")} and a companion mobile application (the "App"). This policy explains what information we handle when you use our directory to discover African grocery stores, markets, and specialty shops in Canada.`,
  },
  {
    title: "Information we collect",
    body: `We do not require you to create an account to use the website or App.

**Information you provide:** We do not ask you to submit personal information such as your name, email address, or phone number to browse the directory.

**Information collected automatically:** When you use the website or App, our hosting provider (Vercel) and API servers may process standard technical data such as your IP address, browser or device type, requested URLs, and timestamps in server logs. This data is used to deliver the service, maintain security, and troubleshoot issues.

**Authorization header:** Our API accepts an optional Authorization header for future authenticated features. We do not require it for public directory access today.`,
  },
  {
    title: "Store directory data",
    body: `Listings in the directory describe businesses (for example: store name, address, city, phone number, website, hours, and description). This information is compiled from publicly available sources and third-party data collection processes. It is intended to help users find businesses and is not used by us to identify individual consumers.`,
  },
  {
    title: "How we use information",
    body: `We use information only to:

- Operate and improve the directory website and App
- Respond to the API requests your device makes (search, browse by city, view store details)
- Protect the service against abuse and technical failures
- Comply with legal obligations

We do not sell your personal information. We do not use the App for targeted advertising based on your identity.`,
  },
  {
    title: "Third-party services",
    body: `We rely on service providers to run the product, including:

- **Vercel** — website and API hosting
- **MongoDB Atlas** — database hosting for store listings

These providers process data on our behalf under their own privacy and security terms. Store websites linked from listings are operated by third parties; their privacy practices are separate from ours.`,
  },
  {
    title: "Cookies and local storage",
    body: `The public directory website does not use advertising cookies or third-party analytics trackers in our application code. Your browser or the App may store minimal technical data needed to load pages. If we add analytics or similar tools in the future, we will update this policy.`,
  },
  {
    title: "Data retention",
    body: `Server logs are retained for a limited period according to our hosting providers' practices. Directory data is retained while listings remain relevant to the service. You may request correction of business listing information by contacting us (see below).`,
  },
  {
    title: "Children's privacy",
    body: `The service is a general-audience business directory. We do not knowingly collect personal information from children under 13. If you believe a child has provided us personal information, please contact us and we will take appropriate steps to delete it.`,
  },
  {
    title: "Your rights",
    body: `Depending on where you live (including under Canadian privacy law), you may have rights to access, correct, or delete personal information we hold about you. Because we collect little personal information from App users, many requests may not apply. Business owners may contact us to update or remove listing data.`,
  },
  {
    title: "International users",
    body: `The service is focused on businesses in Canada. If you access the website or App from outside Canada, your information may be processed in the United States or other countries where our service providers operate.`,
  },
  {
    title: "Changes to this policy",
    body: `We may update this policy from time to time. The "Last updated" date at the top of this page will change when we do. Continued use of the website or App after changes means you accept the updated policy.`,
  },
  {
    title: "Contact us",
    body: `For privacy questions, listing corrections, or data requests, contact the project maintainers through the GitHub repository at https://github.com/kere-sifon/african-stores-web (open an issue for privacy-related inquiries).`,
  },
];

function renderParagraph(text: string) {
  const blocks = text.split("\n\n");
  return blocks.map((block, index) => {
    if (block.startsWith("**") && block.includes(":**")) {
      const [heading, ...rest] = block.split("\n");
      const headingText = heading.replace(/\*\*/g, "").replace(/:$/, "");
      const body = rest.join("\n");
      return (
        <div key={index} className="space-y-2">
          <h3 className="font-medium text-ink">{headingText}</h3>
          <p className="text-ink/90 leading-relaxed whitespace-pre-line">
            {body}
          </p>
        </div>
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

export default function PrivacyPage() {
  const lastUpdated = "May 28, 2026";

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-border-warm pb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-forest">
          Legal
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-ink sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
        <p className="mt-4 text-ink/90 leading-relaxed">
          This page describes how African Stores Canada handles information
          when you use our website and iOS app. 
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-heading text-xl font-semibold text-ink mb-4">
              {section.title}
            </h2>
            <div className="space-y-4">{renderParagraph(section.body)}</div>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        <Link href="/" className="text-accent hover:underline">
          ← Back to home
        </Link>
      </p>
    </article>
  );
}
