// data/historia.ts: acá van los hitos de "Nuestra historia".
// Solo puse lo que está escrito en la página oficial (secretsweetmaid.carrd.co), con mis palabras.
// Si quiero agregar un hito nuevo, copio un bloque { ... } y lo pongo en el orden correcto.
export interface Hito {
  etiqueta: string; // el año o la etapa que se ve en el circulito
  titulo: string;
  texto: string;
}

export const origenNombre =
  'El nombre viene de la canción "Secret Sweet Pain" de @ぐみ (at-home cafe), que inspiró a la comunidad.';

export const hitos: Hito[] = [
  {
    etiqueta: "2017",
    titulo: "Nace la comunidad",
    texto:
      "Cerraba sus puertas la antigua mansión. El cariño por goshujinsama y ojousama, la amistad y las ganas de mantener viva la cultura maid dieron origen a Secret Sweet Maid.",
  },
  {
    etiqueta: "Primer año",
    titulo: "Un gran desafío",
    texto:
      "Siendo una comunidad recién formada, apoyaron la visita de 3 maids japonesas de at-home cafe, el café que las inspiró.",
  },
  {
    etiqueta: "2020",
    titulo: "Un profundo sueño",
    texto:
      "Entraron en pausa mientras el mundo se recuperaba, con la promesa de seguir difundiendo la cultura maid en Chile.",
  },
  {
    etiqueta: "Fines de 2021",
    titulo: "El despertar",
    texto: "Volvieron con nuevas maids que asumieron su misión de mensajeras.",
  },
];

export const hoy =
  "Hoy Secret Sweet Maid es un referente para varios Maid Cafés y comunidades que comparten el amor por las maids.";
