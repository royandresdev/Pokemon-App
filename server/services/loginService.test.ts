describe("loginService", () => {
  it("devuelve 400 si el body contiene campos no permitidos", () => {
    const { getLoginResult } = require("./loginService") as {
      getLoginResult: (body: unknown) => {
        statusCode: number;
        payload: unknown;
      };
    };

    const result = getLoginResult({
      username: "admin",
      password: "admin",
      role: "superadmin",
    });

    expect(result.statusCode).toBe(400);
    expect(result.payload).toEqual({
      message: "Campos no permitidos en la solicitud",
    });
  });

  it("devuelve 200 para credenciales válidas", () => {
    const { getLoginResult } = require("./loginService") as {
      getLoginResult: (body: unknown) => {
        statusCode: number;
        payload: unknown;
      };
    };

    const result = getLoginResult({
      username: "admin",
      password: "admin",
    });

    expect(result.statusCode).toBe(200);
    expect(result.payload).toEqual({ ok: true });
  });

  it("devuelve 401 para credenciales inválidas", () => {
    const { getLoginResult } = require("./loginService") as {
      getLoginResult: (body: unknown) => {
        statusCode: number;
        payload: unknown;
      };
    };

    const result = getLoginResult({
      username: "ash",
      password: "pikachu",
    });

    expect(result.statusCode).toBe(401);
    expect(result.payload).toEqual({ message: "Credenciales inválidas" });
  });
});
