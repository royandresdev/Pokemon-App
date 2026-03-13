import { describe, expect, it } from "vitest";

describe("createServer", () => {
  it("devuelve una app express configurada", async () => {
    const { createServer } = await import("./createServer.js");

    const app = createServer();

    expect(app.use).toEqual(expect.any(Function));
    expect(app.post).toEqual(expect.any(Function));
    expect(app.get).toEqual(expect.any(Function));
    expect(app.listen).toEqual(expect.any(Function));
  });
});
