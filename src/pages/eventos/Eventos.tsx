// PÁGINA: EVENTOS (ruta "/eventos")
// Lista las participaciones de la comunidad (datos en data/eventos.ts).
import PageTitle from "../../components/page-title/PageTitle";
import { eventos } from "../../data/eventos";

const Eventos = () => (
  <div className="mx-auto max-w-4xl">
    <PageTitle subtitulo="Algunas de nuestras participaciones internacionales.">Eventos y participaciones</PageTitle>
    <div className="grid gap-5">
      {eventos.map((evento) => (
        <article key={evento.id} className="panel">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-celeste-100 px-3 py-0.5 text-sm font-extrabold text-celeste-500">
              {evento.anio}
            </span>
            <span className="text-sm font-semibold">{evento.ambito}</span>
          </p>
          <h3 className="mt-2 text-xl font-extrabold text-rosa-500">{evento.titulo}</h3>
          <p className="mt-1 leading-relaxed">{evento.descripcion}</p>
        </article>
      ))}
    </div>
  </div>
);

export default Eventos;
