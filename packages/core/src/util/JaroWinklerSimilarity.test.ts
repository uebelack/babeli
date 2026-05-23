import { jaroWinklerSimilarity } from "./JaroWinklerSimilarity";

describe("jaroWinklerSimilarity", () => {
  it("should return 1 for identical strings", () => {
    expect(jaroWinklerSimilarity("hello", "hello")).toBe(1);
  });

  it("should return 1 for two empty strings", () => {
    expect(jaroWinklerSimilarity("", "")).toBe(1);
  });

  it("should return 0 when one string is empty", () => {
    expect(jaroWinklerSimilarity("hello", "")).toBe(0);
    expect(jaroWinklerSimilarity("", "hello")).toBe(0);
  });

  it("should return 0 for completely different strings", () => {
    expect(jaroWinklerSimilarity("abc", "xyz")).toBe(0);
  });

  it("should return high similarity for similar strings", () => {
    const similarity = jaroWinklerSimilarity("martha", "marhta");
    expect(similarity).toBeGreaterThan(0.9);
  });

  it("should give higher score to strings with common prefix", () => {
    const withPrefix = jaroWinklerSimilarity("prefix_abc", "prefix_xyz");
    const withoutPrefix = jaroWinklerSimilarity("abc_prefix", "xyz_prefix");
    expect(withPrefix).toBeGreaterThan(withoutPrefix);
  });

  it("should handle transpositions correctly", () => {
    const similarity = jaroWinklerSimilarity("dwayne", "duane");
    expect(similarity).toBeGreaterThan(0.8);
    expect(similarity).toBeLessThan(1);
  });

  it("should be case sensitive", () => {
    const similarity = jaroWinklerSimilarity("Hello", "hello");
    expect(similarity).toBeLessThan(1);
  });

  it("should handle single character strings", () => {
    expect(jaroWinklerSimilarity("a", "a")).toBe(1);
    expect(jaroWinklerSimilarity("a", "b")).toBe(0);
  });
});
