// data/productos.ts: la LISTA Oficial del catálogo ahora vive en el backend (fs2-api) y
// llega por GET /api/productos vía src/services/productos.ts (el seed la carga).
// ESTA lista queda como respaldo del "modo sin backend": si el .env no tiene VITE_API_URL
// (o el servidor no responde al arrancar), la tienda sigue mostrando el catálogo local.
export interface Producto {
  codigo: string; // lo uso como identificador único (también va en la dirección /productos/SHI001)
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockCritico?: number; // si el stock baja de acá, aviso "quedan pocas unidades"
  categoria: string; // la maid dueña del producto, o "grupal"
  tipo: string;
  imagen: string; // la foto está en public/imgs/
  destacado?: boolean; // si es true aparece en "Productos destacados" del inicio
}

// acá armé la lista del filtro para no escribir cada opción a mano en el <select>
export const categorias = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "shikku", etiqueta: "Shikku" },
  { valor: "fumi", etiqueta: "Fumi" },
  { valor: "michiru", etiqueta: "Michiru" },
  { valor: "bekyuu", etiqueta: "Bekyuu" },
  { valor: "ritsu", etiqueta: "Ritsu" },
  { valor: "aimi", etiqueta: "Aimi" },
  { valor: "grupal", etiqueta: "Secret Sweet Maid" },
];

// acá hago los 4 productos de cada maid con una función, así no repito el mismo bloque 6 veces
const deMaid = (
  prefijo: string,
  categoria: string,
  nombre: string,
  imagenes: { sticker: string; xl: string; photocard: string; chapita: string },
): Producto[] => [
  { codigo: `${prefijo}001`, nombre: `Sticker ${nombre}`, descripcion: `Sticker de ${nombre} de Secret Sweet Maid.`, precio: 300, stock: 10, categoria, tipo: "sticker", imagen: imagenes.sticker },
  { codigo: `${prefijo}002`, nombre: `Sticker XL ${nombre}`, descripcion: `Sticker XL de ${nombre}.`, precio: 1000, stock: 10, categoria, tipo: "sticker-xl", imagen: imagenes.xl },
  { codigo: `${prefijo}003`, nombre: `Photocard ${nombre}`, descripcion: `Photocard de ${nombre}.`, precio: 1000, stock: 10, categoria, tipo: "photocard", imagen: imagenes.photocard },
  { codigo: `${prefijo}004`, nombre: `Chapita ${nombre}`, descripcion: `Chapita de ${nombre}.`, precio: 1000, stock: 10, categoria, tipo: "chapita", imagen: imagenes.chapita },
];

// 🖼️ acá van las rutas de las fotos: están en public/imgs/ (las pasé a .webp para que carguen rápido)
export const productos: Producto[] = [
  ...deMaid("SHI", "shikku", "Shikku", { sticker: "/imgs/shikku.webp", xl: "/imgs/shikkuXL.webp", photocard: "/imgs/photocardShikku.webp", chapita: "/imgs/chapaShikku.webp" }),
  ...deMaid("FUM", "fumi", "Fumi", { sticker: "/imgs/fumi.webp", xl: "/imgs/fumiXL.webp", photocard: "/imgs/photocardFumi.webp", chapita: "/imgs/chapaFumi.webp" }),
  ...deMaid("MIC", "michiru", "Michiru", { sticker: "/imgs/michiru.webp", xl: "/imgs/michiruXL.webp", photocard: "/imgs/photocardMichiru.webp", chapita: "/imgs/chapaMichiru.webp" }),
  ...deMaid("BEK", "bekyuu", "Bekyuu", { sticker: "/imgs/bekyuu.webp", xl: "/imgs/bekyuuXL.webp", photocard: "/imgs/photocardBekyuu.webp", chapita: "/imgs/chapaBekyuu.webp" }),
  ...deMaid("RIT", "ritsu", "Ritsu", { sticker: "/imgs/ritsu.webp", xl: "/imgs/ritsuXL.webp", photocard: "/imgs/photocardRitsu.webp", chapita: "/imgs/chapaRitsu.webp" }),
  ...deMaid("AIM", "aimi", "Aimi", { sticker: "/imgs/aimi.webp", xl: "/imgs/aimiXL.webp", photocard: "/imgs/photocardAimi.webp", chapita: "/imgs/chapaAimi.webp" }),

  // acá puse el merch general de Secret Sweet Maid (no es de una maid en particular)
  { codigo: "SSM001", nombre: "Llavero Secret Sweet Maid", descripcion: "Llavero oficial de Secret Sweet Maid.", precio: 3000, stock: 10, categoria: "grupal", tipo: "llavero", imagen: "/imgs/llavero3D.webp", destacado: true },
  { codigo: "SSM002", nombre: "Gashapon", descripcion: "Gashapon de Secret Sweet Maid.", precio: 500, stock: 10, categoria: "grupal", tipo: "gashapon", imagen: "/imgs/gashapon.webp" },
  { codigo: "SSM003", nombre: "Bolsa sorpresa", descripcion: "Bolsa sorpresa con productos de Secret Sweet Maid.", precio: 2000, stock: 10, categoria: "grupal", tipo: "bolsa", imagen: "/imgs/sobresSorpresa.webp", destacado: true },
  { codigo: "SSM004", nombre: "Cartas Pokemaid", descripcion: "Cartas coleccionables Pokemaid.", precio: 1000, stock: 10, categoria: "grupal", tipo: "cartas", imagen: "/imgs/cartasPokemaid.webp", destacado: true },
  { codigo: "SSM005", nombre: "Separador de libro", descripcion: "Separador de libro de Secret Sweet Maid.", precio: 1000, stock: 10, categoria: "grupal", tipo: "separador", imagen: "/imgs/marcaPaginas.webp" },
];
