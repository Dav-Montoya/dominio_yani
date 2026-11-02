// data/regiones.ts: acá puse las regiones y sus comunas para el registro.
// RECOMENDACIÓN: dejé una lista corta de ejemplo; si quiero más comunas,
// solo agrego nombres acá y el formulario las muestra solo.
export const regiones = [
  { valor: "metropolitana", etiqueta: "Región Metropolitana" },
  { valor: "valparaiso", etiqueta: "Región de Valparaíso" },
  { valor: "biobio", etiqueta: "Región del Biobío" },
];

export const comunasPorRegion: Record<string, string[]> = {
  metropolitana: ["La Pintana", "Puente Alto", "Santiago", "Maipú", "Ñuñoa"],
  valparaiso: ["Valparaíso", "Viña del Mar", "Quilpué"],
  biobio: ["Concepción", "Talcahuano", "Los Ángeles"],
};
