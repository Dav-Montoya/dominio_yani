// main.tsx: acá conecto React con el <div id="root"> del index.html
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import "animate.css"; // la misma librería de animaciones que usaba antes (animate__fadeIn)
import "./index.css";
import App from "./App.tsx";
import { entorno } from "./config/entorno";

// acá armo la configuración de Cognito (la idea viene de main.tsx de la rama feature-conectar-api,
// pero SIN dejar los datos escritos a mano: ahora salen de las variables de entorno)
const configuracionOidc = {
  authority: entorno.oidc.authority,
  client_id: entorno.oidc.clientId,
  redirect_uri: entorno.oidc.redirectUri,
  response_type: "code",
  scope: entorno.oidc.scope,
  // cuando Cognito me devuelve a la tienda, limpio la dirección (saco el ?code=... de la barra)
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

// Solo envuelvo la app con AuthProvider si el modo es "cognito".
// Así, sin variables de entorno, la tienda funciona igual que antes (modo local).
const app = <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {entorno.modoAuth === "cognito" ? <AuthProvider {...configuracionOidc}>{app}</AuthProvider> : app}
  </StrictMode>,
);
