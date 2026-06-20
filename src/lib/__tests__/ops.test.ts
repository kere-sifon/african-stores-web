import { describe, expect, it } from "vitest";
import { coverageStatus, type ProvinceCoverage } from "@/lib/ops";

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
