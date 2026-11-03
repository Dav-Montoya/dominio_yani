// pages/admin/AdminMensajes.tsx: MANTENEDOR DE MENSAJES DE CONTACTO.
// Bandeja con los mensajes que llegan del formulario "Contáctanos":
//  - listarlos (los más nuevos arriba, tal como los manda el backend)
//  - ver la carta completa (desplegable bajo la fila, marca leído al abrirla)
//  - responder en la ventana (la respuesta queda guardada en el sistema)
//  - cambiar estado (NUEVO ←→ LEIDO) y eliminar (con confirmación)
// Requiere sesión de Admin (App.tsx lo envuelve con RequiereAdmin).
import { useCallback, useEffect, useState, Fragment } from "react";
import PageTitle from "../../components/page-title/PageTitle";
import { listarMensajes, cambiarEstadoMensaje, eliminarMensaje, enviarRespuesta as guardarRespuestaApi, type MensajeContactoAdmin } from "../../services/admin";
import { ApiError } from "../../services/api";

// fecha bonita: 03/11/2026 14:22 (el backend manda ISO con hora UTC)
const formatearFechaMensaje = (iso: string): string => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  const numeros = (n: number) => String(n).padStart(2, "0");
  return `${numeros(fecha.getDate())}/${numeros(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${numeros(fecha.getHours())}:${numeros(fecha.getMinutes())}`;
};

