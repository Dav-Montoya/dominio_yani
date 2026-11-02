// PÁGINA: 404 (cualquier dirección que no exista)
// RECOMENDACIÓN: la agregué para que, si alguien escribe mal la dirección, no vea una pantalla vacía.
import { Link } from "wouter";

const NotFound = () => (
  <div className="panel mx-auto mt-10 max-w-lg text-center">
    <h2 className="mb-2 text-3xl font-extrabold text-rosa-500">¡Ups! Página no encontrada</h2>
    <p className="mb-5">Esta página se perdió entre los listones 🎀</p>
    <Link href="/" className="boton">
      Volver al inicio
    </Link>
  </div>
);

export default NotFound;
