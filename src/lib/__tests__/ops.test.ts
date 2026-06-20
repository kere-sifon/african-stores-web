import { describe, expect, it } from "vitest";
import { coverageStatus, validateReviewCandidate, type ProvinceCoverage } from "@/lib/ops";

function entry(daysSince: number | null): ProvinceCoverage {
  return {
    province: "Ontario",
    last_crawled_at: daysSince === null ? null : new Date(),
    days_since_crawl: daysSince,
    stores_saved: 10,
    run_id: "test",
  };
}

describe("coverageStatus", () => {
  it("returns 'never' when never crawled", () => {
    expect(coverageStatus(entry(null))).toBe("never");
  });

  it("returns 'fresh' for a crawl within the last 14 days", () => {
    expect(coverageStatus(entry(0))).toBe("fresh");
    expect(coverageStatus(entry(14))).toBe("fresh");
  });

  it("returns 'due' for a crawl between 15 and 70 days ago", () => {
    expect(coverageStatus(entry(15))).toBe("due");
    expect(coverageStatus(entry(70))).toBe("due");
  });

  it("returns 'stale' for a crawl older than 70 days", () => {
    expect(coverageStatus(entry(71))).toBe("stale");
    expect(coverageStatus(entry(365))).toBe("stale");
  });
});

describe("validateReviewCandidate", () => {
  it("rejects a candidate with no name", () => {
    const error = validateReviewCandidate({ category: "Grocery", address: "1 St" });
    expect(error).toMatch(/name/i);
  });

  it("rejects a candidate with no category", () => {
    const error = validateReviewCandidate({ name: "Test Store", address: "1 St" });
    expect(error).toMatch(/category/i);
  });

  it("rejects a candidate with no contact info", () => {
    const error = validateReviewCandidate({
      name: "Test Store",
      category: "Grocery",
    });
    expect(error).toMatch(/address|phone|website/i);
  });

  it("accepts a candidate with name, category, and an address", () => {
    const error = validateReviewCandidate({
      name: "Test Store",
      category: "Grocery",
      address: "123 Main St",
    });
    expect(error).toBeNull();
  });

  it("accepts a candidate with only a phone as contact info", () => {
    const error = validateReviewCandidate({
      name: "Test Store",
      category: "Grocery",
      phone: "416-555-0100",
    });
    expect(error).toBeNull();
  });

  it("rejects a candidate with only whitespace contact fields", () => {
    const error = validateReviewCandidate({
      name: "Test Store",
      category: "Grocery",
      address: "   ",
      phone: "\t",
      website: "",
    });
    expect(error).toMatch(/address|phone|website/i);
  });
});