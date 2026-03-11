describe("server entrypoint", () => {
  it("expone createServer desde index", () => {
    const serverModule = require("./index") as {
      createServer?: unknown;
    };

    expect(serverModule.createServer).toEqual(expect.any(Function));
  });
});
