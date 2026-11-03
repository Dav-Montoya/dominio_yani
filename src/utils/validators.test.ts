import { describe, expect, it } from "vitest";
import {
  hayErrores, validarClave, validarComentario, validarCorreo, validarNacimiento, validarNombre,
  validarPassword,
} from "./validators";

describe("validarCorreo", () => {
  it("acepta los dominios permitidos", () => {
    expect(validarCorreo("ana@duoc.cl")).toBe("");
    expect(validarCorreo("profe@profesor.duoc.cl")).toBe("");
    expect(validarCorreo("admin@gmail.com")).toBe("");
    expect(validarCorreo("ana@hotmail.com")).toBe(""); // hotmail se agregó a la lista de dominios permitidos
  });
  it("rechaza vacío, mal formato, otro dominio y más de 100 caracteres", () => {
    expect(validarCorreo("")).not.toBe("");
    expect(validarCorreo("ana@@duoc")).not.toBe("");
    expect(validarCorreo("ana@dominio-no-permitido.net")).not.toBe("");
    expect(validarCorreo("a".repeat(100) + "@gmail.com")).not.toBe("");
  });
});

describe("otros validadores", () => {
  it("clave de 4 a 10 caracteres (demo local)", () => {
    expect(validarClave("1234")).toBe("");
    expect(validarClave("123")).not.toBe("");
    expect(validarClave("12345678901")).not.toBe("");
    expect(validarClave("")).not.toBe("");
  });
  it("la contraseña nueva (para Cognito) pide mínimo 8, con mayúscula, minúscula, número y símbolo", () => {
    expect(validarPassword("Clave1234#")).toBe("");
    expect(validarPassword("clave1234#")).not.toBe(""); // falta mayúscula
    expect(validarPassword("CLAVE1234#")).not.toBe(""); // falta minúscula
    expect(validarPassword("Clave1234")).not.toBe(""); // falta símbolo
    expect(validarPassword("ab1#")).not.toBe(""); // menos de 8
    expect(validarPassword("")).not.toBe("");
  });
  it("nombre y comentario", () => {
    expect(validarNombre("Nina")).toBe("");
    expect(validarNombre("  ")).not.toBe("");
    expect(validarComentario("a".repeat(501))).not.toBe("");
  });
  it("edad mínima de 13 años", () => {
    const hoy = new Date("2026-10-16");
    expect(validarNacimiento("2000-01-01", hoy)).toBe("");
    expect(validarNacimiento("2020-01-01", hoy)).not.toBe("");
    expect(validarNacimiento("", hoy)).not.toBe("");
  });
  it("hayErrores", () => {
    expect(hayErrores({ a: "", b: "" })).toBe(false);
    expect(hayErrores({ a: "", b: "mal" })).toBe(true);
  });
});
