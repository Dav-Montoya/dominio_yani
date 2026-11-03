// PÁGINA: MI CUENTA (ruta "/cuenta")  <- punto 4 de las mejoras
// El usuario con sesión iniciada aquí tiene su propio apartado con dos bloques:
//  1) ÚLTIMA COMPRA: sale de GET /api/pedidos/mios (el backend las ordena de la más
//     nueva a la más vieja). Muestro fecha, estado, qué compró (nombre, cantidad y
//     precio de cada línea) y el total que pagó.
//  2) MIS DATOS: veo mi perfil y puedo cambiar cuatro cosas (todas con verificación
//      o confirmación previa, nada de cambios "de un solo clic"):
//     - CORREO: verificación doble -> 1) la CONTRASEÑA ACTUAL la valida Cognito
//       (comprueba que soy yo quien pide el cambio, no alguien con mi sesión abierta)
//       y 2) el código llega al correo NUEVO (comprueba que ese correo le responde).
//       Hasta confirmar el código, el correo anterior sigue vigente. Si el User Pool
//       no permite la verificación, el backend avisa y no se cambia.
//     - CONTRASEÑA: confirma con tu contraseña ACTUAL (la prueba de identidad la
//       hace Cognito) + paso de "¿Confirmas el cambio?" antes de ejecutar, y la
//       nueva debe cumplir la MISMA política del registro (valido con validarPassword).
//     - DIRECCIÓN + REGIÓN + COMUNA: como en el registro, con confirmación previa
//       ("¿Seguro?") y se guarda en la base del backend.
// Sin backend configurado, queda el aviso de demo (no hay cómo cambiar datos reales).
import { useEffect, useState, type FormEvent } from "react";
import Field from "../../components/field/Field";
import Mensaje, { type MensajeForm } from "../../components/mensaje/Mensaje";
import PageTitle from "../../components/page-title/PageTitle";
import api, { type PedidoDetalle, type Perfil } from "../../services/api";
import { entorno } from "../../config/entorno";
import { comunasPorRegion, regiones } from "../../data/regiones";
import type { Sesion } from "../../utils/storage";
import { formatearFechaNacimiento, formatearPrecio } from "../../utils/formato";
import { hayErrores, validarCorreo, validarPassword } from "../../utils/validators";

// fecha ISO del pedido -> texto legible (ej: "02 nov 2026, 21:45")
const formatearFecha = (iso: string): string =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Props {
  sesion: Sesion | null; // viene de App.tsx; si es null, la ruta ya muestra el login
}

