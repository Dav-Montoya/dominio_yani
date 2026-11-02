// MaidCard.tsx: la tarjeta de UNA maid (foto, nombre y botón a su merch).
// Usa los mismos estilos de .panel y .boton-suave que las tarjetas de productos, para que se vean parecidas.
import { Link } from "wouter";
import type { Maid } from "../../data/maids";
import Photo from "../photo/Photo";

interface MaidCardProps {
  maid: Maid;
}

const MaidCard = ({ maid }: MaidCardProps) => (
  <article className="panel flex flex-col items-center text-center">
    {/* 🖼️ acá va la foto de la maid (ruta en data/maids.ts) */}
    <Photo
      src={maid.imagen}
      alt={`Ilustración de ${maid.nombre}`}
      contener
      className="mb-3 h-56 w-full rounded-2xl bg-celeste-100 p-2"
    />
    <h3 className="text-2xl font-extrabold text-rosa-500">{maid.nombre}</h3>
    {maid.descripcion && <p className="mt-1 leading-relaxed">{maid.descripcion}</p>}
    <Link href={`/productos?maid=${maid.slug}`} className="boton-suave mt-4">
      Ver su merch
    </Link>
  </article>
);

export default MaidCard;
