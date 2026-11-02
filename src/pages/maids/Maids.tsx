// PÁGINA: MAIDS (ruta "/maids")
// Muestra una tarjeta por cada maid (datos en data/maids.ts) con un botón que lleva a su merch.
import MaidCard from "../../components/maid-card/MaidCard";
import PageTitle from "../../components/page-title/PageTitle";
import { maids } from "../../data/maids";

const Maids = () => (
  <div className="mx-auto max-w-6xl">
    <PageTitle subtitulo="Conoce a las maids de Secret Sweet Maid y encuentra su merch.">Maids</PageTitle>
    {/* 1 columna en celular, 2 en tablet y 3 en computador (igual que el catálogo) */}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {maids.map((maid) => (
        <MaidCard key={maid.slug} maid={maid} />
      ))}
    </div>
  </div>
);

export default Maids;
