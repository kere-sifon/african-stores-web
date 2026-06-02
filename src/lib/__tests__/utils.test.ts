import { describe, expect, it } from "vitest";
import {
  deslugify,
  excerpt,
  formatHoursPreview,
  formatPhone,
  formatStoreAddress,
  getCategoryColor,
  googleMapsUrlForStore,
  hasStoreHours,
  parseFilterParam,
  slugify,
} from "@/lib/utils";

describe("slugify", () => {
  it("combines name and city in kebab-case", () => {
    expect(slugify("Afro World Market", "Toronto")).toBe(
      "afro-world-market-toronto"
    );
  });

  it("strips punctuation from names in slugs", () => {
    expect(slugify("ID Love Restaurant & Bar", "Toronto")).toBe(
      "id-love-restaurant-bar-toronto"
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

  it("parses multi-word cities like Niagara Falls", () => {
    expect(deslugify("abeni-african-food-niagara-falls")).toEqual({
      name: "Abeni African Food",
      city: "Niagara Falls",
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

describe("formatStoreAddress", () => {
  it("joins address fields for display", () => {
    expect(
      formatStoreAddress({
        address: "123 Main St",
        city: "Toronto",
        province: "ON",
        postal_code: "M5V 1A1",
      })
    ).toBe("123 Main St, Toronto, ON, M5V 1A1");
  });
});

describe("googleMapsUrlForStore", () => {
  it("builds a Google Maps search URL from address fields only", () => {
    const url = googleMapsUrlForStore({
      address: "100 Queen St W",
      city: "Toronto",
      province: "ON",
    });
    expect(url).toContain("google.com/maps/search");
    expect(url).toContain(encodeURIComponent("100 Queen St W"));
    expect(url).not.toContain(encodeURIComponent("Restaurant"));
  });

  it("returns null when no address parts exist", () => {
    expect(
      googleMapsUrlForStore({
        address: null,
        city: null,
        province: null,
        postal_code: null,
      })
    ).toBeNull();
  });
});

describe("hasStoreHours", () => {
  it("returns false for null, empty, or whitespace", () => {
    expect(hasStoreHours(null)).toBe(false);
    expect(hasStoreHours("")).toBe(false);
    expect(hasStoreHours("   ")).toBe(false);
  });

  it("returns true when hours text is present", () => {
    expect(hasStoreHours("Monday: 9:00 AM – 5:00 PM")).toBe(true);
  });
});

describe("formatHoursPreview", () => {
  it("returns today's line when present", () => {
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
    const hours = `${today}: 9:00 AM – 5:00 PM\nMonday: 10:00 AM – 6:00 PM`;
    expect(formatHoursPreview(hours)).toBe(`${today}: 9:00 AM – 5:00 PM`);
  });

  it("returns the first line when today is not listed", () => {
    const hours =
      "Notaday: 8:00 AM – 4:00 PM\nMonday: 10:00 AM – 6:00 PM";
    expect(formatHoursPreview(hours)).toBe("Notaday: 8:00 AM – 4:00 PM");
  });
});
