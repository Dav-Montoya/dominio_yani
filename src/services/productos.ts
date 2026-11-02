// services/productos.ts: acá hablo con el backend (fs2-api) para el catálogo.
// La lista oficial de productos vive en la base del backend y llega por
// GET /api/productos (el seed la carga la primera vez que arranca el backend).
import { baseApi, ApiError, headersApi } from "./api";
import type { Producto } from "../data/productos";

const URL_PRODUCTOS = `${baseApi()}/productos`;

// devuelve la lista completa de productos del backend (lanza ApiError si falla)
export const listarProductos = async (): Promise<Producto[]> => {
  const respuesta = await fetch(URL_PRODUCTOS, { headers: headersApi() });
  let cuerpo: { success?: boolean; data?: unknown } | null = null;
  const tipo: unknown = await respuesta.json().catch(() => null);
  cuerpo = tipo as { success?: boolean; data?: unknown } | null;
  if (!respuesta.ok || !cuerpo?.success || !Array.isArray(cuerpo.data)) {
    throw new ApiError("CATALOGO_FALLIDO", "No se pudo cargar el catálogo del backend.");
  }
  return cuerpo.data as Producto[];
};