const AdminMensajes = () => {
  const [mensajes, setMensajes] = useState<MensajeContactoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [trabajando, setTrabajando] = useState<number | null>(null); // el id del mensaje en el que estoy actuando
  const [abierto, setAbierto] = useState<number | null>(null); // id del mensaje desplegado (la carta completa)
  const [textoRespuesta, setTextoRespuesta] = useState(""); // lo que la administradora escribe en la carta

  const recargar = useCallback(async () => {
    try {
      setMensajes(await listarMensajes());
      setError("");
    } catch (problema) {
      setError(problema instanceof ApiError ? problema.message : "No pudimos cargar los mensajes. Inténtalo de nuevo.");
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      setCargando(true);
      await recargar();
      if (vivo) setCargando(false);
    };
    void cargar();
    return () => {
      vivo = false;
    };
  }, [recargar]);

  const marcar = async (mensaje: MensajeContactoAdmin) => {
    setAviso("");
    setTrabajando(mensaje.id);
    try {
      const nuevo = await cambiarEstadoMensaje(mensaje.id, mensaje.estado === "LEIDO" ? "NUEVO" : "LEIDO");
      setMensajes((actual) => actual.map((m) => (m.id === nuevo.id ? nuevo : m)));
      setAviso(`Mensaje de "${mensaje.nombre}" marcado como ${nuevo.estado === "LEIDO" ? "leído" : "no revisado"}.`);
    } catch (problema) {
      setError(problema instanceof ApiError ? problema.message : "No pudimos actualizar el mensaje.");
    } finally {
      setTrabajando(null);
    }
  };

  const borrar = async (mensaje: MensajeContactoAdmin) => {
    setAviso("");
    if (!window.confirm(`¿Seguro que quieres eliminar el mensaje de "${mensaje.nombre}"?`)) return;
    setTrabajando(mensaje.id);
    try {
      await eliminarMensaje(mensaje.id);
      setMensajes((actual) => actual.filter((m) => m.id !== mensaje.id));
      setAviso(`Mensaje de "${mensaje.nombre}" eliminado.`);
    } catch (problema) {
      setError(problema instanceof ApiError ? problema.message : "No pudimos eliminar el mensaje.");
    } finally {
      setTrabajando(null);
    }
  };

  // abrir la carta: muestra el mensaje completo y, si aún no estaba revisado,
  // lo marca como leído automáticamente (así la bandeja refleja lo que hiciste)
  const ver = (mensaje: MensajeContactoAdmin) => {
    if (abierto === mensaje.id) {
      setAbierto(null); // mismo "Ver" = cerrar la carta
      return;
    }
    setAbierto(mensaje.id);
    // si el mensaje ya tiene respuesta archivada, la caja arranca con ella (se puede editar)
    setTextoRespuesta(mensaje.respuesta ?? "");
    if (mensaje.estado !== "LEIDO") void marcar(mensaje);
  };

  // responder en la ventana: la respuesta se guarda en el sistema junto al mensaje
  // (con fecha) y queda visible acá mismo. Nada de apps externas ni pestañas raras.
  const enviarRespuestaCarta = async (mensaje: MensajeContactoAdmin) => {
    setAviso("");
    const texto = textoRespuesta.trim();
    if (!texto) {
      setError("Escribe una respuesta antes de enviar.");
      return;
    }
    setTrabajando(mensaje.id);
    try {
      const respondido = await guardarRespuestaApi(mensaje.id, texto);
      setMensajes((actual) => actual.map((m) => (m.id === respondido.id ? respondido : m)));
      setAbierto(respondido.id);
      setTextoRespuesta(respondido.respuesta ?? "");
      setAviso(`Respuesta a "${mensaje.nombre}" guardada.`);
    } catch (problema) {
      setError(problema instanceof ApiError ? problema.message : "No pudimos guardar la respuesta.");
    } finally {
      setTrabajando(null);
    }
  };

  // copiar al portapapeles la respuesta (archivada o el borrador), para pegarla
  // en el correo y enviarla al destinatario por su medio de siempre
  const copiarRespuesta = async (mensaje: MensajeContactoAdmin) => {
    const texto = (mensaje.respuesta ?? textoRespuesta).trim();
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(`Hola ${mensaje.nombre}:\n\n${texto}\n\n¡Gracias por escribir a Secret Sweet Maid!`);
      setAviso("Respuesta copiada. Ya la puedes pegar en tu correo para enviársela.");
    } catch {
      setError("No pudimos copiar el texto. Selecciónalo y cópialo a mano, por favor.");
    }
  };

  const sinLeer = mensajes.filter((m) => m.estado !== "LEIDO").length;

  return (
    <>
      <PageTitle subtitulo="Bandeja de entrada del formulario de contacto.">
        Mantenedor de Mensajes
      </PageTitle>

      {aviso && (
        <p role="status" className="panel mb-4 max-w-6xl border-emerald-500 font-semibold text-emerald-700">
          {aviso}
        </p>
      )}
      {error && (
        <p role="alert" className="panel mb-4 max-w-6xl border-rosa-400 font-semibold text-rosa-500">
          {error}
        </p>
      )}

      {!cargando && mensajes.length > 0 && (
        <p className="mb-4 text-sm font-bold text-ciruela">
          {mensajes.length} mensaje{mensajes.length === 1 ? "" : "s"} · {sinLeer} sin leer
        </p>
      )}

      <div className="panel mb-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-rosa-200 text-xs uppercase text-ciruela">
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Mensaje</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-ciruela">
                  Cargando bandeja…
                </td>
              </tr>
            )}
            {!cargando && mensajes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-ciruela">
                  La bandeja está vacía. Los mensajes del formulario "Contáctanos" llegan acá.
                </td>
              </tr>
            )}
            {!cargando &&
              mensajes.map((m) => (
                <Fragment key={m.id}>
                <tr className={`border-b border-rosa-100 ${m.estado !== "LEIDO" ? "bg-rose-50/50" : ""}`}>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">{formatearFechaMensaje(m.fecha)}</td>
                  <td className="px-3 py-2 font-semibold">{m.nombre}</td>
                  <td className="px-3 py-2 text-xs">{m.email}</td>
                  <td className="max-w-80 px-3 py-2">{m.comentario}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-extrabold ${
                        m.respuesta ? "bg-emerald-600 text-white" : m.estado === "LEIDO" ? "bg-emerald-100 text-emerald-700" : "bg-rosa-200 text-rosa-500"
                      }`}
                    >
                      {m.respuesta ? "Respondido" : m.estado === "LEIDO" ? "Revisado" : "Nuevo"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      type="button"
                      className="boton-suave mr-2 px-3 py-1 text-xs"
                      onClick={() => ver(m)}
                    >
                      {abierto === m.id ? "Cerrar" : "Ver"}
                    </button>
                    <button
                      type="button"
                      className="boton-suave mr-2 px-3 py-1 text-xs"
                      disabled={trabajando === m.id}
                      onClick={() => void marcar(m)}
                    >
                      {m.estado === "LEIDO" ? "Marcar nuevo" : "Marcar leído"}
                    </button>
                    <button
                      type="button"
                      className="boton-suave px-3 py-1 text-xs"
                      disabled={trabajando === m.id}
                      onClick={() => void borrar(m)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                {abierto === m.id && (
                  // la carta abierta: el mensaje completo + responder aquí mismo
                  <tr>
                    <td colSpan={6} className="px-3 pb-4">
                      <div className="rounded-2xl border border-rosa-200 bg-white/70 p-4 text-left">
                        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="text-base font-extrabold text-rosa-500">
                            ✉️ Mensaje de {m.nombre}{" "}
                            <span className="font-normal text-ciruela">&lt;{m.email}&gt;</span>
                          </h4>
                          <span className="text-xs text-ciruela">{formatearFechaMensaje(m.fecha)}</span>
                        </div>
                        {/* el texto completo, con los saltos de línea tal como lo escribió la persona */}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ciruela">{m.comentario}</p>

                        {/* si ya fue respondido, muestro la respuesta archivada con su fecha */}
                        {m.respuesta && (
                          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                            <p className="mb-1 text-xs font-extrabold uppercase text-emerald-700">
                              Tu respuesta {m.fechaRespuesta ? `· ${formatearFechaMensaje(m.fechaRespuesta)}` : ""}
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ciruela">{m.respuesta}</p>
                          </div>
                        )}

                        {/* responder en la ventana: se escribe acá y queda guardada en el sistema */}
                        <div className="mt-3">
                          <label htmlFor={`respuesta-${m.id}`} className="mb-1 block text-xs font-extrabold uppercase text-ciruela">
                            {m.respuesta ? "Editar respuesta" : "Responder"}
                          </label>
                          <textarea
                            id={`respuesta-${m.id}`}
                            value={textoRespuesta}
                            onChange={(e) => setTextoRespuesta(e.target.value)}
                            rows={4}
                            maxLength={2000}
                            placeholder="Escribe tu respuesta acá…"
                            className="w-full resize-none rounded-xl border-2 border-rosa-200 bg-white p-3 text-sm text-ciruela outline-none focus:border-rosa-400"
                          />
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="boton px-4 py-1.5 text-xs"
                              disabled={trabajando === m.id}
                              onClick={() => void enviarRespuestaCarta(m)}
                            >
                              {trabajando === m.id ? "Guardando…" : m.respuesta ? "Actualizar respuesta" : "Enviar respuesta"}
                            </button>
                            <button
                              type="button"
                              className="boton-suave px-3 py-1.5 text-xs"
                              disabled={trabajando === m.id}
                              onClick={() => void copiarRespuesta(m)}
                            >
                              📋 Copiar respuesta
                            </button>
                            <span className="text-xs text-ciruela">
                              La respuesta queda guardada en la bandeja. Con "Copiar" la llevas al correo del destinatario.
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminMensajes;
