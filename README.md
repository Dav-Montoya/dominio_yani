# Proyecto_Fullstack_II
# Tienda Online Secret Sweet Maid

## 1. Información del proyecto

**Proyecto:** Tienda Online Secret Sweet Maid  
**Asignatura:** DSY1104 - Desarrollo Fullstack II  
**Evaluación:** Evaluación Parcial N°1  
**Tecnologías principales:** React, Vite, Wouter, Tailwind CSS y TypeScript  
**Repositorio:** GitHub

---

## 2. Descripción del proyecto

El proyecto consiste en el desarrollo de una tienda online frontend para
Secret Sweet Maid, orientada a la presentación y comercialización de
productos relacionados con la identidad de la comunidad.

La aplicación busca implementar una interfaz web funcional, accesible y
responsiva, utilizando React, TypeScript y Tailwind CSS.

El desarrollo considera la creación de distintas vistas para permitir la
navegación del usuario, visualización de productos, registro e inicio de
sesión, contacto y gestión de un carrito de compras.

Esta primera versión corresponde a la Evaluación Parcial N°1, por lo que
el proyecto constituye una base para el desarrollo de funcionalidades
posteriores.

---

## 3. Objetivos

### Objetivo general

Desarrollar una tienda online frontend utilizando React, TypeScript y Tailwind CSS,
aplicando buenas prácticas de estructura HTML, diseño mediante CSS,
validación de formularios con JavaScript y control de versiones mediante
Git y GitHub.

### Objetivos específicos

- Implementar páginas web utilizando HTML5 semántico.
- Crear una navegación funcional entre las distintas vistas.
- Desarrollar un diseño personalizado mediante CSS externo.
- Implementar un diseño responsivo para diferentes tamaños de pantalla.
- Validar formularios mediante HTML y JavaScript.
- Mostrar mensajes de error y sugerencias personalizados.
- Generar el catálogo de productos mediante JavaScript.
- Implementar un carrito de compras utilizando LocalStorage.
- Aplicar una metodología de trabajo colaborativo mediante Git y GitHub.

---

## 4. Requerimientos funcionales

Los principales requerimientos funcionales considerados para esta versión
del proyecto son los siguientes:

### RF01 - Navegación

El sistema debe permitir navegar entre las diferentes páginas mediante
hipervínculos funcionales.

### RF02 - Página de inicio

La página principal debe presentar información de la tienda, elementos
visuales y productos destacados.

### RF03 - Catálogo de productos

El sistema debe permitir visualizar un listado de productos, mostrando
información como:

- Imagen.
- Nombre.
- Precio.
- Opción para añadir al carrito.

Los productos serán gestionados mediante un arreglo de objetos en
JavaScript.

### RF04 - Detalle de producto

El usuario podrá acceder al detalle de un producto y visualizar
información adicional, además de disponer de la opción para añadirlo al
carrito.

### RF05 - Registro de usuario

El sistema debe disponer de un formulario de registro de usuario,
implementando las validaciones correspondientes mediante JavaScript.

### RF06 - Inicio de sesión

El sistema debe disponer de un formulario de inicio de sesión con
validaciones para correo electrónico y contraseña.

### RF07 - Contacto

El sistema debe disponer de un formulario de contacto para que el usuario
pueda enviar información mediante un formulario validado.

### RF08 - Carrito de compras

El usuario podrá:

- Añadir productos al carrito.
- Visualizar los productos seleccionados.
- Modificar cantidades.
- Eliminar productos.

La información del carrito será almacenada mediante LocalStorage.

### RF09 - Validación de formularios

Los formularios deberán incorporar validaciones que permitan evitar el
ingreso de información incorrecta o incompleta.

Las validaciones deberán generar mensajes claros y personalizados para
orientar al usuario.

---

## 5. Requerimientos no funcionales

### RNF01 - HTML semántico

Las páginas utilizarán una estructura HTML semántica, considerando
elementos como:

- `<header>`
- `<nav>`
- `<main>`
- `<section>`
- `<article>`
- `<footer>`

### RNF02 - Diseño mediante CSS externo

Los estilos serán definidos en archivos CSS externos para facilitar el
mantenimiento y mantener una apariencia consistente entre las páginas.

### RNF03 - Diseño responsivo

La interfaz deberá adaptarse a diferentes tamaños de pantalla,
considerando computadores, tablets y dispositivos móviles.

### RNF04 - Usabilidad

Los formularios deberán entregar mensajes de error y sugerencias claras
para facilitar la interacción del usuario.

### RNF05 - Control de versiones

