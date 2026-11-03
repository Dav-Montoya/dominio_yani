// PÁGINA: INICIAR SESIÓN (ruta "/login")  <- mi login.html + login.js de antes
// ESTILO fs2-WEB: la gente entra SOLO con el formulario de correo/clave. Ese formulario
// habla con el backend fs2-api, y ES EL BACKEND quien valida contra AWS Cognito
// (el navegador nunca se conecta directo a Cognito: eso es asunto del desarrollador).
// Si Cognito pide verificación (USER_NOT_CONFIRMED) o hay clave temporal,
// este login muestra el paso extra. Sin backend, queda la demo local de antes.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import Field from "../../components/field/Field";
import Mensaje, { type MensajeForm } from "../../components/mensaje/Mensaje";
import PageTitle from "../../components/page-title/PageTitle";
import api, { type LoginCredentials } from "../../services/api";
import { entorno } from "../../config/entorno";
import { iniciarSesion } from "../../utils/auth";
import { guardarSesion, leerYBorrarCuentaCreada, type Sesion } from "../../utils/storage";
import { hayErrores, validarCorreo, validarPassword } from "../../utils/validators";

interface LoginProps {
  onLogin: (sesion: Sesion) => void; // función que viene de App.tsx (useSesion.iniciarLocal)
}

// arma mi Sesion (la misma del menú/carrito) desde el usuario del token del backend
const sesionDesdeApi = (correo: string): Sesion => {
  const usuario = api.getCurrentUser();
  const esAdmin = usuario?.roles?.some((r) => r.toLowerCase() === "admin") ?? false;
  return {
    nombre: usuario?.nombre?.trim() || correo.split("@")[0],
    correo,
    rol: esAdmin ? "Admin" : "Cliente",
  };
};

