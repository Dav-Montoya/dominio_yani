// api.ts: "mensajero" entre mi tienda y el backend (fs2-api).
// El login/register/contraseña ESTÁN comprobados contra el backend (Cognito vía proxy):
//  - register crea la cuenta en Cognito y guarda el perfil en su base; si el User Pool
//    pide verificación, responde requiereVerificacion y el frontend pide el código.
//  - login valida contra Cognito; con clave temporal responde el desafío NEW_PASSWORD_REQUIRED.
//  - confirmar-registro/reenviar-codigo: verifican la cuenta con el código que Cognito manda al correo.
import { entorno } from "../config/entorno";

// si no hay VITE_API_URL uso la misma dirección que traía la rama (localhost:8080)
const BASE = entorno.apiUrl || "http://localhost:8080/api";

// dirección del backend: la reutilizan los demás servicios (productos, pedidos, contacto)
export const baseApi = (): string => BASE;
const CLAVE_TOKEN = "auth_token"; // misma clave que usaba la rama
const CLAVE_ID_TOKEN = "auth_id_token"; // el idToken de Cognito (perfil con email y grupos)

export interface User {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  requiereVerificacion?: boolean; // true cuando Cognito pide verificación del email
}

export interface AuthResponse {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  challengeName?: string; // NEW_PASSWORD_REQUIRED cuando la cuenta usa clave temporal
  session?: string; // lo que hay que devolver para completar el desafío
}

// forma de respuesta que esperaba la rama: { success, data, message }
interface RespuestaApi<T> {
  success: boolean;
  data: T;
  message?: string;
  mensaje?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  nombre: string;
  roles: string[];
  // perfil de la tienda que el backend guarda junto a la cuenta
  run?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  tipoUsuario?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
}

// mi cuenta: los datos que devuelve el backend (GET /api/usuarios/mi)
export interface Perfil {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  run?: string | null;
  apellidos?: string | null;
  fechaNacimiento?: string | null;
  tipoUsuario?: string | null;
  region?: string | null;
  comuna?: string | null;
  direccion?: string | null;
}

// mi cuenta: una línea de la compra (qué producto, cuánto cuesta cada uno y cuántos)
export interface LineaPedido {
  codigoProducto: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

// mi cuenta: la compra completa (fecha ISO, estado, total y sus líneas)
export interface PedidoDetalle {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  lineas: LineaPedido[];
}

interface RespuestaError {
  error?: string;
  mensaje?: string;
  message?: string;
}

// error del backend con su código (ej: USER_NOT_CONFIRMED) para que las páginas
// sepan qué pantalla mostrar (como el formulario de verificación de la cuenta)
export class ApiError extends Error {
  codigo: string;
  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}

// ---------- token (guardado en LocalStorage, con try/catch por si el navegador lo bloquea) ----------
export const guardarToken = (token: string): void => {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    /* si no se puede guardar, no pasa nada grave */
  }
};

export const borrarToken = (): void => {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_ID_TOKEN);
  } catch {
    /* igual que arriba */
  }
};

// el idToken lo manda el login del backend (Cognito): es el que trae email/name/cognito:groups
export const guardarIdToken = (token: string): void => {
  try {
    localStorage.setItem(CLAVE_ID_TOKEN, token);
  } catch {
    /* silencio: es solo para leer el perfil */
  }
};