const Cuenta = ({ sesion }: Props) => {
  const demoLocal = !entorno.apiUrl;

  // ----- datos de la cuenta -----
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
  // si es demo local no hay nada que cargar: arranco directo con "false"
  const [cargando, setCargando] = useState(!demoLocal);
  const [mensaje, setMensaje] = useState<MensajeForm | null>(null);
  const [enviando, setEnviando] = useState(false);

  // qué formulario está abierto ("ninguno" muestra solo los datos de lectura)
  const [bloque, setBloque] = useState<"ninguno" | "correo" | "contrasena" | "direccion">("ninguno");

  // ----- edición de correo (prueba de identidad + código al correo NUEVO) -----
  const [correoNuevo, setCorreoNuevo] = useState("");
  const [claveCorreo, setClaveCorreo] = useState(""); // contraseña actual: prueba de que soy yo
  const [etapaCorreo, setEtapaCorreo] = useState<"pedido" | "codigo">("pedido");
  const [codigoCorreo, setCodigoCorreo] = useState("");

  // ----- edición de contraseña (confirmación previa antes de ejecutar) -----
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [claveConfirmar, setClaveConfirmar] = useState("");
  const [pidiendoConfirmarClave, setPidiendoConfirmarClave] = useState(false);

  // ----- edición de dirección + región + comuna (con confirmación previa) -----
  const [direccionNueva, setDireccionNueva] = useState("");
  const [regionNueva, setRegionNueva] = useState("");
  const [comunaNueva, setComunaNueva] = useState("");
  const [pidiendoConfirmar, setPidiendoConfirmar] = useState(false);

  // al entrar, cargo el perfil y MIS pedidos del backend
  useEffect(() => {
    if (demoLocal) return; // en demo no hay qué cargar (cargando nació en false)
    let activo = true; // evito setState si la página ya se desmontó
    (async () => {
      try {
        const [miPerfil, misPedidos] = await Promise.all([api.miPerfil(), api.misPedidos()]);
        if (!activo) return;
        setPerfil(miPerfil);
        setPedidos(misPedidos ?? []);
      } catch (problema) {
        if (!activo) return;
        setMensaje({
          tipo: "fallo",
          texto: problema instanceof Error ? problema.message : "No se pudo cargar tu información.",
        });
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [demoLocal]);

  const abrirBloque = (nombre: "correo" | "contrasena" | "direccion") => {
    setBloque(nombre);
    setMensaje(null);
    setPidiendoConfirmar(false);
    setPidiendoConfirmarClave(false);
    if (nombre === "correo") {
      setCorreoNuevo(perfil?.email ?? "");
      setClaveCorreo("");
      setEtapaCorreo("pedido");
      setCodigoCorreo("");
    }
    if (nombre === "contrasena") {
      setClaveActual("");
      setClaveNueva("");
      setClaveConfirmar("");
    }
    if (nombre === "direccion") {
      setDireccionNueva(perfil?.direccion ?? "");
      setRegionNueva(perfil?.region ?? "");
      setComunaNueva(perfil?.comuna ?? "");
    }
  };

  // ---------- cambiar correo: paso 1 (contraseña actual + pedir código al correo nuevo) ----------
  const handleSolicitarCorreo = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const errorCorreo = validarCorreo(correoNuevo);
    if (errorCorreo) {
      setMensaje({ tipo: "fallo", texto: errorCorreo });
      return;
    }
    if (!claveCorreo) {
      setMensaje({
        tipo: "fallo",
        texto: "Escribe tu contraseña ACTUAL: es la prueba de que eres tú quien cambia el correo.",
      });
      return;
    }
    setEnviando(true);
    try {
      await api.solicitarCambioCorreo(correoNuevo.trim(), claveCorreo);
      setMensaje({
        tipo: "exito",
        texto: `Identidad verificada ✔ y te mandamos un código a ${correoNuevo.trim()}. Escríbelo acá para confirmar el cambio (tu correo actual sigue funcionando).`,
      });
      setEtapaCorreo("codigo");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo pedir el código." });
    } finally {
      setEnviando(false);
    }
  };

  // paso 2: confirmo el código que llegó al correo NUEVO
  const handleConfirmarCorreo = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!codigoCorreo.trim()) {
      setMensaje({ tipo: "fallo", texto: "Escribe el código que te llegó al correo nuevo." });
      return;
    }
    setEnviando(true);
    try {
      await api.confirmarCambioCorreo(correoNuevo.trim(), codigoCorreo.trim());
      // actualizo el perfil que se ve en pantalla con el correo oficial nuevo
      setPerfil((anterior) => (anterior ? { ...anterior, email: correoNuevo.trim() } : anterior));
      setMensaje({ tipo: "exito", texto: "¡Correo actualizado! La próxima vez ingresa con el correo nuevo." });
      setBloque("ninguno");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo confirmar el cambio." });
    } finally {
      setEnviando(false);
    }
  };

  // ---------- cambiar contraseña (paso 1: revisar datos; paso 2: "¿Confirmas el cambio?") ----------
  const handleRevisarContrasena = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const errores = {
      actual: claveActual ? "" : "Escribe tu contraseña actual.",
      nueva: validarPassword(claveNueva),
      repetida: claveConfirmar === claveNueva ? "" : "Las contraseñas no coinciden.",
    };
    if (hayErrores(errores)) {
      setMensaje({ tipo: "fallo", texto: errores.actual || errores.nueva || errores.repetida });
      return;
    }
    // nada se cambia todavía: pido la confirmación en pantalla antes de ejecutar
    setMensaje({ tipo: "exito", texto: "Datos revisados ✔. Confirma abajo para ejecutar el cambio." });
    setPidiendoConfirmarClave(true);
  };

  const guardarContrasena = async () => {
    setEnviando(true);
    try {
      await api.cambiarContrasena(claveActual, claveNueva);
      setMensaje({
        tipo: "exito",
        texto: "¡Contraseña cambiada! Guárdala bien: la usarás en tu próximo inicio de sesión.",
      });
      setBloque("ninguno");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo cambiar la contraseña." });
      setPidiendoConfirmarClave(false);
    } finally {
      setEnviando(false);
    }
  };

  // ---------- cambiar dirección + región + comuna (confirmación previa: "¿Seguro?") ----------
  // "Siguiente" revisa que todo llegue bien; recién "Sí, guardar" manda la llamada
  const handleSiguienteDireccion = () => {
    const fallo =
      !direccionNueva.trim() ? "La dirección no puede quedar vacía." :
      !regionNueva ? "Selecciona tu región." :
      !comunaNueva ? "Selecciona tu comuna." : "";
    if (fallo) {
      setMensaje({ tipo: "fallo", texto: fallo });
      setPidiendoConfirmar(false);
      return;
    }
    setMensaje({ tipo: "exito", texto: "Ubicación revisada ✔. Confirma abajo para aplicar el cambio." });
    setPidiendoConfirmar(true);
  };

  const guardarDireccion = async () => {
    setEnviando(true);
    try {
      const perfilActualizado = await api.actualizarDireccion({
        direccion: direccionNueva.trim(),
        region: regionNueva.trim(),
        comuna: comunaNueva.trim(),
      });
      setPerfil(perfilActualizado);
      setMensaje({ tipo: "exito", texto: "¡Ubicación actualizada! Tus futuros pedidos usarán esta dirección." });
      setBloque("ninguno");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo actualizar la ubicación." });
      setPidiendoConfirmar(false);
    } finally {
      setEnviando(false);
    }
  };

  // ---------- pantallas ----------
  if (demoLocal) {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle subtitulo="Este apartado todavía no está disponible. Ya volvemos.">
          Mi cuenta
        </PageTitle>
        {sesion && (
          <div className="panel p-6">
            <p className="font-bold">Hola, {sesion.nombre}</p>
            <p className="mt-2 text-sm">
              No pudimos cargar tu información ahora. Vuelve a abrir Mi cuenta en un rato.
            </p>
          </div>
        )}
      </div>
    );
  }

  const ultimaCompra = pedidos[0] ?? null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle subtitulo={perfil ? `Conectada/o como ${perfil.email}` : undefined}>Mi cuenta</PageTitle>
      <Mensaje mensaje={mensaje} />
      {cargando && <p className="panel p-4 text-sm font-semibold">Cargando tu información…</p>}

      {!cargando && (
        <>
          {/* ---------- última compra ---------- */}
          <section className="panel p-6">
            <h3 className="mb-3 text-lg font-extrabold text-rosa-500">Mi última compra</h3>
            {ultimaCompra ? (
              <div>
                <p className="mb-1 text-sm">
                  <span className="font-bold">Fecha:</span> {formatearFecha(ultimaCompra.fecha)}
                </p>
                <p className="mb-3 text-sm">
                  <span className="font-bold">Estado:</span> {ultimaCompra.estado}
                </p>
                <p className="mb-1 font-bold">Detalle:</p>
                <ul className="mb-3 ml-5 list-disc">
                  {ultimaCompra.lineas.map((linea) => (
                    <li key={linea.codigoProducto} className="text-sm">
                      {linea.nombre} × {linea.cantidad} — {formatearPrecio(linea.precioUnitario)} c/u
                    </li>
                  ))}
                </ul>
                <p className="font-extrabold">Total: {formatearPrecio(ultimaCompra.total)}</p>
              </div>
            ) : (
              <p className="text-sm">
                Aún no has hecho compras en la tienda. Cuando pidas algo, tu compra más reciente aparecerá acá.
              </p>
            )}
          </section>

          {/* ---------- mis datos ---------- */}
          <section className="panel mt-6 p-6">
            <h3 className="mb-3 text-lg font-extrabold text-rosa-500">Mis datos</h3>
            {perfil && (
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <p className="text-sm"><span className="font-bold">Nombre:</span> {perfil.nombre}</p>
                <p className="text-sm"><span className="font-bold">Correo:</span> {perfil.email}</p>
                <p className="text-sm"><span className="font-bold">RUN:</span> {perfil.run || "—"}</p>
                <p className="text-sm"><span className="font-bold">Nacimiento:</span> {perfil.fechaNacimiento ? formatearFechaNacimiento(perfil.fechaNacimiento) : "—"}</p>
                <p className="text-sm"><span className="font-bold">Región:</span> {perfil.region || "—"}</p>
                <p className="text-sm"><span className="font-bold">Comuna:</span> {perfil.comuna || "—"}</p>
                <p className="text-sm sm:col-span-2">
                  <span className="font-bold">Dirección:</span> {perfil.direccion || "—"}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={bloque === "correo" ? "boton" : "boton-suave"} onClick={() => abrirBloque("correo")}>
                Cambiar correo
              </button>
              <button type="button" className={bloque === "contrasena" ? "boton" : "boton-suave"} onClick={() => abrirBloque("contrasena")}>
                Cambiar contraseña
              </button>
              <button type="button" className={bloque === "direccion" ? "boton" : "boton-suave"} onClick={() => abrirBloque("direccion")}>
                Cambiar dirección
              </button>
            </div>

            {/* --- correo: contraseña ACTUAL (prueba de identidad) + código al correo NUEVO --- */}
            {bloque === "correo" && (
              <div className="mt-4 border-t border-ciruela/20 pt-4">
                {etapaCorreo === "pedido" ? (
                  <form onSubmit={handleSolicitarCorreo} noValidate>
                    <Field
                      id="cuenta-clave-identidad" label="Tu contraseña actual" type="password" value={claveCorreo}
                      onChange={setClaveCorreo} maxLength={64} autoComplete="current-password"
                      ayuda="La comparamos con la que registraste: es la prueba de que eres TÚ quien pide el cambio."
                    />
                    <Field
                      id="cuenta-correo-nuevo" label="Correo nuevo" type="email" value={correoNuevo}
                      onChange={setCorreoNuevo} maxLength={100} autoComplete="email"
                      ayuda="Te enviamos un código de confirmación a este correo. Hasta confirmarlo, tu correo actual sigue funcionando."
                    />
                    <button type="submit" className="boton" disabled={enviando}>
                      {enviando ? "Verificando…" : "Verificar y pedir código"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmarCorreo} noValidate>
                    <Field
                      id="cuenta-correo-codigo" label="Código de confirmación" value={codigoCorreo}
                      onChange={setCodigoCorreo} maxLength={10} placeholder="XXXXXX"
                      ayuda={`Revisa el correo ${correoNuevo} (también en spam).`}
                    />
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="boton" disabled={enviando}>
                        {enviando ? "Confirmando…" : "Confirmar cambio"}
                      </button>
                      <button type="button" className="boton-suave" onClick={() => { setEtapaCorreo("pedido"); setMensaje(null); }}>
                        Volver
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* --- contraseña: revisar -> confirmar -> ejecutar --- */}
            {bloque === "contrasena" && (
              <form onSubmit={handleRevisarContrasena} noValidate className="mt-4 border-t border-ciruela/20 pt-4">
                <Field
                  id="cuenta-clave-actual" label="Contraseña actual" type="password" value={claveActual}
                  onChange={setClaveActual} maxLength={64} autoComplete="current-password"
                  ayuda="Necesitamos tu contraseña actual para comprobar que la cuenta es tuya."
                />
                <Field
                  id="cuenta-clave-nueva" label="Contraseña nueva" type="password" value={claveNueva}
                  onChange={setClaveNueva} maxLength={64} autoComplete="new-password"
                  ayuda="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (ej: Clave1234#)."
                />
                <Field
                  id="cuenta-clave-confirmar" label="Confirmar contraseña nueva" type="password" value={claveConfirmar}
                  onChange={setClaveConfirmar} maxLength={64} autoComplete="new-password"
                  ayuda="Escríbela otra vez igual."
                />

                {pidiendoConfirmarClave ? (
                  <div className="rounded-2xl border border-rosa-400 bg-rose-50 p-3">
                    <p className="mb-3 text-sm font-bold">
                      ¿Confirmas cambiar tu contraseña? Primero comprobamos tu contraseña actual.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="boton" disabled={enviando} onClick={guardarContrasena}>
                        {enviando ? "Guardando…" : "Sí, cambiar contraseña"}
                      </button>
                      <button type="button" className="boton-suave" onClick={() => { setPidiendoConfirmarClave(false); setMensaje(null); }}>
                        No, seguir editando
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="submit" className="boton" disabled={enviando}>
                    {enviando ? "Revisando…" : "Siguiente"}
                  </button>
                )}
              </form>
            )}

            {/* --- dirección + región + comuna: revisar -> confirmar -> ejecutar --- */}
            {bloque === "direccion" && (
              <div className="mt-4 border-t border-ciruela/20 pt-4">
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Field
                    id="cuenta-region-nueva" label="Región" value={regionNueva}
                    onChange={(valor) => { setRegionNueva(valor); setComunaNueva(""); }}
                    opciones={regiones} textoOpcionVacia="Selecciona una región"
                  />
                  <Field
                    id="cuenta-comuna-nueva" label="Comuna" value={comunaNueva} onChange={setComunaNueva}
                    opciones={(comunasPorRegion[regionNueva] ?? []).map((c) => ({ valor: c, etiqueta: c }))}
                    textoOpcionVacia={regionNueva ? "Selecciona una comuna" : "Primero elige una región"}
                    deshabilitado={!regionNueva}
                  />
                </div>
                <Field
                  id="cuenta-direccion-nueva" label="Dirección" value={direccionNueva}
                  onChange={setDireccionNueva} maxLength={150} autoComplete="street-address"
                />

                {pidiendoConfirmar ? (
                  <div className="rounded-2xl border border-rosa-400 bg-rose-50 p-3">
                    <p className="mb-3 text-sm font-bold">
                      ¿Confirmas cambiar tu ubicación a “{direccionNueva.trim()}” ({comunaNueva}, {regionNueva})?
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="boton" disabled={enviando} onClick={guardarDireccion}>
                        {enviando ? "Guardando…" : "Sí, guardar"}
                      </button>
                      <button type="button" className="boton-suave" onClick={() => setPidiendoConfirmar(false)}>
                        No, seguir editando
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="boton" onClick={handleSiguienteDireccion}>
                    Siguiente
                  </button>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Cuenta;
