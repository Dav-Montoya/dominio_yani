// paginas.test.tsx: prueba rápida de que cada página se dibuja sin errores y muestra su contenido.
// ATENCIÓN: el catálogo ahora llega desde el backend (fs2-api) de forma async, así que en SSR
// (renderToString no ejecuta efectos) la lista puede venir vacía todavía: por eso las pruebas
// revisan los TÍTULOS/estructura de cada página, no productos concretos (eso es cosa del backend).
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("window", { location: { origin: "http://localhost:5173" } });

const casos: [string, string, string][] = [
  ["/", "", "Nuestra historia"],
  ["/historia", "", "Nace la comunidad"],
  ["/maids", "", "Ver su merch"],
  ["/eventos", "", "Tokyo Maid Expo"],
  ["/productos", "", "Nuestra Merch"],
  ["/login", "", "Iniciar sesión"],
  ["/cuenta", "", "Iniciar sesión"], // sin sesión, mi cuenta muestra el login
  ["/register", "", "Crear cuenta nueva"],
  ["/contacto", "", "Síguenos"],
  ["/carrito", "", "carrito"],
];

describe("las páginas se dibujan sin errores", () => {
  it.each(casos)("%s", async (ruta, busqueda, texto) => {
    const { default: App } = await import("./App");
    const html = renderToString(
      <Router ssrPath={ruta} ssrSearch={busqueda}>
        <App />
      </Router>,
    );
    expect(html).toContain(texto);
  });
});
