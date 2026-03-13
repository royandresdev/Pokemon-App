import { describe, expect, it } from "vitest";

describe("loginService", () => {
  it("devuelve 400 si el body contiene campos no permitidos", async () => {
    const { getLoginResult } = await import("./loginService.js");

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

  it("devuelve 200 para credenciales válidas", async () => {
    const { getLoginResult } = await import("./loginService.js");

    const result = getLoginResult({
      username: "admin",
      password: "admin",
    });

    expect(result.statusCode).toBe(200);
    expect(result.payload).toEqual({ ok: true });
  });

  it("devuelve 401 para credenciales inválidas", async () => {
    const { getLoginResult } = await import("./loginService.js");

    const result = getLoginResult({
      username: "ash",
      password: "pikachu",
    });

    expect(result.statusCode).toBe(401);
    expect(result.payload).toEqual({ message: "Credenciales inválidas" });
  });
});
