# Donations API

Backend para la gestión de donaciones de la prueba técnica de **Fundación Futuro Verde**. Construido con NestJS, TypeORM y Stripe Checkout. Expone una API REST para crear donantes, donaciones y mensajes de contacto, e integra el flujo de pago con Stripe. Desplegado en **Render**; el frontend está en Vercel (`fundacion-futuro-verde`).

## Características

- **API REST** con prefijo global `api`
- **Validación automática de DTOs** mediante `class-validator` y `class-transformer`
- **Formato de respuesta estandarizado** `{ success, status, data }` a través de un interceptor global
- **Modelo de dominio alineado al enunciado**: Donor, Donation, Contact
- **Donaciones con estados** (`PENDING`, `COMPLETED`)
- **Integración con Stripe Checkout** (creación de sesión de pago + webhook)
- **Persistencia en PostgreSQL** con TypeORM y `autoLoadEntities`
- **Conexión a BD flexible**: usa `DATABASE_URL` (p. ej. al enlazar la BD en Render) o variables `DB_HOST`, `DB_PORT`, etc.
- **Documentación OpenAPI/Swagger** en `/api`

## Stack tecnológico

- NestJS 11
- TypeORM 0.3.x
- PostgreSQL
- Stripe Node SDK
- TypeScript

## Arquitectura

- `src/modules/donors`: gestión de donantes (creación y reutilización de donantes existentes)
- `src/modules/donations`: gestión de donaciones e integración con Stripe Checkout
- `src/modules/contacts`: recepción y consulta de mensajes de contacto
- `src/modules/integration/stripe`: módulo adaptador para Stripe (servicio + webhook)
- `src/common/interceptors/transform.interceptor.ts`: envoltura estándar de respuestas HTTP
- `src/config/database.config.ts`: configuración de TypeORM; acepta `DATABASE_URL` (p. ej. en Render) o variables `DB_HOST`, `DB_PORT`, etc.

## Requisitos previos

- Node.js 18+
- Base de datos PostgreSQL accesible
- Cuenta de Stripe (modo test)

## Configuración (.env)

El archivo `.env` no se sube al repositorio (está en `.gitignore`).

**Conexión a la base de datos:**

- Si existe **`DATABASE_URL`** (p. ej. al enlazar la BD en Render), la app la usa y no hace falta definir `DB_HOST`, etc.
- Si no hay `DATABASE_URL`, se usan **`DB_HOST`**, **`DB_PORT`**, **`DB_USERNAME`**, **`DB_PASSWORD`**, **`DB_NAME`**.

**Variables de entorno:**

```bash
NODE_ENV=development
DB_HOST=dpg-d6gv9794tr6s73bhn8d0-a
DB_PORT=5432
DB_USERNAME=donations_db_zorv_user
DB_PASSWORD=<password-de-tu-bd>
DB_NAME=donations_db_zorv
DB_SYNC=true
STRIPE_SECRET_KEY=<tu-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<tu-stripe-webhook-secret>
STRIPE_CURRENCY=usd
CORS_ORIGINS=https://fundacion-futuro-verde.vercel.app
PORT=3000
```

Sustituye los valores entre `< >` por los reales. En Render, configura estas mismas variables en **Environment** del Web Service (o enlaza la BD para que se inyecte `DATABASE_URL`).

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run start:dev
```

## Ejecución en producción

```bash
npm run build
npm run start:prod
```

El servidor se inicia por defecto en `http://localhost:3000` (o en el puerto definido en `PORT`), con la API y Swagger disponibles bajo el prefijo `/api`.

## Despliegue en Render

El backend se despliega como **Web Service** en Render; la base de datos es un **PostgreSQL** en la misma cuenta (enlazado o con variables manuales).

### 1. Subir cambios a GitHub

Render construye y despliega desde el repo. Para aplicar cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Luego se puede hacer **Manual Deploy** en el dashboard o dejar el deploy automático.

### 2. Base de datos

