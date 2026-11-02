// ProductoCard.tsx: acá hice UNA tarjeta de producto (foto, nombre, precio, stock y botones).
// Antes armaba este HTML con JavaScript en productos.js; ahora es un componente
// que repito con .map() para cada producto de la lista.
import { useState } from "react";
import { Link } from "wouter";
import type { Producto } from "../../data/productos";
import { formatearPrecio } from "../../utils/formato";
import Photo from "../photo/Photo";

interface ProductoCardProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void; // función que viene de App.tsx y agrega al carrito
}

// si no le puse stockCritico al producto, uso 3 como límite para avisar que quedan pocas unidades
// (en mi versión anterior esto nunca se mostraba porque el valor no existía)
const STOCK_CRITICO_POR_DEFECTO = 3;

const ProductoCard = ({ producto, onAgregar }: ProductoCardProps) => {
  // acá guardo si recién agregué el producto, para cambiar el texto del botón un ratito
  const [agregado, setAgregado] = useState(false);
  const stockBajo = producto.stock <= (producto.stockCritico ?? STOCK_CRITICO_POR_DEFECTO);

  const handleAgregar = () => {
    onAgregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 900); // a los 0,9 segundos vuelve al texto normal
  };

  return (
    <article className="panel flex h-full flex-col text-center transition hover:-translate-y-1 hover:shadow-xl">
      {/* 🖼️ acá va la foto del producto; al tocarla se abre el detalle.
          Uso "contener" para que se vea el producto completo sin recortarlo */}
      <Link href={`/productos/${producto.codigo}`} aria-label={`Ver detalle de ${producto.nombre}`}>
        <Photo
          src={producto.imagen}
          alt={producto.nombre}
          contener
          className="mb-3 h-48 w-full rounded-2xl bg-rosa-100 p-2"
        />
      </Link>
      <h3 className="mb-1 text-base font-extrabold text-rosa-500">{producto.nombre}</h3>
      <p className="mb-2 text-sm">{producto.descripcion}</p>
      <p className="mb-1 text-lg font-extrabold text-rosa-500">{formatearPrecio(producto.precio)}</p>
      {stockBajo ? (
        <p className="mb-3 text-xs font-bold text-rose-700">¡Quedan pocas unidades! ({producto.stock})</p>
      ) : (
        <p className="mb-3 text-xs">Stock disponible: {producto.stock}</p>
      )}
      <div className="mt-auto flex flex-wrap justify-center gap-2">
        <Link href={`/productos/${producto.codigo}`} className="boton-suave">
          Ver detalle
        </Link>
        <button type="button" onClick={handleAgregar} className="boton">
          {agregado ? "¡Agregado!" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
};

export default ProductoCard;
