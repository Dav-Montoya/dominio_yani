// pages/admin/AdminProductos.tsx: MANTENEDOR DE PRODUCTOS (ABM completo).
// - Lista los productos del backend en una tabla.
// - Formulario para CREAR uno nuevo y para EDITAR uno elegido (mismo panel).
// - ELIMINAR con confirmación (window.confirm: una línea y todos la entienden).
// Requiere sesión de Admin (App.tsx lo envuelve con RequiereAdmin).
import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import PageTitle from "../../components/page-title/PageTitle";
import Field from "../../components/field/Field";
import { listarProductos } from "../../services/productos";
import { crearProducto, actualizarProducto, eliminarProducto, type ProductoAdmin } from "../../services/admin";
import { ApiError } from "../../services/api";
import { formatearPrecio } from "../../utils/formato";
import { categorias, type Producto } from "../../data/productos";

// estado inicial del formulario (igual para crear y para "empezar de nuevo")
const PRODUCTO_VACIO: ProductoAdmin = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  stockCritico: null,
  categoria: "shikku",
  tipo: "sticker",
  imagen: "/imgs/shikku.webp",
  destacado: false,
};

// opciones del <select> de tipo: las mismas que ya usan los productos de la tienda
const TIPOS = [
  { valor: "sticker", etiqueta: "Sticker" },
  { valor: "llavero", etiqueta: "Llavero" },
  { valor: "polera", etiqueta: "Polera" },
  { valor: "taza", etiqueta: "Taza" },
  { valor: "accesorio", etiqueta: "Accesorio" },
  { valor: "figure", etiqueta: "Figura" },
];

const AdminProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // formulario
  const [modoEdicion, setModoEdicion] = useState(false); // true = estoy editando (el código es la clave del PUT)
  const [form, setForm] = useState<ProductoAdmin>(PRODUCTO_VACIO);
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  // la lista se pide al backend de nuevo después de cada operación, así siempre está fresca
  const recargar = useCallback(async () => {
    try {
      setProductos(await listarProductos());
      setError("");
    } catch (problema) {
      setError(problema instanceof Error ? problema.message : "No pudimos cargar los productos. Ya volvemos.");
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      setCargando(true);
      await recargar();
      if (vivo) setCargando(false);
    };
    void cargar();
    return () => {
      vivo = false;
    };
  }, [recargar]);

  const actualizarCampo = (campo: keyof ProductoAdmin, valor: string | number | boolean | null) =>
    setForm((actual) => ({ ...actual, [campo]: valor }));

  // validación suave antes de mandar: el backend también valida, pero acá aviso
  // con mensajes claros y no gasto una llamada
  const validar = (): string => {
    if (!form.codigo.trim()) return "El código del producto es obligatorio (sin espacios).";
    if (!form.nombre.trim()) return "El nombre del producto es obligatorio.";
    if (!form.descripcion.trim()) return "La descripción es obligatoria.";
    if (!Number.isFinite(form.precio) || form.precio <= 0) return "El precio debe ser mayor a cero.";
    if (!Number.isFinite(form.stock) || form.stock < 0) return "El stock no puede ser negativo.";
    if (form.stockCritico != null && (!Number.isFinite(form.stockCritico) || form.stockCritico < 0)) {
      return "El stock crítico no puede ser negativo (o déjalo vacío).";
    }
    if (!form.imagen.trim()) return "La dirección de la imagen es obligatoria (ej: /imgs/shikku.webp).";
    return "";
  };

  const guardar = async () => {
    setErrorForm("");
    const problema = validar();
    if (problema) {
      setErrorForm(problema);
      return;
    }
    setGuardando(true);
    try {
      // stockCritico vacío se manda como null para que el backend lo deje sin valor
      const cuerpo: ProductoAdmin = { ...form, stockCritico: form.stockCritico === null ? null : form.stockCritico };
      if (modoEdicion) {
        await actualizarProducto(form.codigo.trim(), cuerpo);
        setAviso(`Producto "${form.nombre}" actualizado.`);
      } else {
        await crearProducto(cuerpo);
        setAviso(`Producto "${form.nombre}" creado.`);
      }
      setForm(PRODUCTO_VACIO); // limpio el formulario (igual sale del modo edición)
      setModoEdicion(false);
      await recargar();
    } catch (problema) {
      setErrorForm(problema instanceof ApiError ? problema.message : "No pudimos guardar el producto. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const editar = (producto: Producto) => {
    setModoEdicion(true);
    setErrorForm("");
    setAviso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      stockCritico: producto.stockCritico ?? null,
      categoria: producto.categoria,
      tipo: producto.tipo,
      imagen: producto.imagen,
      destacado: producto.destacado ?? false,
    });
  };

  const borrar = async (producto: Producto) => {
    setAviso("");
    // confirmación: si la persona dice que no, no toco nada
    if (!window.confirm(`¿Seguro que quieres eliminar "${producto.nombre}" (${producto.codigo}) del catálogo?`)) {
      return;
    }
    try {
      await eliminarProducto(producto.codigo);
      setAviso(`Producto "${producto.nombre}" eliminado.`);
      if (modoEdicion && form.codigo === producto.codigo) {
        setForm(PRODUCTO_VACIO);
        setModoEdicion(false);
      }
      await recargar();
    } catch (problema) {
      setError(problema instanceof ApiError ? problema.message : "No pudimos eliminar el producto.");
    }
  };

  return (
    <>
      <PageTitle subtitulo="Crear, editar y eliminar los productos del catálogo. Los cambios se ven al instante en la tienda.">
        Mantenedor de Productos
      </PageTitle>

      {/* avisos de resultado */}
      {aviso && (
        <p role="status" className="panel mb-4 max-w-6xl border-emerald-500 font-semibold text-emerald-700">
          {aviso}
        </p>
      )}
      {error && (
        <p role="alert" className="panel mb-4 max-w-6xl border-rosa-400 font-semibold text-rosa-500">
          {error}
        </p>
      )}

      {/* tabla del catálogo */}
      <div className="panel mb-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-rosa-200 text-xs uppercase text-ciruela">
              <th className="px-3 py-2">Imagen</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Dest.</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-ciruela">
                  Cargando catálogo…
                </td>
              </tr>
            )}
            {!cargando && productos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-ciruela">
                  No hay productos todavía. Usa el formulario de abajo para crear el primero.
                </td>
              </tr>
            )}
            {!cargando &&
              productos.map((p) => (
                <tr key={p.codigo} className="border-b border-rosa-100">
                  <td className="px-3 py-2">
                    <img src={p.imagen} alt={p.nombre} className="h-10 w-10 rounded-lg object-cover" />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.codigo}</td>
                  <td className="px-3 py-2 font-semibold">{p.nombre}</td>
                  <td className="px-3 py-2 capitalize">{p.categoria}</td>
                  <td className="px-3 py-2">{formatearPrecio(p.precio)}</td>
                  <td className="px-3 py-2">
                    {p.stock < (p.stockCritico ?? 0) ? <span className="font-bold text-rose-700">{p.stock} ⚠️</span> : p.stock}
                  </td>
                  <td className="px-3 py-2 text-center">{p.destacado ? "⭐" : ""}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="boton-suave mr-2 px-3 py-1 text-xs" onClick={() => editar(p)}>
                      Editar
                    </button>
                    <button type="button" className="boton-suave px-3 py-1 text-xs" onClick={() => void borrar(p)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* formulario crear/editar */}
      <div className="panel max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">
            {modoEdicion ? `✏️ Editando "${form.nombre}" (${form.codigo})` : "➕ Nuevo producto"}
          </h3>
          {modoEdicion && (
            <Link href="/admin/productos" onClick={() => {
              setModoEdicion(false);
              setForm(PRODUCTO_VACIO);
              setErrorForm("");
            }} className="text-sm font-bold text-rosa-500">
              Cancelar edición
            </Link>
          )}
        </div>

        <div className="grid gap-x-6 sm:grid-cols-2">
          <Field id="adm-codigo" label="Código" value={form.codigo} maxLength={20}
            onChange={(v) => actualizarCampo("codigo", v)}
            deshabilitado={modoEdicion}
            ayuda={modoEdicion ? "El código no se cambia al editar (es la llave del producto)." : "Código corto y único, ej: SHI001"} />
          <Field id="adm-nombre" label="Nombre" value={form.nombre} maxLength={100}
            onChange={(v) => actualizarCampo("nombre", v)} />
          <Field id="adm-precio" label="Precio (pesos)" value={String(form.precio || "")} type="number"
            onChange={(v) => actualizarCampo("precio", Number(v) || 0)} />
          <Field id="adm-stock" label="Stock (unidades)" value={String(form.stock || "")} type="number"
            onChange={(v) => actualizarCampo("stock", Number(v) || 0)} />
          <Field id="adm-stockcritico" label="Stock crítico (opcional)" value={form.stockCritico == null ? "" : String(form.stockCritico)}
            type="number"
            onChange={(v) => actualizarCampo("stockCritico", v === "" ? null : Number(v))}
            ayuda="Si el stock baja de este número, la tienda avisa 'quedan pocas unidades'." />
          <Field id="adm-categoria" label="Categoría (maid)" value={form.categoria}
            opciones={categorias.filter((c) => c.valor !== "todas").map((c) => ({ valor: c.valor, etiqueta: c.etiqueta }))}
            textoOpcionVacia="Elegir categoría"
            onChange={(v) => actualizarCampo("categoria", v)} />
          <Field id="adm-tipo" label="Tipo de producto" value={form.tipo}
            opciones={TIPOS}
            textoOpcionVacia="Elegir tipo"
            onChange={(v) => actualizarCampo("tipo", v)} />
          <Field id="adm-imagen" label="Imagen" value={form.imagen} maxLength={200}
            onChange={(v) => actualizarCampo("imagen", v)}
            ayuda="Ruta dentro de la tienda, ej: /imgs/shikku.webp" />
        </div>

        <div className="mb-2 grid sm:grid-cols-2">
          <Field id="adm-descripcion" label="Descripción" value={form.descripcion} maxLength={500} multilinea
            onChange={(v) => actualizarCampo("descripcion", v)} />
          <div className="flex flex-col justify-end pb-4">
            <label className="mb-1 text-sm font-bold" htmlFor="adm-destacado">¿Producto destacado?</label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                id="adm-destacado"
                type="checkbox"
                className="h-5 w-5 accent-rosa-500"
                checked={form.destacado}
                onChange={(e) => actualizarCampo("destacado", e.target.checked)}
              />
              Si está marcado, aparece en "Productos destacados" del inicio
            </label>
          </div>
        </div>

        {errorForm && (
          <p role="alert" className="mb-2 text-sm font-semibold text-rose-700">{errorForm}</p>
        )}

        <div className="flex gap-3">
          <button type="button" className="boton" disabled={guardando} onClick={() => void guardar()}>
            {guardando ? "Guardando…" : modoEdicion ? "Guardar cambios" : "Crear producto"}
          </button>
          <button type="button" className="boton-suave" onClick={() => { setForm(PRODUCTO_VACIO); setModoEdicion(false); setErrorForm(""); }}>
            Limpiar formulario
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminProductos;
