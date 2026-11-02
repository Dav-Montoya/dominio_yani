// PÁGINA: CONTACTO (ruta "/contacto")  <- mi contacto.html de antes
// Formulario con nombre, correo y comentario (con contador de letras).
// Al enviar valido y mando el mensaje al backend (POST /api/contacto): se guarda
// en su base y se notifica al equipo por ntfy. Sin backend configurado, el aviso
// de éxito sigue siendo "de mentirita" como antes (no hace la llamada).
import { useState, type FormEvent } from "react";
import Field from "../../components/field/Field";
import Mensaje, { type MensajeForm } from "../../components/mensaje/Mensaje";
import PageTitle from "../../components/page-title/PageTitle";
import Redes, { BUZON_URL } from "../../components/redes/Redes";
import { enviarMensajeContacto, hayServidorContacto } from "../../services/contacto";
import { hayErrores, validarComentario, validarCorreo, validarNombre } from "../../utils/validators";

const vacio = { nombre: "", correo: "", comentario: "" };

const Contacto = () => {
  const [datos, setDatos] = useState(vacio);
  const [errores, setErrores] = useState(vacio);
  const [mensaje, setMensaje] = useState<MensajeForm | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof typeof vacio) => (valor: string) =>
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevos = {
      nombre: validarNombre(datos.nombre),
      correo: validarCorreo(datos.correo),
      comentario: validarComentario(datos.comentario),
    };
    setErrores(nuevos);

    if (hayErrores(nuevos)) {
      setMensaje({ tipo: "fallo", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    // sin backend la demo sigue igual (aviso de éxito sin llamada)
    if (!hayServidorContacto()) {
      setMensaje({ tipo: "exito", texto: "¡Gracias! Tu mensaje fue enviado." });
      setDatos(vacio);
      return;
    }

    setEnviando(true);
    try {
      await enviarMensajeContacto({
        nombre: datos.nombre.trim(),
        email: datos.correo.trim(), // el backend lo llama "email"
        comentario: datos.comentario.trim(),
      });
      setMensaje({ tipo: "exito", texto: "¡Gracias! Tu mensaje fue enviado." });
      setDatos(vacio); // limpio el formulario
    } catch (problema) {
      setMensaje({
        tipo: "fallo",
        texto: problema instanceof Error ? problema.message : "No se pudo enviar el mensaje. Intenta más tarde.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle subtitulo="¿Dudas con tu pedido o quieres proponernos un producto? Escríbenos.">
        Contáctanos
      </PageTitle>
      <Mensaje mensaje={mensaje} />
      <form onSubmit={handleSubmit} noValidate className="panel p-6">
        <Field id="contacto-nombre" label="Nombre" value={datos.nombre} onChange={cambiar("nombre")} error={errores.nombre} maxLength={100} autoComplete="name" />
        <Field id="contacto-correo" label="Correo electrónico" type="email" value={datos.correo} onChange={cambiar("correo")} error={errores.correo} placeholder="nombre@duoc.cl" maxLength={100} autoComplete="email" />
        <Field id="contacto-comentario" label="Comentario" multilinea value={datos.comentario} onChange={cambiar("comentario")} error={errores.comentario} maxLength={500} />
        {/* este contador me muestra cuánto espacio queda mientras escribo */}
        <p className="-mt-2 mb-4 text-right text-xs">{datos.comentario.length}/500</p>
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar mensaje"}
        </button>
      </form>

      {/* redes de la comunidad */}
      <section className="panel mt-6 p-6">
        <h3 className="mb-2 text-lg font-extrabold text-rosa-500">Síguenos</h3>
        <p className="mb-2">
          <Redes />
        </p>
        <p className="text-sm font-semibold">
          ¿Quieres ser maid?{" "}
          <a href={BUZON_URL} target="_blank" rel="noopener noreferrer" className="text-rosa-500 underline">
            Abre el buzón
          </a>{" "}
          (no es una postulación oficial).
        </p>
      </section>
    </div>
  );
};

export default Contacto;
