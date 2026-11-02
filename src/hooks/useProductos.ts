// hooks/useProductos.ts: trae el catálogo una sola vez al montar y lo deja listo
// para las páginas (App.tsx lo reparte por props).
// Tiene DOS modos, igual que toda la tienda:
//  - con VITE_API_URL: busca la lista oficial en el backend (fs2-api).
//  - sin backend configurado: usa el catálogo local de data/productos.ts (no llama a nadie).
import { useCallback, useEffect, useState } from "react";
import { productos as productosLocales } from "../data/productos";
import type { Producto } from "../data/productos";
import { entorno } from "../config/entorno";
import { listarProductos } from "../services/productos";

export type ModoCatalogo = "api" | "local";

export interface EstadoProductos {
  productos: Producto[];
  cargando: boolean;
  error: string; // "" si la carga anduvo bien
  modo: ModoCatalogo;
  recargar: () => void;
}

export const useProductos = (): EstadoProductos => {
  // el modo lo decide el .env y no cambia mientras corre la tienda
  const modo: ModoCatalogo = entorno.apiUrl ? "api" : "local";

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(modo === "api"); // en modo local ya tengo la lista
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    // modo local: uso el catálogo guardado acá y no intento ninguna llamada
    if (modo !== "api") {
      setProductos(productosLocales);
      setCargando(false);
      return;
    }

    let vivo = true; // para no grabar el estado si la página cambió mientras pedía
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const lista = await listarProductos();
        if (vivo) setProductos(lista);
      } catch (problema) {
        if (vivo) setError(problema instanceof Error ? problema.message : "No se pudo cargar el catálogo.");
      } finally {
        if (vivo) setCargando(false);
      }
    };
    cargar();
    return () => {
      vivo = false;
    };
  }, [intentos, modo]);

  const recargar = useCallback(() => setIntentos((n) => n + 1), []);

  return { productos, cargando, error, modo, recargar };
};
