// components/admin/RequiereAdmin.tsx: "portero" de las páginas de administradora.
// Si no hay sesión, o si la persona que entró no es Admin, no deja ver el contenido
// de los mantenedores y explica por qué (con un botón para ir al login).
import type { ReactNode } from "react";
import { Link } from "wouter";
import type { Sesion } from "../../utils/storage";

interface RequiereAdminProps {
  sesion: Sesion | null;
  children: ReactNode; // la página que protege
}

const RequiereAdmin = ({ sesion, children }: RequiereAdminProps) => {
  // sin sesión → invitar a iniciar; con sesión pero rol Cliente → aviso
  if (!sesion) {
    return (
      <div role="alert" className="panel mx-auto max-w-xl text-center">
        <h2 className="mb-2 text-xl font-extrabold text-rosa-500">Zona de administración</h2>
        <p className="mb-4">Esta página es solo para la administradora de la tienda, así que necesitas iniciar sesión primero.</p>
        <Link href="/login" className="boton block no-underline">
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  if (sesion.rol !== "Admin") {
    return (
      <div role="alert" className="panel mx-auto max-w-xl text-center">
        <h2 className="mb-2 text-xl font-extrabold text-rosa-500">Solo para administradoras</h2>
        <p>Tu cuenta inicia sesión como cliente, así que no puede entrar a los mantenedores de la tienda.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequiereAdmin;
