// Pruebas del carrito. Las corro con:  npm test
import { describe, expect, it } from "vitest";
import type { Producto } from "../data/productos";
import { agregarItem, calcularTotal, cambiarCantidad, contarUnidades, quitarItem } from "./carrito";

const sticker: Producto = {
  codigo: "T001", nombre: "Sticker", descripcion: "", precio: 300, stock: 3,
  categoria: "grupal", tipo: "sticker", imagen: "/imgs/x.webp",
};

describe("carrito", () => {
  it("agrega y suma cantidades del mismo producto", () => {
    const c = agregarItem(agregarItem([], sticker), sticker);
    expect(c).toHaveLength(1);
    expect(c[0].cantidad).toBe(2);
  });
  it("no deja pasar el stock", () => {
    const c = agregarItem([], sticker, 99);
    expect(c[0].cantidad).toBe(3);
  });
  it("cambia cantidad y quita si llega a 0", () => {
    const c = agregarItem([], sticker);
    expect(cambiarCantidad(c, "T001", 2, 3)[0].cantidad).toBe(2);
    expect(cambiarCantidad(c, "T001", 0, 3)).toHaveLength(0);
  });
  it("quita, cuenta y suma el total", () => {
    const c = agregarItem([], sticker, 2);
    expect(contarUnidades(c)).toBe(2);
    expect(calcularTotal(c)).toBe(600);
    expect(quitarItem(c, "T001")).toHaveLength(0);
  });
  it("no modifica el carrito original", () => {
    const c = agregarItem([], sticker);
    agregarItem(c, sticker);
    expect(c[0].cantidad).toBe(1);
  });
});
