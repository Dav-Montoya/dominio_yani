// PÁGINA: REGISTRO (ruta "/register")  <- mi registro.html de antes
// Qué hace:
//  - ESTILO fs2-WEB: el formulario crea la cuenta en el backend (fs2-api → Cognito);
//    el backend valida la política de contraseñas de Cognito y, si el User Pool pide
//    verificación, muestro el paso del código que llega al correo.
//  - El navegador NUNCA se conecta directo a AWS Cognito: eso queda del lado del backend.
//  - MODO LOCAL (sin .env): deja la cuenta en LocalStorage como la demo de antes.
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import Field from "../../components/field/Field";
import Mensaje, { type MensajeForm } from "../../components/mensaje/Mensaje";
import PageTitle from "../../components/page-title/PageTitle";
import { entorno } from "../../config/entorno";
import api, { type RegisterCredentials } from "../../services/api";
import { comunasPorRegion, regiones } from "../../data/regiones";
import { formatearRun, validarRun } from "../../utils/run";
import { anotarCuentaCreada, registrarUsuario } from "../../utils/storage";
import {
  hayErrores, validarApellidos, validarCorreo, validarDireccion, validarNacimiento, validarNombre,
  validarPassword, validarSeleccion,
} from "../../utils/validators";

const vacio = {
  run: "", nombre: "", apellidos: "", correo: "", clave: "", confirmarClave: "", fechaNacimiento: "",
  tipoUsuario: "", region: "", comuna: "", direccion: "",
};

const tiposUsuario = [
  { valor: "cliente", etiqueta: "Cliente" },
  { valor: "vendedor", etiqueta: "Vendedor / miembro de la comunidad" },
];

