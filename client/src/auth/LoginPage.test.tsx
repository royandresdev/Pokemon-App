import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "./LoginPage";

describe("AuthPage", () => {
  it("Debe renderizar el formulario de inicio de sesión", () => {
    render(<LoginPage />);

    const formElement = screen.getByText("Iniciar sesión");

    expect(formElement).toBeInTheDocument();
  });
})
