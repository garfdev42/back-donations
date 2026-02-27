# Donations API

Backend para gestión de donaciones construido con NestJS, TypeORM y Stripe Checkout. Expone endpoints REST para crear donantes, donaciones y mensajes de contacto, e integra un flujo de pago seguro con Stripe.

## Características

- API REST con prefijo global `api`
- Validación automática de DTOs
- Formato de respuesta estandarizado `{ success, status, data }`
- Donaciones con estado (`PENDING`, `COMPLETED`)
- Integración con Stripe Checkout (URL de pago + Webhook)
- Persistencia en PostgreSQL con TypeORM

## Stack Tecnológico

- NestJS 11
- TypeORM 0.3.x
- PostgreSQL
- Stripe Node SDK
- TypeScript

## Arquitectura

- `src/modules/donors`: gestión de donantes
- `src/modules/donations`: gestión de donaciones e integración con Stripe
- `src/modules/contacts`: recepción de mensajes de contacto
- `src/modules/integration/stripe`: módulo adaptador para Stripe (servicio + webhook)
- `src/common/interceptors/transform.interceptor.ts`: envoltura de respuestas

## Requisitos Previos

- Node.js 18+
- PostgreSQL accesible
- Cuenta de Stripe (modo test)

## Configuración (.env)

Defina estas variables en `.env`:

```
NODE_ENV=development
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SYNC=true

STRIPE_SECRET_KEY=
STRIPE_CURRENCY=usd
STRIPE_WEBHOOK_SECRET=
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run start:dev
```

Producción:

```bash
npm run build
npm run start:prod
```

## API de Referencia

Base URL con prefijo: `/api`

### Donors

- POST `/api/donors/create`

Body:

```json
{
  "identification": "123456789",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

### Donations

- POST `/api/donations/create` — crea donación y devuelve `paymentUrl` de Stripe

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

- GET `/api/donations` — lista donaciones
- GET `/api/donations/:id` — detalle

### Contacts

- POST `/api/contacts/create`

Body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "3000000000",
  "message": "I want to help"
}
```

### Stripe Webhook

- POST `/api/stripe/webhook`

Procesa `checkout.session.completed` y marca la donación como `COMPLETED` usando `stripeSessionId`.

## Flujo de Pago

1. Cliente llama a `POST /api/donations/create`
2. API crea la donación (`PENDING`) y devuelve `paymentUrl`
3. Frontend redirige a `paymentUrl`
4. Stripe envía `checkout.session.completed` al webhook
5. API marca la donación como `COMPLETED`

## Buenas Prácticas Aplicadas

- Validación y tipado de DTOs
- Respuestas consistentes
- Separación por módulos y responsabilidades
- No exposición de datos sensibles en mensajes de error
- Control de conflictos de identidad y correo en donantes

## Seguridad

- No subir `.env` ni secretos
- Validar firma del webhook con `STRIPE_WEBHOOK_SECRET`
- Usar HTTPS en producción

## Scripts

- `npm run start:dev` — desarrollo
- `npm run build` — compilar
- `npm run start:prod` — producción
- `npm run lint` — lint
- `npm run test` — tests

## Troubleshooting

- Webhook de Stripe: asegure que el endpoint sea accesible públicamente o use Stripe CLI para reenviar eventos en local.

## Licencia

Unlicensed
