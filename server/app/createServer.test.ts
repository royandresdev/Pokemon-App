describe("createServer", () => {
  it("devuelve una app express configurada", () => {
    const { createServer } = require("./createServer") as {
      createServer: () => {
        use?: unknown;
        post?: unknown;
        get?: unknown;
        listen?: unknown;
      };
    };

    const app = createServer();

    expect(app.use).toEqual(expect.any(Function));
    expect(app.post).toEqual(expect.any(Function));
    expect(app.get).toEqual(expect.any(Function));
    expect(app.listen).toEqual(expect.any(Function));
  });
});
