# Despliegue y conexión con AWS (guía)

> Estado honesto del proyecto: el **frontend** funciona completo en modo local (LocalStorage).
> La conexión con **Amazon Cognito** está implementada pero **no la pude probar** (necesita tu cuenta de AWS).
> El **backend Java** no está en este repositorio, así que **no está conectado ni verificado**.

## 1. Qué hace falta hacer "afuera" (en AWS), según los videos del profe
Estos pasos son el esquema general; confírmalos con los videos (cloud aws, cognito, api gateway, integración cognito y react):

1. **Cognito → User pool**: crear el grupo de usuarios (login por correo).
2. **App client** del user pool: tipo público (sin secreto), flujo *Authorization code*, scopes `openid`, `email`, `phone`.
3. **Callback URL y Sign-out URL** del app client: agregar `http://localhost:5173` (para probar) y la dirección real donde se publique el frontend.
4. **Dominio de Cognito** (Hosted UI): es la pantalla de login/registro que abre el botón "Ingresar o crear cuenta con Cognito".
5. (Opcional) crear el grupo `Admin` en el user pool: la tienda reconoce a esas personas como administradoras.
6. **API Gateway** con autorizador de Cognito, si el backend va detrás de él.

## 2. Activar Cognito en el frontend
1. Copiar `.env.example` como `.env.local`.
2. Completar `VITE_OIDC_AUTHORITY` y `VITE_OIDC_CLIENT_ID` (y, si quieres, `VITE_OIDC_REDIRECT_URI` y `VITE_COGNITO_DOMAIN`).
   Los valores que usaba la rama `feature-conectar-api` estaban escritos en su `main.tsx`; se pueden copiar de ahí.
3. `npm run dev` y abrir `/login`: aparece el botón de Cognito.
4. Sin esas variables todo sigue en modo local.

## 3. Despliegue del backend Java en EC2 (pasos del profe, ordenados)

### Primer despliegue
1. Generar el `.jar` en tu computador.
2. Subir el archivo `.env` a la instancia EC2.
3. Cargar las variables **exportándolas** (con `source .env` solo, Java no las recibe si las líneas no empiezan con `export`):
   `set -a; source .env; set +a`
4. Bajar cualquier proceso que esté usando el puerto 8080.
5. Instalar Java 21 en la instancia.
6. Subir el `.jar` a la instancia.
7. Ejecutar el `.jar` (`java -jar archivo.jar`).
8. Verificar que el grupo de seguridad de la instancia permita el puerto 8080.

### Para actualizar
Repetir el paso 4, borrar el `.jar` anterior de la instancia, generar el nuevo `.jar` y repetir los pasos 6 y 7.

> Nunca subir el `.env` a GitHub.

## 4. Conectar el frontend al backend
- Poner `VITE_API_URL` en `.env.local`. El pie de página mostrará "Servidor conectado" o "Servidor sin conexión" (usa `GET /health`).
- `src/services/api.ts` ya envía el token como `Authorization: Bearer ...`. Los métodos `login`, `register` y `logout` apuntan a `/auth/login`, `/auth/registro` y `/auth/logout`, que **no están comprobados**.
- Si el backend da error de CORS, hay que permitir el origen del frontend en el backend.
