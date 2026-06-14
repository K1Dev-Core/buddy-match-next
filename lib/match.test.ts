import { describe, expect, it } from "vitest";
import { sanitizeCode, getBuddyFromCode } from "@/lib/match";

describe("sanitizeCode", () => {
  it("returns 4 digits from a clean input", () => {
    expect(sanitizeCode("2055")).toBe("2055");
  });

  it("strips non-digit characters", () => {
    expect(sanitizeCode("20a55b")).toBe("2055");
  });

  it("slices to 4 characters", () => {
    expect(sanitizeCode("2055123")).toBe("2055");
  });

  it("returns null for null", () => {
    expect(sanitizeCode(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(sanitizeCode("")).toBeNull();
  });

  it("returns null for too short input", () => {
    expect(sanitizeCode("123")).toBeNull();
  });

  it("handles partially numeric input", () => {
    expect(sanitizeCode("abc12def34")).toBe("1234");
  });
});

describe("getBuddyFromCode", () => {
  it("returns fallback buddy when buddies array is empty", () => {
    const result = getBuddyFromCode("2055");
    expect(result.code).toBe("2055");
    expect(result.buddy.id).toBe("fallback");
    expect(result.buddy.orbitLogos).toHaveLength(4);
    expect(result.buddy.palette.outline).toBe("#456731");
  });

  it("sanitizes input before lookup", () => {
    const result = getBuddyFromCode("20a55b");
    expect(result.code).toBe("2055");
    expect(result.buddy.id).toBe("fallback");
  });
});
