// services/admin.ts: acá viven TODAS las llamadas del área de administradora
// (los mantenedores: productos y mensajes de contacto).
// Solo funcionan con la sesión abierta: headersApi() manda el token del login
// y el backend responde 401 si la sesión no vale.
import { baseApi, headersApi, ApiError, envolverErrorRed } from "./api";
import type { Producto } from "../data/productos";

// ---------- tipos ----------

// mensajes del mantenedor de contacto (GET /api/contacto/mensajes)
export interface MensajeContactoAdmin {
  id: number;
  nombre: string;
  email: string;
  comentario: string;
  estado: string; // "NUEVO" | "LEIDO"
  fecha: string; // viene en formato ISO (ej: 2026-11-03T14:22:05Z)
  respuesta?: string | null; // lo que la administración respondió (null = sin responder)
  fechaRespuesta?: string | null; // cuándo se guardó esa respuesta
}

// cuerpo para cambiar el estado de un mensaje (PUT .../estado)
export interface EstadoMensaje {
  estado: "NUEVO" | "LEIDO";
}

// producto para crear/editar desde el mantenedor (cuerpo del POST/PUT)
export interface ProductoAdmin {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockCritico?: number | null;
  categoria: string;
  tipo: string;
  imagen: string;
  destacado: boolean;
}

const URL_MENSAJES = `${baseApi()}/contacto/mensajes`;
const URL_PRODUCTOS = `${baseApi()}/productos`;

// ---------- mensajes de contacto ----------

export const listarMensajes = async (): Promise<MensajeContactoAdmin[]> => {
  const respuesta = await fetch(URL_MENSAJES, { headers: headersApi() }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; data?: unknown }
    | null;
  if (!respuesta.ok || !cuerpo?.success || !Array.isArray(cuerpo.data)) {
    throw new ApiError("MENSAJES_FALLIDO", "No pudimos cargar los mensajes. Inténtalo de nuevo.");
  }
  return cuerpo.data as MensajeContactoAdmin[];
};

export const cambiarEstadoMensaje = async (id: number, estado: EstadoMensaje["estado"]): Promise<MensajeContactoAdmin> => {
  const respuesta = await fetch(`${URL_MENSAJES}/${id}/estado`, {
    method: "PUT",
    headers: headersApi(),
    body: JSON.stringify({ estado }),
  }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; data?: unknown; message?: string; mensaje?: string }
    | null;
  if (!respuesta.ok || !cuerpo?.success) {
    throw new ApiError("ESTADO_FALLIDO", cuerpo?.message || cuerpo?.mensaje || "No pudimos actualizar el mensaje.");
  }
  return cuerpo.data as MensajeContactoAdmin;
};

export const eliminarMensaje = async (id: number): Promise<void> => {
  const respuesta = await fetch(`${URL_MENSAJES}/${id}`, { method: "DELETE", headers: headersApi() }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; message?: string; mensaje?: string }
    | null;
  if (!respuesta.ok || !cuerpo?.success) {
    throw new ApiError("BORRADO_FALLIDO", cuerpo?.message || cuerpo?.mensaje || "No pudimos eliminar el mensaje.");
  }
};

// guarda la respuesta escrita en la ventana: queda archivada junto al mensaje
export const enviarRespuesta = async (id: number, texto: string): Promise<MensajeContactoAdmin> => {
  const respuesta = await fetch(`${URL_MENSAJES}/${id}/respuesta`, {
    method: "POST",
    headers: headersApi(),
    body: JSON.stringify({ respuesta: texto }),
  }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; data?: unknown; message?: string; mensaje?: string }
    | null;
  if (!respuesta.ok || !cuerpo?.success) {
    throw new ApiError("RESPUESTA_FALLIDA", cuerpo?.message || cuerpo?.mensaje || "No pudimos guardar la respuesta.");
  }
  return cuerpo.data as MensajeContactoAdmin;
};

// ---------- productos (mantenedor del catálogo) ----------

export const crearProducto = async (producto: ProductoAdmin): Promise<Producto> => {
  const respuesta = await fetch(URL_PRODUCTOS, {
    method: "POST",
    headers: headersApi(),
    body: JSON.stringify(producto),
  }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; data?: unknown; message?: string; mensaje?: string }
    | null;
  if (!respuesta.ok || !cuerpo?.success) {
    throw new ApiError("CREAR_FALLIDO", cuerpo?.message || cuerpo?.mensaje || "No pudimos crear el producto.");
  }
  return cuerpo.data as Producto;
};

export const actualizarProducto = async (codigo: string, producto: ProductoAdmin): Promise<Producto> => {
  const respuesta = await fetch(`${URL_PRODUCTOS}/${encodeURIComponent(codigo)}`, {
    method: "PUT",
    headers: headersApi(),
    body: JSON.stringify(producto),
  }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; data?: unknown; message?: string; mensaje?: string }
    | null;
  if (!respuesta.ok || !cuerpo?.success) {
    throw new ApiError("ACTUALIZAR_FALLIDO", cuerpo?.message || cuerpo?.mensaje || "No pudimos actualizar el producto.");
  }
  return cuerpo.data as Producto;
};

export const eliminarProducto = async (codigo: string): Promise<void> => {
  const respuesta = await fetch(`${URL_PRODUCTOS}/${encodeURIComponent(codigo)}`, {
    method: "DELETE",
    headers: headersApi(),
  }).catch(envolverErrorRed);
  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { success?: boolean; message?: string; mensaje?: string }
    | null;
  if (!respuesta.ok || !cuerpo?.success) {
    throw new ApiError("BORRADO_FALLIDO", cuerpo?.message || cuerpo?.mensaje || "No pudimos eliminar el producto.");
  }
};
