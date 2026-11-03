// Field.tsx: acá hice un campo de formulario completo (etiqueta + caja + mensaje de error).
// Lo uso para escribir texto, para listas desplegables (select) y para cajas grandes (textarea),
// así no tengo que repetir el mismo bloque en login, registro y contacto.
import { useState } from "react";

interface Opcion {
  valor: string;
  etiqueta: string;
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void; // me avisa el valor nuevo cada vez que cambia
  error?: string; // si trae texto, pinto el campo de error
  type?: string; // text, email, password, date...
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
  ayuda?: string; // texto de ayuda que se ve solo mientras el campo está seleccionado
  multilinea?: boolean; // true = caja grande (textarea)
  opciones?: Opcion[]; // si lo paso, el campo se transforma en una lista desplegable (select)
  textoOpcionVacia?: string; // la primera opción de la lista, ej: "Selecciona una región"
  deshabilitado?: boolean;
}

const Field = ({
  id, label, value, onChange, error, type = "text", placeholder, maxLength, autoComplete,
  ayuda, multilinea = false, opciones, textoOpcionVacia = "Selecciona una opción", deshabilitado = false,
}: FieldProps) => {
  // acá guardo si el campo está seleccionado, para mostrar la ayuda solo en ese momento
  const [enfocado, setEnfocado] = useState(false);
  // para los campos de contraseña (type="password"): el ojito 👁/🙈 alterna entre
  // ocultar los puntos y mostrar el texto completo (mejora de legibilidad que pidió
  // la usuaria: revisar lo que se escribió antes de enviar)
  const [contrasenaVisible, setContrasenaVisible] = useState(false);
  const esContrasena = type === "password";
  const tipoReal = esContrasena && contrasenaVisible ? "text" : type;

  // estas propiedades son iguales para input, textarea y select, por eso las junto
  const comunes = {
    id,
    value,
    disabled: deshabilitado,
    onFocus: () => setEnfocado(true),
    onBlur: () => setEnfocado(false),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: `entrada ${error ? "border-rosa-500 bg-rose-50" : ""}`,
  };

  return (
    <div className="mb-4 flex flex-col">
      <label htmlFor={id} className="mb-1 text-sm font-bold">
        {label}
      </label>

      {opciones ? (
        <select {...comunes} onChange={(e) => onChange(e.target.value)}>
          <option value="">{textoOpcionVacia}</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      ) : multilinea ? (
        <textarea
          {...comunes}
          // caja de tamaño FIJO: resize-none le quita el tirador de la esquina,
          // así el usuario no la agranda ni la achica; si el texto no entra,
          // el navegador muestra la scroll bar normal y no deforma el panel
          className={`${comunes.className} resize-none`}
          rows={5}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : esContrasena ? (
        // input de contraseña con el ojito de "mostrar/ocultar" al lado
        <div className="relative">
          <input
            {...comunes}
            type={tipoReal}
            maxLength={maxLength}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${comunes.className} pr-11`}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setContrasenaVisible((v) => !v)}
            aria-label={contrasenaVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-lg leading-none text-ciruela/70 hover:bg-rose-50"
          >
            {contrasenaVisible ? "🙈" : "👁"}
          </button>
        </div>
      ) : (
        <input
          {...comunes}
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {ayuda && enfocado && <small className="mt-1 text-xs text-ciruela/70">{ayuda}</small>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
