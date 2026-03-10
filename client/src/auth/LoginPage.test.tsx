import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./LoginPage";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("AuthPage", () => {
  it("Debe renderizar el formulario de inicio de sesión", () => {
    render(<LoginPage />);

    const formElement = screen.getByText("Iniciar sesión");

    expect(formElement).toBeInTheDocument();
  });

  it("No debe poder iniciar sesión con credenciales vacías", () => {
    render(<LoginPage />);
    const loginButton = screen.getByRole("button", { name: "Ingresar" });

    expect(loginButton).toBeDisabled();
  });

  it("Debe renderizar los mensajes de error si entra y sale de los inputs", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Usuario:");
    const passwordInput = screen.getByLabelText("Contraseña:");

    fireEvent.focus(usernameInput);
    fireEvent.blur(usernameInput);
    fireEvent.focus(passwordInput);
    fireEvent.blur(passwordInput);

    const usernameErrorMessage = await screen.findByText("Ingrese un usuario");
    const passwordErrorMessage = await screen.findByText("Ingrese una contraseña");

    expect(usernameErrorMessage).toBeInTheDocument();
    expect(passwordErrorMessage).toBeInTheDocument();
  });

  it("Debe habilitar el botón cuando usuario y contraseña están completos", () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Usuario:");
    const passwordInput = screen.getByLabelText("Contraseña:");
    const loginButton = screen.getByRole("button", { name: "Ingresar" });

    fireEvent.change(usernameInput, { target: { value: "ash" } });
    fireEvent.change(passwordInput, { target: { value: "pikachu123" } });

    expect(loginButton).toBeEnabled();
  });

  it("Debe mostrar un mensaje de error si las credenciales no son válidas", async () => {
    vi.stubEnv("VITE_API_URL", "http://test-api");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Credenciales inválidas" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Usuario:");
    const passwordInput = screen.getByLabelText("Contraseña:");
    const loginButton = screen.getByRole("button", { name: "Ingresar" });

    fireEvent.change(usernameInput, { target: { value: "usuario_invalido" } });
    fireEvent.change(passwordInput, { target: { value: "password_invalida" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://test-api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usuario_invalido",
          password: "password_invalida",
        }),
      });
    });

    const errorMessage = await screen.findByText("Credenciales inválidas");
    expect(errorMessage).toBeInTheDocument();
  });

  it("Debe deshabilitar inputs y mostrar estado de carga al iniciar sesión", async () => {
    vi.stubEnv("VITE_API_URL", "http://test-api");

    const fetchMock = vi.fn(() => new Promise(() => undefined));

    vi.stubGlobal("fetch", fetchMock);

    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Usuario:");
    const passwordInput = screen.getByLabelText("Contraseña:");
    const loginButton = screen.getByRole("button", { name: "Ingresar" });

    fireEvent.change(usernameInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "admin" } });
    fireEvent.click(loginButton);

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(await screen.findByRole("button", { name: "Cargando..." })).toBeDisabled();
  });
})
