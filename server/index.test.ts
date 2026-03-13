import { describe, expect, it } from "vitest";

describe("server entrypoint", () => {
  it("expone createServer desde index", async () => {
    const serverModule = await import("./index.js");
    expect(serverModule.createServer).toEqual(expect.any(Function));
  });
});
