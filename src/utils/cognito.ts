// cognito.ts: acá puse las funciones "chicas" que usa el inicio de sesión con Amazon Cognito.
// Son funciones puras (no tocan el navegador), por eso las puedo probar con vitest.
import type { Sesion } from "./storage";

// "local" = todo en LocalStorage (modo por defecto, no necesita internet ni AWS)
// "cognito" = el login lo hace Amazon Cognito (OIDC) y se activa solo si hay variables de entorno
export type ModoAuth = "local" | "cognito";

// el modo es "cognito" solo si me dieron la dirección (authority) y el client id.
// Si falta alguno, la tienda sigue funcionando en modo local y no se rompe nada.
export const resolverModoAuth = (entorno: { authority?: string; clientId?: string }): ModoAuth =>
  entorno.authority && entorno.clientId ? "cognito" : "local";

// lo que me devuelve Cognito sobre la persona (perfil del token)
export interface PerfilCognito {
  email?: unknown;
  name?: unknown;
  "cognito:groups"?: unknown;
  [otro: string]: unknown;
}

const comoTexto = (valor: unknown): string => (typeof valor === "string" ? valor.trim() : "");

// convierto el perfil de Cognito en mi Sesion (la misma que usa el menú y el carrito).
// SUPUESTO: si la persona pertenece al grupo "Admin" de Cognito, es administradora; si no, cliente.
export const sesionDesdePerfil = (perfil: PerfilCognito): Sesion => {
  const correo = comoTexto(perfil.email).toLowerCase();
  const grupos = Array.isArray(perfil["cognito:groups"]) ? perfil["cognito:groups"] : [];
  return {
    nombre: comoTexto(perfil.name) || correo.split("@")[0] || "Invitada/o",
    correo,
    rol: grupos.includes("Admin") ? "Admin" : "Cliente",
  };
};

// arma la dirección de "cerrar sesión" del dominio de Cognito (la misma idea que tenía login-page.tsx)
export const urlCerrarSesionCognito = (dominio: string, clientId: string, logoutUri: string): string =>
  `${dominio.replace(/\/$/, "")}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutUri)}`;
