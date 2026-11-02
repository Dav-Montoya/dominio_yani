// Footer.tsx: acá puse el pie de página que antes copiaba en cada HTML.
// Como es un componente, lo escribo una sola vez y aparece en todas las páginas.
import { Link } from "wouter";
import EstadoServidor from "../estado-servidor/EstadoServidor";
import Redes from "../redes/Redes";

// acá saco el año una sola vez, fuera del componente, para que no cambie en cada dibujo
const anio = new Date().getFullYear();

const Footer = () => (
  <footer className="mx-auto mt-12 max-w-6xl rounded-3xl bg-white/70 px-4 py-3 text-center text-sm font-semibold backdrop-blur-sm">
    Secret Sweet Maid &copy; {anio} ·{" "}
    <Link href="/contacto" className="text-rosa-500 underline">
      Contáctanos
    </Link>{" "}
    · <Redes />
    <EstadoServidor />
  </footer>
);

export default Footer;
