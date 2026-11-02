// Menu.tsx: acá hice el menú de navegación (mi <nav> rosado de antes).
// - En computador: queda a la izquierda, fijo, como mi columna de 2 de 12.
// - En celular: es una barra arriba con un botón ☰ que abre y cierra los links.
// Uso <Link> de wouter en vez de <a href> para cambiar de página sin recargar todo.
import { useState } from "react";
import { Link, useLocation } from "wouter";
import type { Sesion } from "../../utils/storage";

interface MenuProps {
  sesion: Sesion | null; // quién inició sesión (o null si nadie)
  cantidadCarrito: number; // cuántas unidades hay en el carrito (para el numerito)
  onLogout: () => void; // función que viene de App.tsx para cerrar sesión
}

// acá puse la lista de links; si agrego una página nueva, solo agrego una línea
const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/historia", texto: "Nuestra historia" },
  { href: "/maids", texto: "Maids" },
  { href: "/eventos", texto: "Eventos" },
  { href: "/productos", texto: "Nuestra Merch" },
  { href: "/carrito", texto: "Carrito" },
  { href: "/contacto", texto: "Contacto" },
];

const Menu = ({ sesion, cantidadCarrito, onLogout }: MenuProps) => {
  const [abierto, setAbierto] = useState(false); // ¿está abierto el menú del celular?
  const [ubicacion] = useLocation(); // la dirección actual, por ejemplo "/productos"

  const cerrar = () => setAbierto(false);

  // acá reviso si el link es la página donde estoy, para subrayarlo
  const esActivo = (href: string) => (href === "/" ? ubicacion === "/" : ubicacion.startsWith(href));
  const claseLink = (href: string) =>
    `flex items-center justify-between rounded-full px-4 py-2 font-bold text-white transition ${
      esActivo(href) ? "bg-white/90 !text-rosa-500 shadow" : "hover:bg-white/25"
    }`;

  const contador = (
    <span className="ml-2 inline-block min-w-6 rounded-full bg-white px-2 text-center text-xs font-extrabold text-rosa-500">
      {cantidadCarrito}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 bg-rosa-300 text-white shadow-lg shadow-rosa-300/40 lg:col-span-3 lg:h-screen lg:self-start lg:overflow-y-auto lg:rounded-r-3xl xl:col-span-2">
      {/* fila de arriba: el logo y el botón ☰ (el botón solo aparece en celular) */}
      <div className="flex items-center justify-between px-4 py-3 lg:flex-col lg:gap-2 lg:px-5 lg:pt-8 lg:pb-4">
        <Link href="/" onClick={cerrar} className="text-lg font-extrabold leading-tight text-white lg:text-center lg:text-xl">
          Secret Sweet Maid
        </Link>
        <button
          type="button"
          className="rounded-full bg-white/25 px-3 py-1 text-xl lg:hidden"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        >
          {abierto ? "✕" : "☰"}
        </button>
      </div>

      {/* los links: en celular están escondidos hasta tocar ☰ y en computador se ven siempre */}
      <nav className={`${abierto ? "block" : "hidden"} px-4 pb-6 lg:block lg:px-5`}>
        <ul className="flex flex-col gap-1.5">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link href={e.href} onClick={cerrar} className={claseLink(e.href)}>
                {e.texto}
                {e.href === "/carrito" && contador}
              </Link>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-white/40" />

        {/* acá cambia según haya sesión iniciada o no */}
        {sesion ? (
          <div className="text-center">
            <p className="text-sm font-bold">Hola, {sesion.nombre}</p>
            <p className="mb-3 text-xs">{sesion.rol === "Admin" ? "Administrador/a" : "Cliente"}</p>
            <button
              type="button"
              className="boton-suave w-full"
              onClick={() => {
                cerrar();
                onLogout();
              }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/login" onClick={cerrar} className={claseLink("/login")}>
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link href="/register" onClick={cerrar} className={claseLink("/register")}>
                Registrarme
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Menu;
