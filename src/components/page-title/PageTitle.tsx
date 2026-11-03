// PageTitle.tsx: acá hice el título rosado que uso al comienzo de cada página.
// "animate__fadeIn" viene de animate.css (la misma librería que usaba antes) y hace que aparezca suavecito.
// C_textos: los estilos para que el título y el subtitulo se aprecien sobre el fondo de listones
// están en index.css (.titulo-pagina y .subtitulo-pagina), así todas las páginas quedan iguales.
import type { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode; // el texto del título
  subtitulo?: string; // una frase chiquita debajo (opcional)
}

const PageTitle = ({ children, subtitulo }: PageTitleProps) => (
  <div className="mb-5 mt-2">
    <h2 className="titulo-pagina animate__animated animate__fadeIn text-3xl font-extrabold text-rosa-500 sm:text-4xl">
      {children}
    </h2>
    {subtitulo && <p className="subtitulo-pagina mt-2">{subtitulo}</p>}
  </div>
);

export default PageTitle;
