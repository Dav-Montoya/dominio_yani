// data/maids.ts: acá van las maids que aparecen en la página "Maids".
// Los nombres y las fotos salen de mi catálogo (data/productos.ts y public/imgs/).
// 🖼️ Por ahora uso la imagen XL de cada maid; si tengo una foto oficial, solo cambio la ruta "imagen".
// "descripcion" es opcional: la escribo solo cuando tenga el texto confirmado (no inventé ninguno).
export interface Maid {
  slug: string; // el mismo valor que usa el filtro de la merch (categoria en productos.ts)
  nombre: string;
  imagen: string;
  descripcion?: string;
}

export const maids: Maid[] = [
  { slug: "shikku", nombre: "Shikku", imagen: "/imgs/shikkuXL.webp" },
  { slug: "fumi", nombre: "Fumi", imagen: "/imgs/fumiXL.webp" },
  { slug: "michiru", nombre: "Michiru", imagen: "/imgs/michiruXL.webp" },
  { slug: "bekyuu", nombre: "Bekyuu", imagen: "/imgs/bekyuuXL.webp" },
  { slug: "ritsu", nombre: "Ritsu", imagen: "/imgs/ritsuXL.webp" },
  { slug: "aimi", nombre: "Aimi", imagen: "/imgs/aimiXL.webp" },
];