En Render: **New → PostgreSQL**. Anotar la **Internal Database URL** (o host, puerto, usuario, contraseña y nombre de BD). Opcionalmente **enlazar** esta BD al Web Service para que se inyecte `DATABASE_URL`.

### 3. Web Service

**New → Web Service**, conectar el repo (p. ej. `garfdev42/back-donations`).

### 4. Comandos

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:prod`

Importante: usar **`npm run start:prod`**, no `npm run start`. En plan free, `npm run start` (modo dev) puede provocar *heap out of memory* y que no se detecte el puerto.

### 5. Variables de entorno

En el Web Service → **Environment**:

- `NODE_ENV=production`
- Conexión a BD: o bien **enlazar la BD** (se inyecta `DATABASE_URL`) o bien definir `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `DB_SYNC=false` en producción (o `true` si quieres que TypeORM sincronice el esquema al arrancar)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY=usd`
- `CORS_ORIGINS=https://fundacion-futuro-verde.vercel.app`

Render inyecta `PORT`; no es obligatorio definirlo a mano.

### Resumen del flujo

Push a `main` → Render clona el repo → ejecuta el build → arranca con `npm run start:prod` → la app usa `PORT` y `DATABASE_URL` (o `DB_*`) para conectar a PostgreSQL.

## API de referencia

Base URL con prefijo global: `/api`

### Donors

- **POST** `/api/donors/create`

Body:

```json
{
  "identification": "123456789",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

Crea un nuevo donante o reutiliza uno existente con el mismo email.

### Donations

- **POST** `/api/donations/create` — crea una donación y devuelve la `paymentUrl` de Stripe

Body:

```json
{
  "identification": "123456789",
  "email": "user@example.com",
  "fullName": "John Doe",
  "amount": 50,
  "currency": "USD",
  "message": "Thanks!"
}
```

Respuesta:

```json
{
  "success": true,
  "status": 201,
  "data": {
    "donation": {
      "id": "uuid",
      "amount": 50,
      "currency": "USD",
      "status": "PENDING",
      "stripeSessionId": "cs_test_..."
    },
    "paymentUrl": "https://checkout.stripe.com/c/pay/..."
  }
}
```

- **GET** `/api/donations` — lista todas las donaciones
- **GET** `/api/donations/:id` — detalle de una donación por `id`

### Contacts

- **POST** `/api/contacts/create`

Body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "3000000000",
  "message": "I want to help"
}
```

- **GET** `/api/contacts` — lista todos los mensajes de contacto

### Stripe Webhook

- **POST** `/api/stripe/webhook`

Procesa eventos `checkout.session.completed` y marca la donación como `COMPLETED` utilizando el `stripeSessionId` asociado a la sesión de pago.

## Flujo de pago

1. El frontend llama a `POST /api/donations/create`.
2. La API crea la donación con estado `PENDING` y devuelve la `paymentUrl` de Stripe.
3. El frontend redirige al usuario a `paymentUrl`.
4. Stripe envía el evento `checkout.session.completed` al webhook configurado.
5. La API marca la donación como `COMPLETED`.

## Buenas prácticas aplicadas

- Validación y tipado de DTOs
- Respuestas consistentes y tipadas
- Separación por módulos y responsabilidades claras
- No exposición de datos sensibles en mensajes de error
- Manejo de conflictos de identidad/correo en donantes

## Seguridad

- No subir `.env` ni secretos al repositorio
- Posibilidad de validar la firma del webhook mediante `STRIPE_WEBHOOK_SECRET`
- Uso de HTTPS en entornos de producción

## Scripts

- `npm run start:dev` — entorno de desarrollo
- `npm run build` — compilación a JavaScript
- `npm run start:prod` — ejecución en producción
- `npm run lint` — análisis estático de código
- `npm run test` — ejecución de tests unitarios

## Troubleshooting

- Para probar el webhook de Stripe en local, asegure que el endpoint sea accesible públicamente o utilice Stripe CLI para reenviar eventos hacia `http://localhost:<PORT>/api/stripe/webhook`.

## Licencia

Unlicensed
