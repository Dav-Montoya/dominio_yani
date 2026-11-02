// entorno.ts: acá junto TODAS las variables de entorno (las que empiezan con VITE_) en un solo lugar.
// Se escriben en un archivo .env.local (que NO se sube a GitHub). Mira .env.example para ver cuáles son.
// Si no pongo ninguna, la tienda funciona igual en modo local.
import { resolverModoAuth } from "../utils/cognito";

const authority: string = import.meta.env.VITE_OIDC_AUTHORITY ?? "";
const clientId: string = import.meta.env.VITE_OIDC_CLIENT_ID ?? "";

export const entorno = {
  // dirección del backend (si no la pongo, la tienda no intenta hablar con ningún servidor)
  apiUrl: (import.meta.env.VITE_API_URL ?? "") as string,

  modoAuth: resolverModoAuth({ authority, clientId }),

  oidc: {
    authority,
    clientId,
    // a dónde vuelve Cognito después de iniciar sesión; si no la pongo uso la dirección actual
    redirectUri: ((import.meta.env.VITE_OIDC_REDIRECT_URI as string | undefined) || window.location.origin) as string,
    scope: "openid email phone",
  },

  // dominio de Cognito (ej: https://mi-dominio.auth.us-east-1.amazoncognito.com), solo sirve para cerrar sesión del todo
  cognitoDominio: (import.meta.env.VITE_COGNITO_DOMAIN ?? "") as string,
};
