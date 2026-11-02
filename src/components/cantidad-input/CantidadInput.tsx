// CantidadInput.tsx: acá hice la cajita para elegir cantidades (la uso en el detalle y en el carrito).
// La hice aparte porque con un input normal, al borrar el número se quedaba pegado en 1
// y no se podía escribir bien (por ejemplo, para poner 5 quedaba "15").
import { useState } from "react";

interface CantidadInputProps {
  id: string;
  valor: number; // la cantidad real, que viene de afuera
  max: number; // no dejo pasar del stock
  onCambio: (cantidad: number) => void;
}

const CantidadInput = ({ id, valor, max, onCambio }: CantidadInputProps) => {
  // "editando" guarda lo que se está escribiendo mientras la caja está seleccionada.
  // Si es null, muestro la cantidad real. Así puedo dejar la caja vacía un momento mientras escribo.
  const [editando, setEditando] = useState<string | null>(null);

  const handleChange = (texto: string) => {
    const numero = parseInt(texto, 10);
    if (isNaN(numero) || numero < 1) {
      setEditando(texto); // todavía no es una cantidad válida, solo dejo que siga escribiendo
      return;
    }
    const limitado = Math.min(numero, max); // si se pasa del stock, lo bajo al máximo
    setEditando(String(limitado));
    onCambio(limitado);
  };

  return (
    <input
      id={id}
      type="number"
      min={1}
      max={max}
      value={editando ?? String(valor)}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => setEditando(null)} // al salir de la caja vuelvo a mostrar la cantidad real
      className="entrada w-20"
    />
  );
};

export default CantidadInput;
