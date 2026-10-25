import { describe, expect, it, vi } from "vitest";

const valid = {
  DATABASE_URL: "postgres://u:p@localhost:5432/db",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
};

vi.stubEnv("DATABASE_URL", valid.DATABASE_URL);
vi.stubEnv("BETTER_AUTH_SECRET", valid.BETTER_AUTH_SECRET);
vi.stubEnv("BETTER_AUTH_URL", valid.BETTER_AUTH_URL);

const { parseEnv } = await import("./env");

describe("parseEnv", () => {
  it("accepts a valid environment and treats empty OAuth values as unset", () => {
    const env = parseEnv({ ...valid, GITHUB_CLIENT_ID: "" });
    expect(env.GITHUB_CLIENT_ID).toBeUndefined();
  });

  it("rejects a short auth secret", () => {
    expect(() => parseEnv({ ...valid, BETTER_AUTH_SECRET: "short" })).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("rejects a missing database URL", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });
});
