// data/eventos.ts: acá van los eventos y participaciones.
// IMPORTANTE: por ahora solo están las 2 participaciones internacionales que aparecen en la página oficial.
// El "listado de eventos" completo no pude leerlo, así que NO inventé ninguno.
// Para agregar uno, copio un bloque { ... } (lo más nuevo arriba).
export interface Evento {
  id: string;
  anio: number;
  titulo: string;
  ambito: string; // por ejemplo "Internacional"
  descripcion: string;
}

export const eventos: Evento[] = [
  {
    id: "enciclopedia-athome-2025",
    anio: 2025,
    titulo: "Enciclopedia at-home cafe, 20° aniversario",
    ambito: "Internacional",
    descripcion:
      "Secret Sweet Maid fue parte de la segunda gran enciclopedia que celebra los 20 años de at-home cafe.",
  },
  {
    id: "maid-expo-tokyo-2024",
    anio: 2024,
    titulo: "Tokyo Maid Expo",
    ambito: "Internacional",
    descripcion:
      "Evento cultural y de exposición de maids. La comunidad apareció en la revista del evento y saludó a sus fans que viven en Japón.",
  },
];
