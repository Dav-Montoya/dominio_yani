import { describe, expect, it } from "vitest";
import { resolverModoAuth, sesionDesdePerfil, urlCerrarSesionCognito } from "./cognito";

describe("resolverModoAuth", () => {
  it("usa modo local si no hay variables", () => {
    expect(resolverModoAuth({})).toBe("local");
    expect(resolverModoAuth({ authority: "https://x" })).toBe("local");
    expect(resolverModoAuth({ clientId: "abc" })).toBe("local");
  });
  it("usa cognito si están authority y clientId", () => {
    expect(resolverModoAuth({ authority: "https://x", clientId: "abc" })).toBe("cognito");
  });
});

describe("sesionDesdePerfil", () => {
  it("arma la sesión de un cliente", () => {
    expect(sesionDesdePerfil({ email: "Ana@Gmail.com", name: "Ana" })).toEqual({
      nombre: "Ana", correo: "ana@gmail.com", rol: "Cliente",
    });
  });
  it("usa lo anterior a la @ si no hay nombre", () => {
    expect(sesionDesdePerfil({ email: "mika@duoc.cl" }).nombre).toBe("mika");
  });
  it("reconoce el grupo Admin", () => {
    expect(sesionDesdePerfil({ email: "a@b.cl", "cognito:groups": ["Admin"] }).rol).toBe("Admin");
  });
});

describe("urlCerrarSesionCognito", () => {
  it("codifica la dirección de vuelta", () => {
    expect(urlCerrarSesionCognito("https://dom.auth.amazoncognito.com/", "id1", "http://localhost:5173")).toBe(
      "https://dom.auth.amazoncognito.com/logout?client_id=id1&logout_uri=http%3A%2F%2Flocalhost%3A5173",
    );
  });
});
