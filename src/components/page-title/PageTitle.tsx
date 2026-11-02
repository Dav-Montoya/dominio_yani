// PageTitle.tsx: acá hice el título rosado que uso al comienzo de cada página.
// "animate__fadeIn" viene de animate.css (la misma librería que usaba antes) y hace que aparezca suavecito.
import type { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode; // el texto del título
  subtitulo?: string; // una frase chiquita debajo (opcional)
}

const PageTitle = ({ children, subtitulo }: PageTitleProps) => (
  <div className="mb-5 mt-2">
    <h2 className="animate__animated animate__fadeIn text-3xl font-extrabold text-rosa-500 drop-shadow-sm sm:text-4xl">
      {children}
    </h2>
    {subtitulo && <p className="mt-1 max-w-2xl font-semibold">{subtitulo}</p>}
  </div>
);

export default PageTitle;
