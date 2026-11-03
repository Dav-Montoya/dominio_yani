// formato.ts: acá puse la función que escribe los precios como en Chile ($6.990).
// La hice a mano (en vez de toLocaleString) para que siempre salga igual en cualquier computador.
export const formatearPrecio = (valor: number): string =>
  "$" + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// las fechas del backend llegan como "AAAA-MM-DD" (así las guarda el registro);
// con este cambio las muestro como acostumbramos en Chile: DD/MM/AAAA (ej: 15/08/1997)
export const formatearFechaNacimiento = (fecha: string): string => {
  const partes = fecha.split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};
