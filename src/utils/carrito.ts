// carrito.ts: acá puse toda la lógica del carrito (agregar, quitar, cambiar cantidad y sumar).
// Son funciones "puras": reciben el carrito, y me devuelven uno nuevo sin tocar el original.
// Eso le gusta a React porque así se da cuenta de que algo cambió y vuelve a dibujar.
import type { Producto } from "../data/productos";

export interface ItemCarrito {
  codigo: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

// acá reviso que nunca pidan más unidades que el stock que hay
const limitar = (cantidad: number, stock: number) => Math.max(1, Math.min(cantidad, stock));

export const agregarItem = (carrito: ItemCarrito[], producto: Producto, cantidad = 1): ItemCarrito[] => {
  const existente = carrito.find((i) => i.codigo === producto.codigo);
  if (existente) {
    // si ya estaba, solo le sumo la cantidad (así no queda repetido en la tabla)
    return carrito.map((i) =>
      i.codigo === producto.codigo ? { ...i, cantidad: limitar(i.cantidad + cantidad, producto.stock) } : i,
    );
  }
  const nuevo: ItemCarrito = {
    codigo: producto.codigo,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagen,
    cantidad: limitar(cantidad, producto.stock),
  };
  return [...carrito, nuevo];
};

export const quitarItem = (carrito: ItemCarrito[], codigo: string): ItemCarrito[] =>
  carrito.filter((i) => i.codigo !== codigo);

// si la cantidad queda en 0 o menos, saco el producto del carrito
export const cambiarCantidad = (
  carrito: ItemCarrito[],
  codigo: string,
  cantidad: number,
  stock: number,
): ItemCarrito[] =>
  cantidad <= 0
    ? quitarItem(carrito, codigo)
    : carrito.map((i) => (i.codigo === codigo ? { ...i, cantidad: limitar(cantidad, stock) } : i));

export const contarUnidades = (carrito: ItemCarrito[]): number =>
  carrito.reduce((total, i) => total + i.cantidad, 0);

export const calcularTotal = (carrito: ItemCarrito[]): number =>
  carrito.reduce((total, i) => total + i.precio * i.cantidad, 0);
