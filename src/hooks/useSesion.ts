// useSesion.ts: acá junté TODO lo de "quién inició sesión" en un solo hook.
// Reemplaza al useAuth.ts de la rama feature (que usaba solo el backend) porque este funciona en los dos modos:
//  - modo "local": la sesión se guarda en LocalStorage (como siempre)
//  - modo "cognito": la sesión viene de Amazon Cognito (OIDC) y la convierto a mi misma Sesion
// Así el Menú y el Carrito no se enteran de cuál modo se está usando.
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "react-oidc-context";
import { entorno } from "../config/entorno";
import { borrarToken, guardarToken } from "../services/api";
import { sesionDesdePerfil, urlCerrarSesionCognito, type ModoAuth } from "../utils/cognito";
import { borrarSesion, leerSesion, type Sesion } from "../utils/storage";

export interface UsoSesion {
  sesion: Sesion | null;
  modo: ModoAuth;
  cargando: boolean; // true mientras Cognito termina de revisar la sesión
  error: string; // mensaje si Cognito falló (vacío si no)
  iniciarLocal: (sesion: Sesion) => void;
  iniciarCognito: () => void;
  cerrarSesion: () => void;
}

export const useSesion = (): UsoSesion => {
  // AuthContext existe solo si main.tsx envolvió la app con AuthProvider (modo cognito); si no, es undefined
  const oidc = useContext(AuthContext);
  const [local, setLocal] = useState<Sesion | null>(leerSesion);

  const usuarioOidc = oidc?.isAuthenticated ? oidc.user : null;
  const accessToken = usuarioOidc?.access_token;

  // cuando entro con Cognito, guardo el token para que api.ts lo mande en cada llamada al backend
  useEffect(() => {
    if (accessToken) guardarToken(accessToken);
  }, [accessToken]);

  const sesion = useMemo(
    () => (usuarioOidc ? sesionDesdePerfil(usuarioOidc.profile) : local),
    [usuarioOidc, local],
  );

  const cerrarSesion = () => {
    borrarSesion();
    borrarToken();
    setLocal(null);
    if (oidc?.isAuthenticated) {
      void oidc.removeUser();
      // si tengo el dominio de Cognito, también cierro la sesión que queda abierta en Cognito
      if (entorno.cognitoDominio) {
        window.location.href = urlCerrarSesionCognito(
          entorno.cognitoDominio,
          entorno.oidc.clientId,
          entorno.oidc.redirectUri,
        );
      }
    }
  };

  return {
    sesion,
    modo: entorno.modoAuth,
    cargando: oidc?.isLoading ?? false,
    error: oidc?.error?.message ?? "",
    iniciarLocal: setLocal,
    iniciarCognito: () => void oidc?.signinRedirect(),
    cerrarSesion,
  };
};