const Login = ({ onLogin }: LoginProps) => {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errores, setErrores] = useState({ correo: "", clave: "" });
  const [mensaje, setMensaje] = useState<MensajeForm | null>(null);
  const [enviando, setEnviando] = useState(false);
  // vista extra cuando el backend responde con algo más que tokens:
  // "nueva-clave" (clave temporal), "verificar" (cuenta sin confirmar con el código del correo)
  // y las dos del punto 1 de las mejoras: "olvide" (pedir el código) y "olvide-codigo" (código + clave nueva)
  const [vista, setVista] = useState<"normal" | "nueva-clave" | "verificar" | "olvide" | "olvide-codigo">("normal");
  const [sesionPendiente, setSesionPendiente] = useState<{ email: string; session?: string } | null>(null);
  // recuadro del punto 2: si llegué desde el registro con la cuenta recién creada,
  // el registro anotó el correo y acá lo muestro una sola vez
  const [cuentaCreada, setCuentaCreada] = useState<string | null>(null);
  const [, irA] = useLocation(); // irA("/") cambia de página desde el código
  // acá guardo el temporizador del redireccionamiento para poder cancelarlo si me voy de la página antes
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  useEffect(() => {
    // leo el aviso que dejó el registro (y lo borro), así el recuadro no reaparece al recargar
    const aviso = leerYBorrarCuentaCreada();
    if (aviso) setCuentaCreada(aviso.correo);
  }, []);

  // MODO LOCAL (demo): sin backend configurado, la sesión queda en el navegador
  const demoLocal = !entorno.apiUrl;

  const terminarSesion = (correoLimpio: string) => {
    const sesion = demoLocal
      ? iniciarSesion(correoLimpio, clave)
      : sesionDesdeApi(correoLimpio);
    guardarSesion(sesion);
    onLogin(sesion); // le aviso a App.tsx quién entró
    setMensaje({
      tipo: "exito",
      texto: sesion.rol === "Admin" ? "¡Bienvenida/o administrador/a!" : "¡Bienvenida/o a Secret Sweet Maid!",
    });
    temporizador.current = setTimeout(() => irA("/"), 900); // espero un poquito para que se alcance a leer el mensaje
  };

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); // frena el envío normal del navegador
    const nuevos = { correo: validarCorreo(correo), clave: clave ? "" : "La contraseña es obligatoria." };
    setErrores(nuevos);

    if (hayErrores(nuevos)) {
      setMensaje({ tipo: "fallo", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    // demo local sin backend: entra directo
    if (demoLocal) {
      terminarSesion(correo.trim());
      return;
    }

    setEnviando(true);
    setMensaje(null);
    try {
      const credenciales: LoginCredentials = { email: correo.trim(), password: clave };
      const resultado = await api.login(credenciales);

      if (resultado.challengeName === "NEW_PASSWORD_REQUIRED") {
        setSesionPendiente({ email: correo.trim(), session: resultado.session });
        setVista("nueva-clave");
        return;
      }

      terminarSesion(correo.trim());
    } catch (problema) {
      // si la cuenta no está verificada, muestro el paso del código que Cognito mandó al correo
      if (problema instanceof Error && problema.message.toLowerCase().includes("sin verificar")) {
        setSesionPendiente({ email: correo.trim() });
        setVista("verificar");
        return;
      }
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo iniciar sesión." });
    } finally {
      setEnviando(false);
    }
  };

  // activa la cuenta con el código de verificación del correo de Cognito
  const handleVerificar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!codigo.trim()) {
      setMensaje({ tipo: "fallo", texto: "Escribe el código que te llegó al correo." });
      return;
    }
    setEnviando(true);
    try {
      await api.confirmarRegistro(sesionPendiente?.email ?? correo.trim(), codigo.trim());
      setMensaje({ tipo: "exito", texto: "¡Cuenta verificada! Ahora inicia sesión con tu clave." });
      setVista("normal");
      setCodigo("");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo verificar." });
    } finally {
      setEnviando(false);
    }
  };

  // pide otra vez el código (cuando no llegó o expiró)
  const handleReenviar = async () => {
    setEnviando(true);
    try {
      await api.reenviarCodigoConfirmacion(sesionPendiente?.email ?? correo.trim());
      setMensaje({ tipo: "exito", texto: "Te volvimos a mandar el código al correo." });
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo reenviar." });
    } finally {
      setEnviando(false);
    }
  };

  // completa el cambio de contraseña obligatorio y deja la sesión lista
  const handleNuevaClave = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const errorClave = validarPassword(claveNueva);
    if (errorClave) {
      setMensaje({ tipo: "fallo", texto: errorClave });
      return;
    }
    setEnviando(true);
    try {
      await api.completarNuevaContrasena(sesionPendiente?.email ?? correo.trim(), sesionPendiente?.session, claveNueva);
      terminarSesion(sesionPendiente?.email ?? correo.trim());
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo activar la cuenta." });
    } finally {
      setEnviando(false);
    }
  };

  // ---------- OLVIDÉ MI CONTRASEÑA (punto 1 de las mejoras) ----------
  // paso 1: pido el código de recuperación con el correo de la cuenta
  const handleOlvide = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const errorCorreo = validarCorreo(correo);
    setErrores({ correo: errorCorreo, clave: "" });
    if (errorCorreo) {
      setMensaje({ tipo: "fallo", texto: "Escribe el correo de tu cuenta para enviarte el código." });
      return;
    }
    if (demoLocal) {
      setMensaje({
        tipo: "fallo",
        texto: "No pudimos enviar el código ahora. Ya volvemos: inténtalo más tarde.",
      });
      return;
    }
    setEnviando(true);
    try {
      await api.solicitarRecuperacionContrasena(correo.trim());
      setMensaje({ tipo: "exito", texto: "Te mandamos un código de recuperación al correo. Escríbelo junto a tu clave nueva." });
      setVista("olvide-codigo");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo enviar el código." });
    } finally {
      setEnviando(false);
    }
  };

  // paso 2: confirmo el código + la contraseña nueva (misma política que al registrarse)
  const handleOlvideConfirmar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!codigo.trim()) {
      setMensaje({ tipo: "fallo", texto: "Escribe el código que te llegó al correo." });
      return;
    }
    const errorClave = validarPassword(claveNueva);
    if (errorClave) {
      setMensaje({ tipo: "fallo", texto: errorClave });
      return;
    }
    setEnviando(true);
    try {
      await api.confirmarRecuperacionContrasena(correo.trim(), codigo.trim(), claveNueva);
      setMensaje({ tipo: "exito", texto: "¡Contraseña actualizada! Ahora inicia sesión con tu clave nueva." });
      setVista("normal");
      setCodigo("");
      setClaveNueva("");
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo cambiar la contraseña." });
    } finally {
      setEnviando(false);
    }
  };

  // ---- vista de verificación (código al correo) ----
  if (vista === "verificar") {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle subtitulo="Te mandamos un código al correo. Ingrésalo aquí para activar tu cuenta.">
          Verificar cuenta
        </PageTitle>
        <Mensaje mensaje={mensaje} />
        <form onSubmit={handleVerificar} noValidate className="panel p-6">
          <Field
            id="verificar-codigo" label="Código de verificación" value={codigo} onChange={setCodigo}
            maxLength={10} placeholder="XXXXXX"
            ayuda="Revisa tu correo (también en spam). Te enviamos el código al momento de registrarte."
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="boton" disabled={enviando}>
              {enviando ? "Verificando…" : "Verificar mi cuenta"}
            </button>
            <button type="button" onClick={handleReenviar} className="boton-suave" disabled={enviando}>
              Reenviar código
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---- vista de contraseña nueva (cuenta con clave temporal) ----
  if (vista === "nueva-clave") {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle subtitulo="Tu cuenta usa una contraseña temporal. Crea tu contraseña nueva para activar tu sesión.">
          Nueva contraseña
        </PageTitle>
        <Mensaje mensaje={mensaje} />
        <form onSubmit={handleNuevaClave} noValidate className="panel p-6">
          <Field
            id="login-clave-nueva" label="Contraseña nueva" type="password" value={claveNueva}
            onChange={setClaveNueva} autoComplete="new-password" maxLength={64}
            ayuda="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (ej: Clave1234#)."
          />
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? "Activando…" : "Guardar y entrar"}
          </button>
        </form>
      </div>
    );
  }

  // ---- vista del olvido, paso 1: pido el correo para mandar el código ----
  if (vista === "olvide") {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle subtitulo="Escribe el correo de tu cuenta y te mandamos un código para crear tu contraseña nueva.">
          Olvidé mi contraseña
        </PageTitle>
        <Mensaje mensaje={mensaje} />
        <form onSubmit={handleOlvide} noValidate className="panel p-6">
          <Field
            id="olvide-correo" label="Correo electrónico de tu cuenta" type="email" value={correo}
            onChange={setCorreo} error={errores.correo} placeholder="nombre@duoc.cl" autoComplete="email" maxLength={100}
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="boton" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar código"}
            </button>
            <button
              type="button" className="boton-suave"
              onClick={() => { setVista("normal"); setMensaje(null); }}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---- vista del olvido, paso 2: código + contraseña nueva ----
  if (vista === "olvide-codigo") {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle subtitulo="Escribe el código que te llegó al correo y tu contraseña nueva (misma política del registro).">
          Crear contraseña nueva
        </PageTitle>
        <Mensaje mensaje={mensaje} />
        <form onSubmit={handleOlvideConfirmar} noValidate className="panel p-6">
          <Field
            id="olvide-codigo" label="Código de recuperación" value={codigo} onChange={setCodigo}
            maxLength={10} placeholder="XXXXXX"
            ayuda="Revisa tu correo (también en spam). El código confirma que la cuenta es tuya."
          />
          <Field
            id="olvide-clave-nueva" label="Contraseña nueva" type="password" value={claveNueva}
            onChange={setClaveNueva} autoComplete="new-password" maxLength={64}
            ayuda="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (ej: Clave1234#)."
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="boton" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar contraseña"}
            </button>
            <button
              type="button" className="boton-suave"
              onClick={() => { setVista("normal"); setMensaje(null); }}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---- vista normal ----
  return (
    <div className="mx-auto max-w-xl">
      <PageTitle>Iniciar sesión</PageTitle>

      {/* recuadro del punto 2: el registro me mandó acá con la cuenta recién creada/confirmada */}
      {cuentaCreada && (
        <div role="status" className="mb-4 rounded-2xl border border-emerald-600 bg-emerald-50 p-4 text-emerald-800">
          <p className="text-sm font-extrabold">✅ ¡Cuenta creada con éxito!</p>
          <p className="text-sm">
            La cuenta <span className="font-extrabold">{cuentaCreada}</span> ya quedó registrada y confirmada.{" "}
            Inicia sesión con tu contraseña para entrar.
          </p>
        </div>
      )}

      <Mensaje mensaje={mensaje} />

      <form onSubmit={handleSubmit} noValidate className="panel p-6">
        <Field
          id="login-correo" label="Correo electrónico" type="email" value={correo} onChange={setCorreo}
          error={errores.correo} placeholder="nombre@duoc.cl" autoComplete="email" maxLength={100}
        />
        <Field
          id="login-clave" label="Contraseña" type="password" value={clave} onChange={setClave}
          error={errores.clave} autoComplete="current-password" maxLength={64}
        />
        {/* C_textos/botones: "Ingresar" junto a "¿Olvidaste tu contraseña?", separados con el hueco (gap) */}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? "Entrando…" : "Ingresar"}
          </button>
          <button
            type="button"
            className="text-sm font-bold text-rosa-500 underline"
            onClick={() => { setVista("olvide"); setMensaje(null); }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>

      <p className="mt-4 font-semibold">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-rosa-500 underline">
          Regístrate aquí
        </Link>
        .
      </p>
    </div>
  );
};

export default Login;
