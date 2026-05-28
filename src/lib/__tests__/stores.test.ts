import { describe, expect, it } from "vitest";
import { buildFilterQuery, hasRequiredContactInfo } from "@/lib/stores";

describe("hasRequiredContactInfo", () => {
  it("accepts store with trimmed address", () => {
    expect(hasRequiredContactInfo({ address: " 123 Main St ", phone: null })).toBe(
      true
    );
  });

  it("accepts store with trimmed phone", () => {
    expect(hasRequiredContactInfo({ address: "", phone: "416-555-0100" })).toBe(
      true
    );
  });

  it("rejects store with only whitespace contact fields", () => {
    expect(hasRequiredContactInfo({ address: "  ", phone: "\t" })).toBe(false);
  });
});

describe("buildFilterQuery", () => {
  it("includes city filter when cities provided", () => {
    const query = buildFilterQuery({ cities: ["Toronto"] });
    expect(query).toMatchObject({
      $and: expect.arrayContaining([{ city: { $in: ["Toronto"] } }]),
    });
  });

  it("escapes regex special characters in search term", () => {
    const query = buildFilterQuery({ q: "test(store)" });
    const orClause = (query as { $and: { $or: { name: RegExp }[] }[] }).$and.find(
      (clause) => "$or" in clause
    );
    expect(orClause?.$or[0].name.source).toBe("test\\(store\\)");
  });
});
