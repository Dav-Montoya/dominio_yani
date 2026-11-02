// run.ts: acá puse lo del RUN chileno (lo saqué de mi validaciones.js de antes).
// - validarRun revisa el dígito verificador con el algoritmo módulo 11.
// - formatearRun le va poniendo los puntos y el guion mientras la persona escribe.

export const validarRun = (runCompleto: string): boolean => {
  const run = runCompleto.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (!/^[0-9]{7,8}[0-9K]$/.test(run)) return false;

  const cuerpo = run.slice(0, -1);
  const dv = run.slice(-1);

  // multiplico cada número por 2,3,4,5,6,7 (y vuelvo a 2) de derecha a izquierda y sumo
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  let dvEsperado = resto.toString();
  if (resto === 11) dvEsperado = "0";
  if (resto === 10) dvEsperado = "K";
  return dv === dvEsperado;
};

export const formatearRun = (texto: string): string => {
  // saco todo lo que no sea número o K (así nadie puede escribir letras raras)
  const limpio = texto.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length <= 1) return limpio;

  const cuerpo = limpio.slice(0, -1); // los números de adelante
  const dv = limpio.slice(-1); // el dígito verificador

  // le pongo un punto cada 3 números empezando desde la derecha
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
};
