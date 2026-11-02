// storage.ts: acá puse todo lo que lee y guarda en LocalStorage (la "libretita" del navegador):
// el carrito, los usuarios registrados y la sesión.
// Uso try/catch en todo para que la tienda no se caiga si el navegador bloquea el almacenamiento.
import type { ItemCarrito } from "./carrito";

// dejé la misma clave del carrito que usaba antes, así no se pierde lo que ya estaba guardado
const CLAVE_CARRITO = "ssm_carrito";
const CLAVE_USUARIOS = "ssm_usuarios";
const CLAVE_SESION = "ssm_sesion";

export interface Usuario {
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  fechaNacimiento: string;
  tipoUsuario: string;
  region: string;
  comuna: string;
  direccion: string;
}

// lo que guardo de la persona que inició sesión
export interface Sesion {
  nombre: string;
  correo: string;
  rol: "Admin" | "Cliente";
}

const leer = <T,>(clave: string, porDefecto: T): T => {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? (JSON.parse(texto) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
};

const guardar = (clave: string, valor: unknown): boolean => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
};

export const leerCarrito = (): ItemCarrito[] => leer<ItemCarrito[]>(CLAVE_CARRITO, []);
export const guardarCarrito = (carrito: ItemCarrito[]): void => {
  guardar(CLAVE_CARRITO, carrito);
};

export const leerSesion = (): Sesion | null => leer<Sesion | null>(CLAVE_SESION, null);
export const guardarSesion = (sesion: Sesion): void => {
  guardar(CLAVE_SESION, sesion);
};
export const borrarSesion = (): void => {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* si no se puede borrar, no pasa nada grave */
  }
};

export const leerUsuarios = (): Usuario[] => leer<Usuario[]>(CLAVE_USUARIOS, []);

// devuelve "" si salió bien, o el mensaje del problema (por ejemplo, correo o RUN repetido)
export const registrarUsuario = (usuario: Usuario): string => {
  const usuarios = leerUsuarios();
  if (usuarios.some((u) => u.correo.toLowerCase() === usuario.correo.toLowerCase())) {
    return "Ese correo ya está registrado. ¡Inicia sesión!";
  }
  if (usuarios.some((u) => u.run === usuario.run)) {
    return "Ese RUN ya está registrado.";
  }
  return guardar(CLAVE_USUARIOS, [...usuarios, usuario])
    ? ""
    : "No se pudo guardar tu cuenta en este navegador.";
};
