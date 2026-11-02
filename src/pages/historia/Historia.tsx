// PÁGINA: NUESTRA HISTORIA (ruta "/historia")
// Acá cuento cómo nació Secret Sweet Maid. El texto viene de data/historia.ts,
// y al final puse el acceso al formulario "Ser una Sweet Maid".
import PageTitle from "../../components/page-title/PageTitle";
import { BUZON_URL } from "../../components/redes/Redes";
import { hitos, hoy, origenNombre } from "../../data/historia";

const Historia = () => (
  <div className="mx-auto max-w-4xl">
    <PageTitle subtitulo="Cómo nació Secret Sweet Maid y cómo volvió a despertar.">Nuestra historia</PageTitle>

    <section className="panel">
      <h3 className="mb-2 text-xl font-extrabold text-rosa-500">¿Por qué Secret Sweet Maid?</h3>
      <p className="leading-relaxed">{origenNombre}</p>
    </section>

    {/* línea de tiempo: la uso porque los hitos sí van en orden, de más antiguo a más nuevo */}
    <section aria-label="Línea de tiempo" className="mt-8">
      <ol className="relative ml-4 border-l-4 border-dashed border-celeste-300 pl-6 sm:ml-6 sm:pl-8">
        {hitos.map((hito) => (
          <li key={hito.etiqueta} className="relative mb-6 last:mb-0">
            {/* el circulito celeste que marca el punto en la línea */}
            <span
              aria-hidden="true"
              className="absolute -left-[2.15rem] top-4 h-4 w-4 rounded-full border-4 border-white bg-celeste-500 sm:-left-[2.65rem]"
            />
            <div className="panel">
              <span className="inline-block rounded-full bg-celeste-100 px-3 py-0.5 text-sm font-extrabold text-celeste-500">
                {hito.etiqueta}
              </span>
              <h3 className="mt-2 text-xl font-extrabold text-rosa-500">{hito.titulo}</h3>
              <p className="mt-1 leading-relaxed">{hito.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="panel mt-6 font-semibold leading-relaxed">{hoy}</p>
    </section>

    {/* ---------- Ser una Sweet Maid ---------- */}
    <section className="panel mt-8 border-celeste-300 text-center">
      <h3 className="text-xl font-extrabold text-rosa-500">Ser una Sweet Maid</h3>
      <p className="mx-auto mt-2 max-w-xl leading-relaxed">
        Si alguna vez soñaste con ser maid, nos encantaría conocerte un poquito más.
      </p>
      {/* esto lo aclara la página oficial, así que lo dejo bien visible */}
      <p className="mx-auto mt-2 max-w-xl font-bold">
        Este formulario no es una postulación ni una convocatoria oficial, y no asegura el ingreso al grupo.
      </p>
      <a href={BUZON_URL} target="_blank" rel="noopener noreferrer" className="boton mt-4">
        Abrir el buzón (se abre en otra pestaña)
      </a>
    </section>
  </div>
);

export default Historia;
