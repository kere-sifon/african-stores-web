import { describe, expect, it } from "vitest";
import {
  deslugify,
  excerpt,
  formatPhone,
  getCategoryColor,
  parseFilterParam,
  slugify,
} from "@/lib/utils";

describe("slugify", () => {
  it("combines name and city in kebab-case", () => {
    expect(slugify("Afro World Market", "Toronto")).toBe(
      "afro-world-market-toronto"
    );
  });

  it("handles name-only when city is empty", () => {
    expect(slugify("Test Store", "")).toBe("test-store");
  });
});

describe("deslugify", () => {
  it("parses known multi-word cities", () => {
    expect(deslugify("afro-world-market-richmond-hill")).toEqual({
      name: "Afro World Market",
      city: "Richmond Hill",
    });
  });

  it("parses single-word cities from slug tail", () => {
    expect(deslugify("some-store-toronto")).toEqual({
      name: "Some Store",
      city: "Toronto",
    });
  });
});

describe("parseFilterParam", () => {
  it("splits comma-separated values", () => {
    expect(parseFilterParam("Toronto,Montreal")).toEqual([
      "Toronto",
      "Montreal",
    ]);
  });

  it("returns empty array for undefined", () => {
    expect(parseFilterParam(undefined)).toEqual([]);
  });
});

describe("formatPhone", () => {
  it("formats 10-digit North American numbers", () => {
    expect(formatPhone("4165551234")).toBe("(416) 555-1234");
  });
});

describe("excerpt", () => {
  it("truncates long text", () => {
    const long = "a".repeat(150);
    expect(excerpt(long, 120)).toMatch(/…$/);
    expect(excerpt(long, 120).length).toBeLessThanOrEqual(121);
  });
});

describe("getCategoryColor", () => {
  it("falls back to Other for unknown categories", () => {
    expect(getCategoryColor("Unknown")).toContain("gray");
  });
});