// un JWT siempre tiene 3 partes separadas por puntos; si no, lo descarto
const leerToken = (): string | null => {
  try {
    const token = localStorage.getItem(CLAVE_TOKEN);
    if (!token) return null;
    if (token.split(".").length !== 3) {
      borrarToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

const encabezados = (): HeadersInit => {
  const token = leerToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

export const headersApi = encabezados;

// cuando el navegador no logra enviar la nada (sin internet, servidor caído,
// api gateway sin ruta...) fetch lanza su error crudo "Failed to fetch" en
// inglés. Acá lo traduzco una única vez a el único mensaje amigable de la tienda,
// y todas las funciones de servicios lo usan para no mostrar texto técnico.
export const envolverErrorRed = (): never => {
  throw new ApiError(
    "SIN_CONEXION",
    "No pudimos comunicarnos con la tienda. Revisa tu acceso a internet o inténtalo en un momento.",
  );
};

// función central: todas las llamadas pasan por acá, así reviso los errores una sola vez
// (en la rama original, register() no revisaba si la respuesta venía con error)
const pedir = async <T,>(ruta: string, init: RequestInit = {}): Promise<T> => {
  const respuesta = await fetch(`${BASE}${ruta}`, { ...init, headers: encabezados() }).catch(envolverErrorRed);
  let cuerpo: RespuestaApi<T> | null = null;
  try {
    cuerpo = (await respuesta.json()) as RespuestaApi<T>;
  } catch {
    /* si no vino JSON, sigo con cuerpo = null */
  }
  if (!respuesta.ok || cuerpo?.success === false) {
    const err = cuerpo as unknown as RespuestaError | null;
    throw new ApiError(err?.error ?? "ERROR", err?.message || err?.mensaje || "No pudimos completar tu solicitud. Inténtalo de nuevo.");
  }
  return cuerpo?.data as T;
};

// el payload del JWT viene en base64url (con - y _), por eso lo convierto antes de usar atob
const decodificarPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const api = {
  // si Cognito responde con un desafío (clave temporal), devuelve el cuerpo con
  // challengeName/session y SIN guardar token: el frontend pide la clave nueva
  async login(credenciales: LoginCredentials): Promise<AuthResponse> {
    const datos = await pedir<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(credenciales) });
    if (datos?.challengeName) return datos; // desafío: still no tokens
    if (!datos?.accessToken) throw new ApiError("LOGIN_SIN_TOKENS", "No se pudo iniciar sesión");
    guardarToken(datos.accessToken);
    // guardo también el idToken: es el que trae email, name y cognito:groups
    if (datos.idToken) guardarIdToken(datos.idToken);
    return datos;
  },

  // completa el cambio de contraseña obligatorio (desafío NEW_PASSWORD_REQUIRED)
  async completarNuevaContrasena(email: string, session: string | undefined, nuevaContrasena: string): Promise<AuthResponse> {
    const datos = await pedir<AuthResponse>("/auth/nueva-contrasena", {
      method: "POST",
      body: JSON.stringify({ email, session, nuevaContrasena }),
    });
    if (!datos?.accessToken) throw new ApiError("ACTIVACION_FALLIDA", "No se pudo activar la cuenta");
    guardarToken(datos.accessToken);
    if (datos.idToken) guardarIdToken(datos.idToken);
    return datos;
  },

  // confirma la cuenta con el código de verificación que Cognito manda al correo
  async confirmarRegistro(email: string, codigo: string): Promise<void> {
    await pedir<void>("/auth/confirmar-registro", {
      method: "POST",
      body: JSON.stringify({ email, codigo }),
    });
  },

  // pide otra vez el código de verificación (para cuando no llegó o expiró)
  async reenviarCodigoConfirmacion(email: string): Promise<void> {
    await pedir<void>("/auth/reenviar-codigo", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // ---------- OLVIDÉ MI CONTRASEÑA (2 pasos, el código llega al correo) ----------
  // paso 1: pide el código de recuperación al correo de la cuenta
  async solicitarRecuperacionContrasena(email: string): Promise<void> {
    await pedir<void>("/auth/olvide-contrasena/solicitar", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // paso 2: confirma el código + la contraseña nueva (misma política del registro)
  async confirmarRecuperacionContrasena(email: string, codigo: string, nuevaContrasena: string): Promise<void> {
    await pedir<void>("/auth/olvide-contrasena/confirmar", {
      method: "POST",
      body: JSON.stringify({ email, codigo, nuevaContrasena }),
    });
  },

  // ---------- MI CUENTA (apartado propio del usuario con sesión) ----------
  // mi perfil: corre, nombre, run, región/comuna, dirección, etc.
  miPerfil: () => pedir<Perfil>("/usuarios/mi"),

  // cambia dirección (+ región y comuna opcionales) del perfil (el backend lo guarda en su base)
  actualizarDireccion: (datos: { direccion: string; region?: string; comuna?: string }) =>
    pedir<Perfil>("/usuarios/direccion", { method: "PATCH", body: JSON.stringify(datos) }),

  // cambia la contraseña: Cognito pide la ACTUAL y valida la nueva con su política
  cambiarContrasena: (contrasenaActual: string, nuevaContrasena: string) =>
    pedir<void>("/usuarios/cambiar-contrasena", {
      method: "POST",
      body: JSON.stringify({ contrasenaActual, nuevaContrasena }),
    }),

  // cambio de correo PASO 1: pidimos la CONTRASEÑA ACTUAL (el backend la valida en
  // Cognito para comprobar que eres tú) y después Cognito manda un código al correo NUEVO
  // (si el User Pool no lo permite, el backend avisa con error)
  solicitarCambioCorreo: (nuevoCorreo: string, contrasenaActual: string) =>
    pedir<void>("/usuarios/cambiar-correo/solicitar", {
      method: "POST",
      body: JSON.stringify({ nuevoCorreo, contrasenaActual }),
    }),

  // cambio de correo PASO 2: confirmo el código y el correo queda cambiado
  confirmarCambioCorreo: (nuevoCorreo: string, codigo: string) =>
    pedir<void>("/usuarios/cambiar-correo/confirmar", {
      method: "POST",
      body: JSON.stringify({ nuevoCorreo, codigo }),
    }),

  // mis compras (el backend las ordena de la más reciente a la más antigua):
  // la primera de la lista es la "última compra" para Mi cuenta
  misPedidos: () => pedir<PedidoDetalle[]>("/pedidos/mios"),

  register: (credenciales: RegisterCredentials) =>
    pedir<User>("/auth/registro", { method: "POST", body: JSON.stringify(credenciales) }),

  async logout(): Promise<void> {
    try {
      await pedir<unknown>("/auth/logout", { method: "POST" });
    } finally {
      borrarToken(); // aunque el servidor falle, igual borro el token de este navegador
    }
  },

  // me dice si el servidor responde (/health). OJO: solo prueba que el servidor está vivo, no que la sesión sea válida
  async estaDisponible(): Promise<boolean> {
    try {
      const respuesta = await fetch(`${BASE}/health`, { headers: encabezados() }).catch(envolverErrorRed);
      return respuesta.ok;
    } catch {
      return false;
    }
  },

  // saco los datos de la persona desde el token guardado (sin preguntarle al servidor).
  // Prefiero el idToken (tráe email, name y cognito:groups); si no, caigo al accessToken.
  getCurrentUser(): User | null {
    const token = leerIdToken() || leerToken();
    const payload = token ? decodificarPayload(token) : null;
    if (!payload) return null;
    const username = typeof payload.username === "string" ? payload.username : "";
    return {
      id: String(payload.sub ?? ""),
      email: String(payload.email ?? (username.includes("@") ? username : "")),
      nombre: String(payload.name ?? ""),
      roles: Array.isArray(payload["cognito:groups"])
        ? (payload["cognito:groups"] as string[])
        : Array.isArray(payload.roles)
          ? (payload.roles as string[])
          : [],
    };
  },
};

const leerIdToken = (): string | null => {
  try {
    const token = localStorage.getItem(CLAVE_ID_TOKEN);
    return token && token.split(".").length === 3 ? token : null;
  } catch {
    return null;
  }
};

export default api;
