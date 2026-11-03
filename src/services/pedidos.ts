// services/pedidos.ts: manda el carrito al backend para crear el pedido (POST /api/pedidos).
// El backend recalcula el total con los precios de su base, revisa el stock
// y descuenta las unidades: lo que dice la pantalla nunca es la "verdad" final.
import { baseApi, ApiError } from "./api";

const URL_PEDIDOS = `${baseApi()}/pedidos`;

export interface Pedido {
  id: number;
  fecha: string;
  estado: string;
  total: number;
}

export interface IntentoPedido {
  codigo: string;
  cantidad: number;
}

// crea el pedido con lo que hay en el carrito (solo código y cantidad;
// el backend completa nombre/precio con su catálogo actual)
export const crearPedido = async (items: IntentoPedido[]): Promise<Pedido> => {
  let respuesta: Response;
  try {
    respuesta = await fetch(URL_PEDIDOS, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(localStorage.getItem("auth_token") ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } : {}) },
      body: JSON.stringify({ items }),
    });
  } catch {
    throw new ApiError("SIN_CONEXION", "No pudimos conectar con la tienda. Ya volvemos: inténtalo de nuevo en unos minutos.");
  }

  type CuerpoPedido = { success?: boolean; data?: Pedido; error?: string; mensaje?: string; message?: string };
  let cuerpo: CuerpoPedido | null = null;
  try {
    cuerpo = (await respuesta.json()) as CuerpoPedido;
  } catch {
    throw new ApiError("SIN_JSON", "Hubo un problema al registrar tu pedido. Inténtalo de nuevo.");
  }

  if (!respuesta.ok || !cuerpo?.success) {
    // el backend devuelve mensajes útiles como "No hay stock suficiente de X"
    throw new ApiError(
      cuerpo?.error ?? "PEDIDO_FALLIDO",
      cuerpo?.message || cuerpo?.mensaje ||
        (respuesta.status === 401 ? "Tu sesión expiró: vuelve a iniciar sesión." : "No se pudo registrar el pedido."),
    );
  }
  return cuerpo.data as Pedido;
};
