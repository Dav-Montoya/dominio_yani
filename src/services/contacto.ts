// services/contacto.ts: manda el mensaje del formulario "Contáctanos" al backend.
// Antes el formulario era solo de pantalla (mostraba el éxito y listo); ahora, si hay
// backend configurado, el mensaje se guarda en la base y se notifica al equipo por ntfy.
import { baseApi } from "./api";
import { entorno } from "../config/entorno";

const URL_CONTACTO = `${baseApi()}/contacto`;

export interface MensajeContacto {
  nombre: string;
  email: string;
  comentario: string;
}

// si no hay backend configurado (modo sin servidor), devuelvo false: la página
// hace su aviso de éxito "de mentirita" como antes, sin hacer llamadas
export const hayServidorContacto = (): boolean => Boolean(entorno.apiUrl);

export const enviarMensajeContacto = async (mensaje: MensajeContacto): Promise<void> => {
  let respuesta: Response;
  try {
    respuesta = await fetch(URL_CONTACTO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mensaje),
    });
  } catch {
    throw new Error("No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.");
  }

  type CuerpoContacto = { success?: boolean; message?: string; mensaje?: string };
  let cuerpo: CuerpoContacto | null = null;
  try {
    cuerpo = (await respuesta.json()) as CuerpoContacto;
  } catch {
    throw new Error("No pudimos enviar tu mensaje. Inténtalo más tarde.");
  }

  if (!respuesta.ok || !cuerpo?.success) {
    throw new Error(cuerpo?.message || cuerpo?.mensaje || "No se pudo enviar el mensaje.");
  }
};
