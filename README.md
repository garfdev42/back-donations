# Donations API

Backend para la gestión de donaciones de la prueba técnica de **Fundación Futuro Verde**.  
Está construido con NestJS, TypeORM y Stripe Checkout, expone endpoints REST para crear donantes, donaciones y mensajes de contacto e integra un flujo de pago seguro con Stripe.

## Características

- **API REST** con prefijo global `api`
- **Validación automática de DTOs** mediante `class-validator` y `class-transformer`
- **Formato de respuesta estandarizado** `{ success, status, data }` a través de un interceptor global
- **Modelo de dominio alineado al enunciado**: Donor, Donation, Contact
- **Donaciones con estados** (`PENDING`, `COMPLETED`)
- **Integración con Stripe Checkout** (creación de sesión de pago + webhook)
- **Persistencia en PostgreSQL** usando TypeORM con `autoLoadEntities`
- **Documentación OpenAPI/Swagger** disponible en `/api`

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

El archivo `.env` no debe subirse al repositorio (está en `.gitignore`).

**Conexión a base de datos:** la app admite dos formas:

- **`DATABASE_URL`**: si está definida (p. ej. al enlazar la BD en Render), se usa esta URL y no hacen falta `DB_HOST`, etc.
- **Variables sueltas**: si no hay `DATABASE_URL`, se usan `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`.

Variables necesarias:

```bash
NODE_ENV=development
DB_HOST=dpg-d6gv9794tr6s73bhn8d0-a
DB_PORT=5432
DB_USERNAME=donations_db_zorv_user
DB_PASSWORD=<tu-password-de-render>
DB_NAME=donations_db_zorv
DB_SYNC=true
STRIPE_SECRET_KEY=<tu-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<tu-stripe-webhook-secret>
STRIPE_CURRENCY=usd
CORS_ORIGINS=https://fundacion-futuro-verde.vercel.app
PORT=3000
```

Sustituye `<tu-password-de-render>` y `<tu-stripe-*>` por los valores reales. En Render (u otro host), configura las mismas variables en el panel de Environment del servicio.

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

1. **Subir el código a GitHub**  
   El Web Service de Render despliega desde el repositorio. Después de cambiar código:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```
   Render puede hacer deploy automático al detectar el push, o puedes lanzar un **Manual Deploy** desde el dashboard.

2. **Crear la base de datos**  
   En Render: New → PostgreSQL, crear la instancia y anotar host, puerto, base de datos, usuario y contraseña (o la Internal Database URL).

3. **Crear el Web Service**  
   New → Web Service, conectar el repo de GitHub (p. ej. `garfdev42/back-donations`).

4. **Comandos de build y arranque**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`  
   No uses `npm run start` (modo dev): en el plan free puede provocar *heap out of memory* y no abre puerto.

5. **Variables de entorno**  
   En el Web Service → **Environment**, añadir (con los valores reales de tu BD y Stripe):
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`  
     **O bien** enlazar la base de datos al servicio en Render para que se inyecte `DATABASE_URL` (la app la usa automáticamente).
   - `DB_SYNC=false` en producción (o `true` solo para que TypeORM cree/actualice tablas al arrancar).
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY=usd`
   - `CORS_ORIGINS=https://fundacion-futuro-verde.vercel.app`  
   El puerto lo define Render con `PORT`; no hace falta ponerlo si Render lo inyecta.

**Resumen:** push a `main` → Render clona, ejecuta build y luego `npm run start:prod`; la app lee `PORT` y las variables de entorno (incl. `DATABASE_URL` o `DB_*`) para conectar a PostgreSQL y Stripe.

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
