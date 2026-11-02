// validators.ts: acá puse todas las reglas de los formularios (login, registro y contacto).
// Regla simple que usé: cada función devuelve "" si está BIEN, o el mensaje del problema si está MAL.
// Así en los formularios solo muestro el mensaje si viene con texto.

// acá puse los dominios de correo permitidos.
// (En mi validaciones.js de antes esta lista nunca se había creado, por eso fallaba la validación del correo.)
export const DOMINIOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

export const validarCorreo = (correo: string): string => {
  const valor = correo.trim();
  if (!valor) return "El correo es obligatorio.";
  if (valor.length > 100) return "El correo no puede superar los 100 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return "Ingresa un correo con formato válido (ej: nombre@dominio.cl).";
  }
  const dominio = valor.split("@")[1].toLowerCase();
  if (!DOMINIOS_PERMITIDOS.includes(dominio)) {
    return `Solo se aceptan correos ${DOMINIOS_PERMITIDOS.map((d) => "@" + d).join(", ")}.`;
  }
  return "";
};

export const validarClave = (clave: string): string => {
  if (!clave) return "La contraseña es obligatoria.";
  if (clave.length < 4 || clave.length > 10) return "La contraseña debe tener entre 4 y 10 caracteres.";
  return "";
};

// la que uso para CREAR la cuenta: es la política del User Pool de Cognito
// (mínimo 8 caracteres con mayúscula, minúscula, número y símbolo).
// La validación local cumple la política ANTES de llamar al backend, así no
// llegamos a un error de Cognito por una clave débil (ej: falta el símbolo).
export const validarPassword = (clave: string): string => {
  if (!clave) return "La contraseña es obligatoria.";
  if (clave.length < 8 || clave.length > 64) {
    return "La contraseña debe tener entre 8 y 64 caracteres (mínimo del backend).";
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(clave)) {
    return "La contraseña debe incluir mayúscula, minúscula, número y símbolo (ej: Clave1234#).";
  }
  return "";
};

export const validarNombre = (nombre: string): string => {
  const valor = nombre.trim();
  if (!valor) return "El nombre es obligatorio.";
  if (valor.length > 100) return "Máximo 100 caracteres.";
  return "";
};

export const validarApellidos = (apellidos: string): string =>
  apellidos.trim() ? "" : "Los apellidos son obligatorios.";

export const validarComentario = (texto: string): string => {
  const valor = texto.trim();
  if (!valor) return "Cuéntanos algo antes de enviar.";
  if (valor.length > 500) return "Máximo 500 caracteres.";
  return "";
};

export const validarDireccion = (direccion: string): string =>
  direccion.trim() ? "" : "La dirección es obligatoria.";

export const validarSeleccion = (valor: string, mensaje: string): string => (valor ? "" : mensaje);

// acá calculo la edad y pido mínimo 13 años (igual que en mi registro de antes)
export const validarNacimiento = (fecha: string, hoy: Date = new Date()): string => {
  if (!fecha) return "Selecciona tu fecha de nacimiento.";
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad--;
  return edad < 13 ? "Debes tener al menos 13 años para registrarte." : "";
};

// me dice si en un objeto de errores hay al menos un mensaje (o sea, el formulario tiene fallas)
export const hayErrores = (errores: Record<string, string>): boolean =>
  Object.values(errores).some((mensaje) => mensaje !== "");
