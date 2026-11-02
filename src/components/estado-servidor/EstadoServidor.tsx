// EstadoServidor.tsx: un cartelito chiquito en el pie de página que dice si el backend responde.
// Solo aparece si puse VITE_API_URL; sin esa variable no hace ninguna llamada (así no molesta ni da errores).
// Me sirve para revisar rápido, antes de presentar, si la API está arriba.
import { useEffect, useState } from "react";
import { entorno } from "../../config/entorno";
import api from "../../services/api";

type Estado = "revisando" | "conectado" | "sin-conexion";

const EstadoServidor = () => {
  const [estado, setEstado] = useState<Estado>("revisando");

  useEffect(() => {
    if (!entorno.apiUrl) return;
    let activo = true; // para no actualizar el estado si me fui de la página
    api.estaDisponible().then((ok) => {
      if (activo) setEstado(ok ? "conectado" : "sin-conexion");
    });
    return () => {
      activo = false;
    };
  }, []);

  if (!entorno.apiUrl) return null;

  const texto = { revisando: "Revisando servidor…", conectado: "Servidor conectado", "sin-conexion": "Servidor sin conexión" }[estado];
  return (
    <span className="ml-2 inline-block rounded-full bg-celeste-100 px-3 py-0.5 text-xs font-bold text-celeste-500" role="status">
      {texto}
    </span>
  );
};

export default EstadoServidor;
