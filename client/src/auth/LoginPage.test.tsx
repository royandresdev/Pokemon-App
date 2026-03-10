import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./LoginPage";

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

  it("Debe renderizar un mensaje de error si escribió mal las credenciales", () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Usuario:");
    const passwordInput = screen.getByLabelText("Contraseña:");
    const loginButton = screen.getByRole("button", { name: "Ingresar" });

    fireEvent.change(usernameInput, { target: { value: "usuario_incorrecto" } });
    fireEvent.change(passwordInput, { target: { value: "contraseña_incorrecta" } });
    fireEvent.click(loginButton);

    const errorMessage = screen.getByText("Credenciales incorrectas");
    expect(errorMessage).toBeInTheDocument();
  })
})
