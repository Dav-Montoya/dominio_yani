// auth.ts: acá puse la lógica de "iniciar sesión" (la saqué de mi login.js de antes).
// Como no hay servidor (backend), la sesión se guarda en el navegador y es solo para la demo.
import { guardarSesion, leerUsuarios, type Sesion } from "./storage";

// acá dejé un usuario administrador de prueba, solo para la demostración del proyecto
export const ADMIN_CORREO = "admin@gmail.com";
export const ADMIN_CLAVE = "1234";

// crea la sesión, la guarda en el navegador y me la devuelve.
// Importante: antes de llamar a esta función ya revisé que el correo y la clave sean válidos.
export const iniciarSesion = (correo: string, clave: string): Sesion => {
  const correoLimpio = correo.trim().toLowerCase();

  let sesion: Sesion;
  if (correoLimpio === ADMIN_CORREO && clave === ADMIN_CLAVE) {
    sesion = { nombre: "Admin", correo: correoLimpio, rol: "Admin" };
  } else {
    // si la persona se registró antes, uso su nombre; si no, uso lo que está antes de la @
    const usuario = leerUsuarios().find((u) => u.correo.toLowerCase() === correoLimpio);
    sesion = { nombre: usuario?.nombre ?? correoLimpio.split("@")[0], correo: correoLimpio, rol: "Cliente" };
  }

  guardarSesion(sesion);
  return sesion;
};
