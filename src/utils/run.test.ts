import { describe, expect, it } from "vitest";
import { formatearRun, validarRun } from "./run";

describe("validarRun", () => {
  it("acepta RUN reales con distintos formatos", () => {
    expect(validarRun("12.345.678-5")).toBe(true);
    expect(validarRun("123456785")).toBe(true);
    expect(validarRun("11.111.111-1")).toBe(true);
  });
  it("rechaza dígito verificador malo o formato raro", () => {
    expect(validarRun("12.345.678-9")).toBe(false);
    expect(validarRun("abc")).toBe(false);
    expect(validarRun("")).toBe(false);
  });
});

describe("formatearRun", () => {
  it("pone puntos y guion mientras se escribe", () => {
    expect(formatearRun("1")).toBe("1");
    expect(formatearRun("12")).toBe("1-2");
    expect(formatearRun("123456785")).toBe("12.345.678-5");
    expect(formatearRun("19011022k")).toBe("19.011.022-K");
  });
  it("ignora letras que no sean K", () => {
    expect(formatearRun("1a2b3")).toBe("12-3");
  });
});
