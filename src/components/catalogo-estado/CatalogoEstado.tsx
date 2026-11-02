// components/catalogo-estado/CatalogoEstado.tsx
// Acá centralizo los avisos del catálogo que ahora viene del backend:
// mientras carga, si hay un problema de conexión, o si la base no tiene productos.
// (En modo local nunca se ve: la lista está lista al toque.)
interface CatalogoEstadoProps {
  cargando: boolean;
  error: string;
  vacio: boolean;
}

const CatalogoEstado = ({ cargando, error, vacio }: CatalogoEstadoProps) => {
  if (cargando) {
    return (
      <div role="status" className="panel mx-auto my-6 max-w-lg text-center">
        <p className="font-bold">Cargando el catálogo del backend… 🛍️</p>
        <p className="mt-2 text-sm">Espere por favor .</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="panel mx-auto my-6 max-w-lg text-center">
        <p className="mb-2 font-bold">No pudimos cargar el catálogo 😔</p>
        <p className="mt-2 text-sm">Ya volveran 🙃.</p>
      </div>
    );
  }

  if (vacio) {
    return (
      <div className="panel mx-auto my-6 max-w-lg text-center">
        <p className="font-bold">No hay productos publicados todavía .</p>
        <p className="mt-2 text-sm">Pronto llenaremos la tienda con merch nuevo 🤩.</p>
      </div>
    );
  }

  return null;
};

export default CatalogoEstado;
