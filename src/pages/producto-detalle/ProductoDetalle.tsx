// PÁGINA: DETALLE DE PRODUCTO (ruta "/productos/:codigo", por ejemplo /productos/SHI001)
// Esta página cumple el RF04 del README: ver más información de un producto y agregarlo al carrito.
// useParams() me da la parte ":codigo" de la dirección, y con eso busco el producto.
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import CatalogoEstado from "../../components/catalogo-estado/CatalogoEstado";
import CantidadInput from "../../components/cantidad-input/CantidadInput";
import PageTitle from "../../components/page-title/PageTitle";
import Photo from "../../components/photo/Photo";
import ProductoCard from "../../components/producto-card/ProductoCard";
import { categorias, type Producto } from "../../data/productos";
import { formatearPrecio } from "../../utils/formato";

interface ProductoDetalleProps {
  onAgregar: (producto: Producto, cantidad?: number) => void;
  productos: Producto[]; // catálogo que llega del backend (o la lista local)
  cargando: boolean;
  error: string;
}

const ProductoDetalle = ({ onAgregar, productos, cargando, error }: ProductoDetalleProps) => {
  const { codigo } = useParams<{ codigo: string }>();

  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  // Subir automáticamente al inicio cuando cambia el producto.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [codigo]);
  const producto = productos.find((p) => p.codigo === codigo);

  // si el catálogo aún está cargando (o falló), muestro el aviso en vez del NotFound
  if (cargando || error) {
    return <CatalogoEstado cargando={cargando} error={error} vacio={false} />;
  }

  // si escriben un código que no existe, muestro un mensaje amable en vez de una pantalla vacía
  if (!producto) {
    return (
      <div className="panel mx-auto mt-6 max-w-lg text-center">
        <p className="mb-4 text-lg font-bold">No encontramos ese producto 🥺</p>
        <Link href="/productos" className="boton">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const categoria = categorias.find((c) => c.valor === producto.categoria)?.etiqueta ?? producto.categoria;
  // acá busco hasta 3 productos de la misma maid para mostrarlos abajo como "te puede gustar"
  const relacionados = productos
    .filter((p) => p.categoria === producto.categoria && p.codigo !== producto.codigo)
    .slice(0, 3);

  const handleAgregar = () => {
    onAgregar(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/productos" className="mb-2 inline-block text-sm font-bold text-rosa-500 underline">
        ← Volver al catálogo
      </Link>
      <PageTitle>{producto.nombre}</PageTitle>

      <article className="panel grid gap-6 md:grid-cols-2">
        {/* 🖼️ acá va la foto del producto en grande (la misma de la tarjeta) */}
        <Photo
          src={producto.imagen}
          alt={producto.nombre}
          contener
          className="h-72 w-full rounded-2xl bg-rosa-100 p-3 md:h-96"
        />
        <div className="flex flex-col justify-center gap-3">
          <p className="text-sm font-bold text-rosa-500">{categoria}</p>
          <p className="text-lg">{producto.descripcion}</p>
          <p className="text-3xl font-extrabold text-rosa-500">{formatearPrecio(producto.precio)}</p>
          <p className="text-sm">Stock disponible: {producto.stock}</p>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="cantidad" className="text-sm font-bold">
              Cantidad
            </label>
            <CantidadInput id="cantidad" valor={cantidad} max={producto.stock} onCambio={setCantidad} />
            <button type="button" onClick={handleAgregar} className="boton">
              {agregado ? "¡Agregado!" : "Agregar al carrito"}
            </button>
          </div>
          <Link href="/carrito" className="text-sm font-bold text-rosa-500 underline">
            Ir al carrito
          </Link>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="mt-8">
          <PageTitle>También te puede gustar</PageTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p) => (
              <ProductoCard key={p.codigo} producto={p} onAgregar={onAgregar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductoDetalle;
