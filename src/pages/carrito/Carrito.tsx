// PÁGINA: CARRITO (ruta "/carrito")  <- mi carrito.html de antes
// Acá muestro los productos que agregué, puedo cambiar la cantidad, quitarlos, vaciar todo
// y ver el total. El carrito vive en App.tsx y acá solo lo muestro con props.
// Al "Finalizar compra" mando el carrito al backend (POST /api/pedidos): ahí se valida
// el stock, se descuentan unidades y queda guardado el pedido con su número.
import { useState } from "react";
import { Link } from "wouter";
import CatalogoEstado from "../../components/catalogo-estado/CatalogoEstado";
import PageTitle from "../../components/page-title/PageTitle";
import CantidadInput from "../../components/cantidad-input/CantidadInput";
import Photo from "../../components/photo/Photo";
import type { Producto } from "../../data/productos";
import { entorno } from "../../config/entorno";
import { crearPedido, type Pedido } from "../../services/pedidos";
import { calcularTotal, type ItemCarrito } from "../../utils/carrito";
import { formatearPrecio } from "../../utils/formato";
import type { Sesion } from "../../utils/storage";

interface CarritoProps {
  carrito: ItemCarrito[];
  sesion: Sesion | null;
  productos: Producto[]; // catálogo que llega del backend (o la lista local)
  cargando: boolean;
  onCambiarCantidad: (codigo: string, cantidad: number) => void;
  onQuitar: (codigo: string) => void;
  onVaciar: () => void;
}

const Carrito = ({ carrito, sesion, productos, cargando, onCambiarCantidad, onQuitar, onVaciar }: CarritoProps) => {
  // ESTADOS del checkout: si ya "compré" (para mostrar el gracias), si estoy enviando y el error si falla
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const finalizarCompra = async () => {
    // sin backend configurado la compra sigue siendo "de mentirita" (como antes)
    if (!entorno.apiUrl) {
      setPedidoCreado({ id: 0, fecha: new Date().toISOString(), estado: "DEMO", total: calcularTotal(carrito) });
      onVaciar();
      return;
    }

    setEnviando(true);
    setError("");
    try {
      // el backend deja el carrito como pedido; si todo sale bien lo vacío
      const pedido = await crearPedido(
        carrito.map((item) => ({ codigo: item.codigo, cantidad: item.cantidad })),
      );
      setPedidoCreado(pedido);
      onVaciar();
    } catch (problema) {
      setError(problema instanceof Error ? problema.message : "No se pudo registrar el pedido.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle>Tu carrito</PageTitle>

      {pedidoCreado && (
        <div role="status" className="mb-4 rounded-2xl border border-emerald-600 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          ¡Gracias por tu compra, {sesion?.nombre}! 💖
          {pedidoCreado.id > 0 && (
            <>
              <br />
              Tu pedido <strong>n° {pedidoCreado.id}</strong> quedó registrado en el backend por{" "}
              {formatearPrecio(pedidoCreado.total)}.
            </>
          )}
          {pedidoCreado.id === 0 && <> (es una demostración: no se cobra nada)</>}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-2xl border border-red-600 bg-red-50 p-3 text-sm font-bold text-red-800">
          {error}
        </div>
      )}

      {carrito.length === 0 ? (
        <div className="panel text-center">
          {pedidoCreado ? (
            // ya compré y el carrito quedó vacío: muestro solo el botón, no el aviso de carrito vacío
            <Link href="/" className="boton">
              Volver al inicio
            </Link>
          ) : (
            <>
              <p className="mb-4 font-bold">Tu carrito está vacío.</p>
              <Link href="/productos" className="boton">
                Ir al catálogo
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <CatalogoEstado cargando={cargando} error="" vacio={!cargando && productos.length === 0} />

          {/* una fila por producto; en celular se apila y en pantallas más grandes queda en línea */}
          <ul className="flex flex-col gap-3">
            {carrito.map((item) => {
              const stock = productos.find((p) => p.codigo === item.codigo)?.stock ?? item.cantidad;
              return (
                <li key={item.codigo} className="panel flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* 🖼️ acá va la foto chiquita del producto */}
                  <Photo src={item.imagen} alt={item.nombre} contener className="h-20 w-20 shrink-0 rounded-xl bg-rosa-100 p-1" />
                  <div className="flex-1">
                    <Link href={`/productos/${item.codigo}`} className="font-extrabold text-rosa-500">
                      {item.nombre}
                    </Link>
                    <p className="text-sm">Precio unitario: {formatearPrecio(item.precio)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`cantidad-${item.codigo}`} className="text-sm font-bold">
                      Cant.
                    </label>
                    <CantidadInput
                      id={`cantidad-${item.codigo}`}
                      valor={item.cantidad}
                      max={stock}
                      onCambio={(cantidad) => onCambiarCantidad(item.codigo, cantidad)}
                    />
                  </div>
                  <p className="w-24 font-extrabold text-rosa-500 sm:text-right">
                    {formatearPrecio(item.precio * item.cantidad)}
                  </p>
                  <button type="button" onClick={() => onQuitar(item.codigo)} className="boton-suave !px-3 !py-1">
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="panel mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={onVaciar} className="boton-suave">
              Vaciar carrito
            </button>
            <p className="text-xl font-extrabold text-rosa-500">Total: {formatearPrecio(calcularTotal(carrito))}</p>
          </div>

          <div className="mt-4 text-right">
            {sesion ? (
              <button
                type="button"
                onClick={finalizarCompra}
                disabled={enviando || cargando}
                className="boton disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Registrando tu pedido…" : "Finalizar compra"}
              </button>
            ) : (
              <p className="text-sm font-bold">
                Para finalizar tu compra,{" "}
                <Link href="/login" className="text-rosa-500 underline">
                  inicia sesión
                </Link>
                .
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
