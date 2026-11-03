// pages/admin/Admin.tsx: "portada" de los mantenedores (área de administradora).
// No administra nada por sí misma: pongo las dos tarjetas que llevan a los
// mantenedores de verdad (Productos y Mensajes de contacto), para que del menú
// baste un solo link.
import { Link } from "wouter";
import PageTitle from "../../components/page-title/PageTitle";

const Admin = () => (
  <>
    <PageTitle subtitulo="Pantallas de administración de la tienda: catálogo de productos y bandeja de mensajes.">
      Mantenedores
    </PageTitle>

    <div className="grid gap-6 md:grid-cols-2">
      {/* mantenedor 1: productos */}
      <Link href="/admin/productos" className="panel group block no-underline text-rosa-500 transition hover:-translate-y-1 hover:shadow-lg">
        <h3 className="mb-2 text-xl font-extrabold">📦 Mantenedor de Productos</h3>
        <p className="text-ciruela">
          Crear, editar y eliminar los productos del catálogo: nombre, precio, stock,
          categoría, imagen y si aparece destacado en el inicio.
        </p>
        <span className="mt-3 inline-block font-bold text-rosa-500">Abrir →</span>
      </Link>

      {/* mantenedor 2: mensajes de contacto */}
      <Link href="/admin/mensajes" className="panel group block no-underline text-rosa-500 transition hover:-translate-y-1 hover:shadow-lg">
        <h3 className="mb-2 text-xl font-extrabold">✉️ Mantenedor de Mensajes</h3>
        <p className="text-ciruela">
          Bandeja con los mensajes que llegan del formulario de contacto:
          leerlos, marcarlos como revisados o eliminarlos.
        </p>
        <span className="mt-3 inline-block font-bold text-rosa-500">Abrir →</span>
      </Link>
    </div>
  </>
);

export default Admin;
