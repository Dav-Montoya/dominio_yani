// formato.ts: acá puse la función que escribe los precios como en Chile ($6.990).
// La hice a mano (en vez de toLocaleString) para que siempre salga igual en cualquier computador.
export const formatearPrecio = (valor: number): string =>
  "$" + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