El desarrollo utilizará Git y GitHub para mantener un historial de cambios,
organizar el trabajo y facilitar la colaboración entre los integrantes
del equipo.

---

## 6. Tecnologías y herramientas

| Tecnología / herramienta | Uso |
|---|---|
| React | Interfaz hecha con componentes reutilizables |
| TypeScript | Código con tipos, para detectar errores antes de ejecutar |
| Vite | Servidor de desarrollo y compilación del proyecto |
| Wouter | Navegación entre las páginas (rutas) |
| Tailwind CSS | Diseño, estilos y adaptación responsiva |
| animate.css | Animaciones de entrada de los títulos |
| LocalStorage | Persistencia del carrito, la sesión y las cuentas registradas |
| Vitest | Pruebas automáticas de las validaciones y el carrito |
| oxlint | Revisión de la calidad del código |
| Git | Control de versiones |
| GitHub | Repositorio remoto y colaboración |
| Visual Studio Code | Editor de código |

---|---|
| HTML5 | Estructura y semántica del sitio web |
| CSS3 | Diseño, estilos y adaptación responsiva |
| JavaScript | Validaciones, productos y carrito |
| LocalStorage | Persistencia de información del carrito |
| Git | Control de versiones |
| GitHub | Repositorio remoto y colaboración |
| Visual Studio Code | Editor de código |

---

## 7. Estructura de navegación

La propuesta de navegación considera las siguientes vistas:

```text
Inicio
│
├── Productos
│   └── Detalle de producto
│
├── Registro
│
├── Iniciar sesión
│
├── Nosotros
│
├── Blogs
│   ├── Detalle blog 1
│   └── Detalle blog 2
│
└── Contacto
```

En la versión React las rutas son: `/`, `/productos`, `/productos/:codigo`,
`/carrito`, `/login`, `/register` y `/contacto` (más una página 404).

---

## 8. Cómo ejecutar el proyecto

```bash
npm install      # solo la primera vez: descarga las librerías
npm run dev      # abre la tienda en http://localhost:5173
```

Otros comandos: `npm run build` (compila para entregar), `npm run lint`
(revisa el código) y `npm test` (corre las pruebas automáticas).

Usuario administrador de prueba: `admin@gmail.com` con contraseña `1234`.

---

## 9. Estructura del proyecto

```text
src/
├── main.tsx            Punto de entrada: conecta React con el index.html
├── App.tsx             Rutas + estado del carrito y de la sesión
├── index.css           Colores, fondo y estilos globales (Tailwind)
├── data/               Lista de productos y de regiones/comunas
├── utils/              Carrito, validaciones, RUN, LocalStorage y sesión (con pruebas)
├── components/         Piezas reutilizables (menú, tarjeta de producto, campos...)
└── pages/              Una carpeta por página (home, productos, carrito, login...)
public/imgs/            Imágenes de la tienda (en formato .webp)
```

Más detalle en `ESQUEMA.md`.

---

## Novedades (sitio integral de la comunidad)

- **Nuevas páginas:** `/historia`, `/maids`, `/eventos` (la merch sigue en `/productos`, ahora llamada "Nuestra Merch"). El filtro de merch acepta `/productos?maid=shikku`.
- **Datos aparte del código:** `src/data/historia.ts`, `maids.ts`, `eventos.ts` (solo con información de la página oficial; no inventé nada).
- **Rescatado de la rama `feature-conectar-api`:** `src/services/api.ts` (ordenado y con errores revisados), la idea de `useAuth` (ahora `src/hooks/useSesion.ts`, que sirve en modo local y en modo Cognito) y la configuración de OIDC en `main.tsx` (ahora con variables de entorno, sin datos escritos a mano). El `login-page.tsx` de ejemplo de Cognito **no** se copió: era un ejemplo suelto que mostraba los tokens en pantalla.
- **Dependencias agregadas (justificadas):** `oidc-client-ts` y `react-oidc-context`, solo para el login con Cognito. Sin variables de entorno no se activan.

### Qué es local, qué es real y qué está preparado
| Funcionalidad | Estado |
|---|---|
| Catálogo, carrito, registro, login, contacto | Local (LocalStorage), de demostración |
| Login con Amazon Cognito | Implementado, **no probado** (requiere AWS) |
| Indicador de servidor, `api.ts` | Preparado; requiere `VITE_API_URL` y un backend |
| `login`/`register`/`logout` de `api.ts` | Preparados, **no usados ni comprobados** |

Ver `DESPLIEGUE.md` y `.env.example`.
