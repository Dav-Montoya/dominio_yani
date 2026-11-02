// Photo.tsx: acá hice la imagen que uso en toda la tienda.
// La hice aparte porque si un archivo no existe, en vez de mostrar la imagen rota
// muestra un cuadrito rosado que me dice cuál archivo falta (así lo encuentro rápido).
import { useState } from "react";

interface PhotoProps {
  src: string; // ruta de la imagen, por ejemplo "/imgs/aimi.webp"
  alt: string; // descripción corta de la foto (sirve para accesibilidad)
  className?: string; // acá le paso el tamaño y la forma
  contener?: boolean; // true = la foto se ve completa; false = se recorta para llenar el espacio
}

const Photo = ({ src, alt, className = "", contener = false }: PhotoProps) => {
  // acá guardo si la imagen falló al cargar
  const [fallo, setFallo] = useState(false);

  if (fallo) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid place-content-center gap-1 bg-rosa-100 p-2 text-center ${className}`}
      >
        <span className="text-3xl">🎀</span>
        <span className="text-[11px] font-semibold text-rosa-500">Falta: public{src}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`${contener ? "object-contain" : "object-cover"} ${className}`}
    />
  );
};

export default Photo;
