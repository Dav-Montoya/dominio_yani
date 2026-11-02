// PÁGINA: INICIO (ruta "/")  <- mi index.html de antes
// Acá muestro: la bienvenida, la foto de portada, el video de la última presentación
// y los productos destacados.
import { Link } from "wouter";
import CatalogoEstado from "../../components/catalogo-estado/CatalogoEstado";
import PageTitle from "../../components/page-title/PageTitle";
import Photo from "../../components/photo/Photo";
import ProductoCard from "../../components/producto-card/ProductoCard";
import type { Producto } from "../../data/productos";

interface HomeProps {
  onAgregar: (producto: Producto) => void;
  productos: Producto[]; // catálogo que llega por props desde App.tsx (backend o lista local)
  cargando: boolean;
  error: string;
}

// acá puse los 3 accesos a las páginas de la comunidad; si agrego otra, solo sumo una línea
const accesos = [
  { href: "/historia", titulo: "Nuestra historia", texto: "Cómo nació y cómo volvió a despertar." },
  { href: "/maids", titulo: "Maids", texto: "Conócelas y mira su merch." },
  { href: "/eventos", titulo: "Eventos", texto: "Nuestras participaciones internacionales." },
];

const Home = ({ onAgregar, productos, cargando, error }: HomeProps) => {
  // acá saco los productos que el backend marca como destacados
  const destacados = productos.filter((p) => p.destacado);
  return (
    <div className="mx-auto max-w-6xl">
      {/* ---------- Bienvenida ---------- */}
      <section>
        <PageTitle>Bienvenida a Secret Sweet Maid</PageTitle>
        <div className="panel">
          <p className="mb-3 leading-relaxed">
            Secret Sweet Maid es un proyecto dedicado a la cultura maid, inspirado en el anime y la
            cultura otaku de Akihabara, Japón. Los maid cafés son espacios donde las camareras reciben
            y atienden amablemente a sus invitados, creando una experiencia ambientada en un mundo de
            fantasía, diversión e inocencia.
          </p>
          <p className="mb-4 leading-relaxed">
            A través de nuestras presentaciones y actividades, buscamos compartir nuestra pasión por
            esta cultura y crear momentos entretenidos para quienes nos acompañan. En nuestra tienda
            online podrás encontrar stickers, photocards y productos inspirados en nuestras
            integrantes, llevando un pedacito de Secret Sweet Maid contigo.
          </p>
          {/* este botón lleva directo al catálogo */}
          <Link href="/productos" className="boton">
            Ver catálogo completo
          </Link>
        </div>
      </section>

      {/* ---------- Foto de portada ---------- */}
      <section aria-label="Imagen destacada" className="mt-6">
        {/* 🖼️ acá va mi foto de portada: public/imgs/portada1.webp */}
        <Photo
          src="/imgs/portada1.webp"
          alt="Secret Sweet Maid"
          className="h-52 w-full rounded-3xl border-4 border-white object-[50%_45%] shadow-lg shadow-rosa-300/30 sm:h-72 lg:h-80"
        />
      </section>

      {/* ---------- Accesos a la comunidad ---------- */}
      <section aria-label="Conoce la comunidad" className="mt-8 grid gap-5 sm:grid-cols-3">
        {accesos.map((a) => (
          <Link key={a.href} href={a.href} className="panel block text-center transition hover:-translate-y-1">
            <span className="block text-lg font-extrabold text-rosa-500">{a.titulo}</span>
            <span className="mt-1 block text-sm font-semibold">{a.texto}</span>
          </Link>
        ))}
      </section>

      {/* ---------- Video ---------- */}
      <section className="mt-8">
        <PageTitle>Conoce nuestra última presentación</PageTitle>
        {/* en vez de incrustar el video, muestro su miniatura de YouTube y al tocarla se abre el video en otra pestaña */}
        <a
          href="https://www.youtube.com/watch?v=XWPRhyQvgMc"
          target="_blank"
          rel="noopener noreferrer"
          className="relative mx-auto block max-w-2xl overflow-hidden rounded-3xl border-4 border-white shadow-lg shadow-rosa-300/30"
          aria-label="Ver la última presentación de Secret Sweet Maid en YouTube"
        >
          {/* esta miniatura viene de YouTube (necesita internet) */}
          <Photo
            src="https://img.youtube.com/vi/XWPRhyQvgMc/hqdefault.jpg"
            alt="Previsualización de la última presentación de Secret Sweet Maid"
            className="h-52 w-full sm:h-72"
          />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#ff0050] px-5 py-2 text-3xl text-white shadow-lg">
            ▶
          </span>
        </a>
      </section>

      {/* ---------- Productos destacados ---------- */}
      <section className="mt-8">
        <PageTitle subtitulo="Lo más lindo de nuestra tienda">Productos destacados</PageTitle>
        <CatalogoEstado
          cargando={cargando}
          error={error}
          vacio={!cargando && !error && destacados.length === 0}
        />
        {destacados.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((producto) => (
              <ProductoCard key={producto.codigo} producto={producto} onAgregar={onAgregar} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