const Register = () => {
  // demo local solo si NO hay backend configurado
  const cognitoOff = !entorno.apiUrl;
  // irA("/login") manda a la persona directo al login cuando la cuenta quedó lista
  const [, irA] = useLocation();

  // flujo del punto 2 de las mejoras: la cuenta quedó creada Y confirmada ->
  // dejo anotado el correo (el login lo muestra en el recuadro de confirmación)
  // y voy directo al apartado de inicio de sesión.
  const cuentaListaIrAlLogin = (correo: string) => {
    anotarCuentaCreada(correo.trim().toLowerCase());
    irA("/login");
  };

  const [datos, setDatos] = useState(vacio);
  const [errores, setErrores] = useState(vacio); // mismos campos, pero con los textos de error
  const [mensaje, setMensaje] = useState<MensajeForm | null>(null);
  const [creada, setCreada] = useState(false); // para mostrar el link "Ir a iniciar sesión"
  const [enviando, setEnviando] = useState(false);
  // cuando el backend dice "necesita verificación", guardo el correo y muestro el paso del código
  const [verificar, setVerificar] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");

  // cambia solo UN campo y deja los demás igual. Se usa así: cambiar("correo")  ->  función que recibe el texto
  const cambiar = (campo: keyof typeof vacio) => (valor: string) =>
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));

  // el RUN lo formateo mientras escribo (pone los puntos y el guion solo)
  const cambiarRun = (valor: string) => cambiar("run")(formatearRun(valor));

  // cuando cambio de región, borro la comuna elegida porque ya no corresponde
  const cambiarRegion = (valor: string) => setDatos((anterior) => ({ ...anterior, region: valor, comuna: "" }));

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevos = {
      run: validarRun(datos.run) ? "" : "Ingresa un RUN válido (ej: 12.345.678-5).",
      nombre: validarNombre(datos.nombre),
      apellidos: validarApellidos(datos.apellidos),
      correo: validarCorreo(datos.correo),
      clave: validarPassword(datos.clave),
      confirmarClave: datos.confirmarClave === datos.clave ? "" : "Las contraseñas no coinciden.",
      fechaNacimiento: validarNacimiento(datos.fechaNacimiento),
      tipoUsuario: validarSeleccion(datos.tipoUsuario, "Selecciona un tipo de usuario."),
      region: validarSeleccion(datos.region, "Selecciona una región."),
      comuna: validarSeleccion(datos.comuna, "Selecciona una comuna."),
      direccion: validarDireccion(datos.direccion),
    };
    setErrores(nuevos);
    setCreada(false);

    if (hayErrores(nuevos)) {
      setMensaje({ tipo: "fallo", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    // demo local sin backend: queda en LocalStorage como antes
    if (cognitoOff) {
      const problema = registrarUsuario({
        run: datos.run, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(),
        correo: datos.correo.trim(), fechaNacimiento: datos.fechaNacimiento,
        tipoUsuario: datos.tipoUsuario, region: datos.region, comuna: datos.comuna,
        direccion: datos.direccion.trim(),
      });
      if (problema) {
        setMensaje({ tipo: "fallo", texto: problema });
        return;
      }
      // demo local: la cuenta ya quedó lista -> directo al login con el recuadro
      cuentaListaIrAlLogin(datos.correo);
      return;
    }

    setEnviando(true);
    try {
      const credenciales: RegisterCredentials = {
        email: datos.correo.trim(),
        password: datos.clave,
        // Cognito guarda un atributo "name": junto nombre + apellidos ahí
        nombre: `${datos.nombre.trim()} ${datos.apellidos.trim()}`.trim(),
        // el tipo de usuario se mapea a los grupos del backend
        roles: datos.tipoUsuario === "vendedor" ? ["VENDEDOR"] : ["CLIENTE"],
        run: datos.run.trim(),
        apellidos: datos.apellidos.trim(),
        fechaNacimiento: datos.fechaNacimiento,
        tipoUsuario: datos.tipoUsuario.trim(),
        region: datos.region.trim(),
        comuna: datos.comuna.trim(),
        direccion: datos.direccion.trim(),
      };
      const usuario = await api.register(credenciales);
      // si Cognito pidió verificación del email, paso al formulario del código
      if (usuario?.requiereVerificacion) {
        setVerificar(datos.correo.trim());
        setMensaje({ tipo: "exito", texto: "¡Cuenta creada! Te mandamos un código al correo para verificarla." });
        return;
      }
      setMensaje({ tipo: "exito", texto: "¡Cuenta creada con éxito! Ya puedes iniciar sesión." });
      setCreada(true);
      setDatos(vacio); // limpio el formulario
      // no hubo verificación pendiente: la cuenta ya está lista -> directo al login
      cuentaListaIrAlLogin(credenciales.email);
    } catch (problema) {
      setMensaje({
        tipo: "fallo",
        texto: problema instanceof Error ? problema.message : "No se pudo crear la cuenta. Intenta más tarde.",
      });
    } finally {
      setEnviando(false);
    }
  };

  // confirma con el código de verificación del correo de Cognito
  const handleVerificar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!codigo.trim()) {
      setMensaje({ tipo: "fallo", texto: "Escribe el código que te llegó al correo." });
      return;
    }
    setEnviando(true);
    try {
      await api.confirmarRegistro(verificar ?? datos.correo.trim(), codigo.trim());
      // el código confirmó la cuenta: acá también me voy directo al login con el recuadro
      cuentaListaIrAlLogin(verificar ?? datos.correo.trim());
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo verificar." });
    } finally {
      setEnviando(false);
    }
  };

  const handleReenviar = async () => {
    setEnviando(true);
    try {
      await api.reenviarCodigoConfirmacion(verificar ?? datos.correo.trim());
      setMensaje({ tipo: "exito", texto: "Te volvimos a mandar el código al correo." });
    } catch (problema) {
      setMensaje({ tipo: "fallo", texto: problema instanceof Error ? problema.message : "No se pudo reenviar." });
    } finally {
      setEnviando(false);
    }
  };

  // ---- vista de verificación (código al correo) ----
  if (verificar) {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle subtitulo={`Te mandamos un código a ${verificar} para verificar tu cuenta. Ingrésalo aquí.`}>
          Verificar cuenta
        </PageTitle>
        <Mensaje mensaje={mensaje} />
        <form onSubmit={handleVerificar} noValidate className="panel p-6">
          <Field
            id="verificar-codigo-registro" label="Código de verificación" value={codigo} onChange={setCodigo}
            maxLength={10} placeholder="XXXXXX"
            ayuda="Revisa tu correo (también en spam)."
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="boton" disabled={enviando}>
              {enviando ? "Verificando…" : "Verificar mi cuenta"}
            </button>
            <button type="button" onClick={handleReenviar} className="boton-suave" disabled={enviando}>
              Reenviar código
            </button>
            <button type="button" onClick={() => setVerificar(null)} className="boton-suave">
              Volver
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>Crear cuenta nueva</PageTitle>
      <Mensaje mensaje={mensaje} />

      <form onSubmit={handleSubmit} noValidate className="panel p-6">
        <Field
          id="registro-run" label="RUN" value={datos.run} onChange={cambiarRun} error={errores.run}
          placeholder="Ej: 19.011.022-K" maxLength={12}
          ayuda="Escribe solo números y la K: yo pongo los puntos y el guion."
        />
        {/* en pantallas medianas pongo nombre y apellidos lado a lado */}
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field id="registro-nombre" label="Nombre" value={datos.nombre} onChange={cambiar("nombre")} error={errores.nombre} maxLength={100} autoComplete="given-name" />
          <Field id="registro-apellidos" label="Apellidos" value={datos.apellidos} onChange={cambiar("apellidos")} error={errores.apellidos} maxLength={100} autoComplete="family-name" />
        </div>
        <Field id="registro-correo" label="Correo electrónico" type="email" value={datos.correo} onChange={cambiar("correo")} error={errores.correo} placeholder="nombre@duoc.cl" maxLength={100} autoComplete="email" />
        {/* la contraseña viaja al backend (Cognito): mínimo 8 con mayúscula, minúscula, número y símbolo */}
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field
            id="registro-clave" label="Contraseña" type="password" value={datos.clave} onChange={cambiar("clave")}
            error={errores.clave} maxLength={64} autoComplete="new-password"
            ayuda="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (ej: Clave1234#)."
          />
          <Field
            id="registro-confirmar" label="Confirmar contraseña" type="password" value={datos.confirmarClave}
            onChange={cambiar("confirmarClave")} error={errores.confirmarClave} maxLength={64}
            autoComplete="new-password" ayuda="Escríbela otra vez igual."
          />
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field id="registro-fecha" label="Fecha de nacimiento" type="date" value={datos.fechaNacimiento} onChange={cambiar("fechaNacimiento")} error={errores.fechaNacimiento} autoComplete="bday" />
          <Field id="registro-tipo" label="Tipo de usuario" value={datos.tipoUsuario} onChange={cambiar("tipoUsuario")} error={errores.tipoUsuario} opciones={tiposUsuario} />
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field id="registro-region" label="Región" value={datos.region} onChange={cambiarRegion} error={errores.region} opciones={regiones} textoOpcionVacia="Selecciona una región" />
          {/* las comunas dependen de la región: si no elegí región, la lista queda vacía y apagada */}
          <Field
            id="registro-comuna" label="Comuna" value={datos.comuna} onChange={cambiar("comuna")} error={errores.comuna}
            opciones={(comunasPorRegion[datos.region] ?? []).map((c) => ({ valor: c, etiqueta: c }))}
            textoOpcionVacia={datos.region ? "Selecciona una comuna" : "Primero elige una región"}
            deshabilitado={!datos.region}
          />
        </div>
        <Field id="registro-direccion" label="Dirección" value={datos.direccion} onChange={cambiar("direccion")} error={errores.direccion} maxLength={150} autoComplete="street-address" />

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? "Creando cuenta…" : "Crear cuenta"}
          </button>
          <p className="m-0 text-sm font-semibold">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-rosa-500 underline">
              {creada ? "Ir a iniciar sesión" : "Inicia sesión"}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
