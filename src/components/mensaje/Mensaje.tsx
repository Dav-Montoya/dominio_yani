// Mensaje.tsx: acá hice el aviso que sale arriba de los formularios (verde si salió bien, rojo si hay fallas).
// Es el mismo que antes armaba con .mensaje-formulario.exito y .fallo.
export interface MensajeForm {
  tipo: "exito" | "fallo";
  texto: string;
}

const Mensaje = ({ mensaje }: { mensaje: MensajeForm | null }) => {
  if (!mensaje) return null;
  const color =
    mensaje.tipo === "exito"
      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
      : "border-rose-700 bg-rose-50 text-rose-800";
  // role="status" hace que los lectores de pantalla lean el aviso apenas aparece
  return (
    <p role="status" className={`mb-4 rounded-2xl border p-3 text-sm font-bold ${color}`}>
      {mensaje.texto}
    </p>
  );
};

export default Mensaje;
