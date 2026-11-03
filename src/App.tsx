// App.tsx: acá armé el "centro" de la tienda.
//  1) Guardo el carrito (con useState) y la sesión (con mi hook useSesion) y se los paso por props a las páginas que los necesitan.
//  2) Dibujo el menú (siempre visible) y la página que corresponde a la dirección.
//  3) <Switch> mira la dirección (/productos, /carrito...) y muestra solo la <Route> que coincide.
import { useEffect, useState } from "react";
import { Route, Router, Switch } from "wouter";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";
import type { Producto } from "./data/productos";
import { useProductos } from "./hooks/useProductos";
import Carrito from "./pages/carrito/Carrito";
import Contacto from "./pages/contacto/Contacto";
import Cuenta from "./pages/cuenta/Cuenta";
import Eventos from "./pages/eventos/Eventos";
import Historia from "./pages/historia/Historia";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Maids from "./pages/maids/Maids";
import NotFound from "./pages/not-found/NotFound";
import ProductoDetalle from "./pages/producto-detalle/ProductoDetalle";
import Productos from "./pages/productos/Productos";
import Register from "./pages/register/Register";
import { agregarItem, cambiarCantidad, contarUnidades, quitarItem, type ItemCarrito } from "./utils/carrito";
import { useSesion } from "./hooks/useSesion";
import { guardarCarrito, leerCarrito } from "./utils/storage";

function App() {
  // acá arranco con lo que haya guardado en el navegador, así no se pierde al recargar
  const [carrito, setCarrito] = useState<ItemCarrito[]>(leerCarrito);
  // acá uso mi hook: me da la sesión (local o de Cognito) y las funciones para entrar y salir
  const { sesion, cargando, error, iniciarLocal, cerrarSesion } = useSesion();
  // el catálogo ahora viene del backend (fs2-api); sin backend usa el catálogo local
  const { productos: listaProductos, cargando: catalogoCargando, error: errorCatalogo } = useProductos();

  // cada vez que el carrito cambia, lo guardo en LocalStorage
  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  const handleAgregar = (producto: Producto, cantidad = 1) =>
    setCarrito((actual) => agregarItem(actual, producto, cantidad));

  // para cambiar la cantidad necesito saber el stock del producto, por eso lo busco en la lista
  const handleCambiarCantidad = (codigo: string, cantidad: number) => {
    const stock = listaProductos.find((p) => p.codigo === codigo)?.stock ?? 1;
    setCarrito((actual) => cambiarCantidad(actual, codigo, cantidad, stock));
  };

  const handleQuitar = (codigo: string) => setCarrito((actual) => quitarItem(actual, codigo));
  const handleVaciar = () => setCarrito([]);

  return (
    <Router>
      {/* acá dejé mi grilla de 12 columnas: en computador el menú usa 3 (2 en pantallas muy grandes)
          y el contenido usa el resto; en celular todo va en una sola columna */}
      <div className="min-h-screen lg:grid lg:grid-cols-12">
        <Menu sesion={sesion} cantidadCarrito={contarUnidades(carrito)} onLogout={cerrarSesion} />

        <main className="p-4 sm:p-6 lg:col-span-9 lg:p-10 xl:col-span-10">
          {/* avisos de Cognito (solo aparecen en modo cognito si algo falla o está cargando) */}
          {error && (
            <p role="alert" className="panel mx-auto mb-4 max-w-6xl border-rosa-400 font-semibold text-rosa-500">
              No pudimos iniciar sesión. Ya volvemos: inténtalo de nuevo.
            </p>
          )}
          {cargando && <p className="mx-auto mb-4 max-w-6xl font-semibold">Revisando tu sesión…</p>}
          <Switch>
            <Route path="/">
              <Home onAgregar={handleAgregar} productos={listaProductos} cargando={catalogoCargando} error={errorCatalogo} />
            </Route>
            <Route path="/historia" component={Historia} />
            <Route path="/maids" component={Maids} />
            <Route path="/eventos" component={Eventos} />
            <Route path="/productos">
              <Productos onAgregar={handleAgregar} productos={listaProductos} cargando={catalogoCargando} error={errorCatalogo} />
            </Route>
            <Route path="/productos/:codigo">
              <ProductoDetalle onAgregar={handleAgregar} productos={listaProductos} cargando={catalogoCargando} error={errorCatalogo} />
            </Route>
            <Route path="/carrito">
              <Carrito
                carrito={carrito}
                sesion={sesion}
                productos={listaProductos}
                cargando={catalogoCargando}
                onCambiarCantidad={handleCambiarCantidad}
                onQuitar={handleQuitar}
                onVaciar={handleVaciar}
              />
            </Route>
            <Route path="/login">
              <Login onLogin={iniciarLocal} />
            </Route>
            {/* mi cuenta (punto 4): si nadie inició sesión, muestro el login */}
            <Route path="/cuenta">
              {sesion ? <Cuenta sesion={sesion} /> : <Login onLogin={iniciarLocal} />}
            </Route>
            <Route path="/register" component={Register} />
            <Route path="/contacto" component={Contacto} />
            {/* esta Route sin "path" atrapa cualquier dirección que no exista (página 404) */}
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </main>
      </div>
    </Router>
  );
}

export default App;
