import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Warm African-inspired palette */
export const colors = {
  background: "#f5f0e8",
  card: "#fffdf8",
  ink: "#0f0e0c",
  accent: "#c84b11",
  green: "#2d6a4f",
  amber: "#f4a261",
  muted: "#3d392f",
  border: "#ddd8cc",
} as const;

export const categoryColors: Record<string, string> = {
  Grocery: "bg-green-100 text-green-950",
  Restaurant: "bg-orange-100 text-orange-950",
  Market: "bg-purple-100 text-purple-950",
  Clothing: "bg-blue-100 text-blue-950",
  "Hair & Beauty": "bg-pink-100 text-pink-950",
  Bakery: "bg-yellow-100 text-yellow-950",
  Other: "bg-gray-100 text-gray-950",
};

const KNOWN_CITIES = [
  "Thornhill",
  "Mississauga",
  "Scarborough",
  "Toronto",
  "Vaughan",
  "Montreal",
  "Ottawa",
  "Calgary",
  "Edmonton",
  "Quebec City",
  "Hamilton",
  "Kitchener",
  "London",
  "Windsor",
  "Brampton",
  "Markham",
  "Richmond Hill",
  "Oakville",
  "Burlington",
  "Niagara Falls",
  "North York",
  "St. Catharines",
];

function toKebab(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function slugify(name: string, city: string): string {
  const namePart = toKebab(name);
  const cityPart = toKebab(city);
  return cityPart ? `${namePart}-${cityPart}` : namePart;
}

export function deslugify(slug: string): { name: string; city: string } {
  const normalized = slug.trim().toLowerCase();

  const sortedCities = [...KNOWN_CITIES].sort(
    (a, b) => toKebab(b).length - toKebab(a).length
  );

  for (const city of sortedCities) {
    const citySlug = toKebab(city);
    if (normalized.endsWith(`-${citySlug}`)) {
      const nameSlug = normalized.slice(0, -(citySlug.length + 1));
      return {
        name: titleCaseWords(nameSlug.replace(/-/g, " ")),
        city,
      };
    }
    if (normalized === citySlug) {
      return { name: "", city };
    }
  }

  const parts = normalized.split("-");
  if (parts.length < 2) {
    return { name: titleCaseWords(normalized.replace(/-/g, " ")), city: "" };
  }

  const citySlug = parts[parts.length - 1];
  const nameSlug = parts.slice(0, -1).join("-");
  return {
    name: titleCaseWords(nameSlug.replace(/-/g, " ")),
    city: titleCaseWords(citySlug.replace(/-/g, " ")),
  };
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    const local = digits.slice(1);
    return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return phone;
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? categoryColors.Other;
}

export function hasStoreHours(hours: string | null | undefined): boolean {
  return Boolean(hours?.trim());
}

/** First matching today line from Google Places weekday_text, or the first line. */
export function formatHoursPreview(hours: string): string {
  const lines = hours
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = dayNames[new Date().getDay()];
  const todayLine = lines.find((line) =>
    line.toLowerCase().startsWith(today.toLowerCase())
  );

  return todayLine ?? lines[0];
}

export function excerpt(text: string | null, maxLength = 120): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function parseFilterParam(
  value: string | string[] | undefined
): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
