import { describe, expect, it } from "vitest";
import { encodeToken, decodeToken, encodeCode, decodeCode } from "@/lib/token";

describe("encodeToken / decodeToken", () => {
  it("encodes and decodes a full token", () => {
    const token = encodeToken("2055", "69011212055");
    const decoded = decodeToken(token);
    expect(decoded).toEqual({ code: "2055", juniorId: "69011212055" });
  });

  it("returns null for invalid hex", () => {
    expect(decodeToken("zzzz")).toBeNull();
  });

  it("returns null for short decoded string", () => {
    const result = decodeToken("aced");
    expect(result).toBeNull();
  });

  it("returns null for non-numeric code", () => {
    const token = encodeToken("abcd", "69011212055");
    const decoded = decodeToken(token);
    expect(decoded).toBeNull();
  });

  it("returns null for empty token", () => {
    expect(decodeToken("")).toBeNull();
  });
});

describe("encodeCode / decodeCode", () => {
  it("encodes and decodes a 4-digit code", () => {
    const token = encodeCode("2408");
    expect(decodeCode(token)).toBe("2408");
  });

  it("returns null for invalid token", () => {
    expect(decodeCode("zz")).toBeNull();
  });

  it("returns null for non-numeric decoded value", () => {
    const token = encodeCode("test");
    const result = decodeCode(token);
    expect(result).toBeNull();
  });
});
