# Pagos con Blink (Bitcoin / Lightning)

Los hosts pueden recibir sus transferencias en **Bitcoin** o **USD (Stablesats)** vía Lightning usando Blink.

## Configuración en el servidor

1. **Cuenta y API Key** en [Blink](https://es.blink.sv/en/api). Dashboard: [dashboard.blink.sv/api-keys](https://dashboard.blink.sv/api-keys).
2. Crear una **API Key** con alcance adecuado (p. ej. **WRITE** para enviar pagos). La clave **solo se muestra una vez**; guardarla en un gestor de secretos.
3. Variable de entorno en el backend:
   - `BLINK_API_KEY=blink_...` (el token completo que entrega el dashboard)

## Qué acepta el backend

### POST /api/v1/payments y PUT /api/v1/payments/:userId/:accountId

Cuando el método de pago es Blink:

- **Obligatorio:** `payment_method: "blink"`, `blink_wallet_address` (dirección Lightning o wallet ID, ej. `usuario@blink.sv`).
- **Opcional:** `email` (contacto).
- **No se exigen** `bank_name`, `account_type`, `account_number`, `holder_name` para método Blink.

Ejemplo de body para crear/actualizar cuenta Blink:

```json
{
  "payment_method": "blink",
  "blink_wallet_address": "usuario@blink.sv",
  "email": "host@ejemplo.com",
  "user_id": "<id_del_usuario>"
}
```

Para métodos que no son Blink (banco, PayPal, etc.) se siguen requiriendo los campos bancarios habituales.

## Enviar transferencias (payouts) a un host con Blink

Para pagar a un host que tiene `payment_method === "blink"`:

1. Obtener su `blink_wallet_address` (y opcionalmente `email`) de la cuenta de pago guardada.
2. Usar la **API de Blink** con `BLINK_API_KEY` para enviar el pago a esa dirección.

### Documentación Blink

- **Autenticación:** header `X-API-KEY` con el valor de `BLINK_API_KEY`.
- **Endpoint GraphQL:** `https://api.blink.sv/graphql` (mainnet) o `https://api.staging.blink.sv/graphql` (staging).
- **Enviar BTC (Lightning):** [Send BTC over Lightning](https://dev.blink.sv/api/btc-ln-send) — mutación `lnAddressPaymentSend` para enviar a una Lightning Address; cantidad en **satoshis**.
- **Enviar USD Stablesats (Lightning):** [Send USD over Lightning](https://dev.blink.sv/api/usd-ln-send) — misma mutación `lnAddressPaymentSend` usando el wallet USD; cantidad en **centavos**.

Ejemplo de uso desde el backend (envío a Lightning Address):

- **BTC:** `lnAddressPaymentSend` con `input: { walletId: "<BTC_WALLET_ID>", lnAddress: "<blink_wallet_address>", amount: <satoshis> }`.
- **USD:** mismo esquema con el wallet USD y `amount` en centavos.

El servicio `src/services/blink-service.ts` centraliza estas llamadas usando `BLINK_API_KEY`.

## Checkout: pagar con Blink (cliente) — factura + QR

El backend **crea una factura** en la API de Blink ([Receive BTC](https://dev.blink.sv/api/btc-ln-receive), [Receive USD](https://dev.blink.sv/api/usd-ln-receive)) y devuelve el **QR generado** y la **factura LN** para copiar. El cliente escanea el QR o pega la factura en Blink y paga el monto ya fijado.

### POST /api/v1/TransaccionCompra/blink

- **Body:**
  - `total` (obligatorio): monto en USD (ej. 25). Se crea factura Stablesats en centavos.
  - `amountSats` (opcional): si se envía, se crea factura en BTC por esa cantidad y se ignora `total`.
  - Resto (email, firstName, etc.): opcionales.
- **Respuesta (200):**
  ```json
  {
    "paymentRequest": "lnbc...",
    "idTransaccion": "<paymentHash>",
    "amount": 25
  }
  ```
  - **paymentRequest:** factura Lightning (BOLT11) para copiar y pegar en Blink u otra wallet.
  - **idTransaccion:** paymentHash para asociar la reserva o consultar estado.
  - **amount:** monto (USD o sats según el tipo de factura).
- Requiere **BLINK_API_KEY** en el servidor (la factura se crea en la cuenta de esa API Key).

## Cómo probar hoy

### 1. Migración y variable de entorno

```bash
# Aplicar migración (añade blink_wallet_address y hace opcionales los campos bancarios)
npm run dz:mig

# En .env debe estar (con el valor que te dio el dashboard de Blink):
# BLINK_API_KEY=blink_...
```

### 2. Probar crear una cuenta de pago Blink (API)

La ruta **POST /api/v1/payments** exige autenticación Clerk y rol **host**.

1. Arranca el servidor: `npm run dev`
2. Obtén un **token de Clerk** de un usuario que sea host (desde tu frontend, Clerk Dashboard, o Postman con el flujo que uses).
3. Envía una petición:

**POST** `http://localhost:3002/api/v1/payments`  
**Headers:** `Authorization: Bearer <tu_token_clerk>`  
**Content-Type:** `application/json`  
**Body:**

```json
{
  "payment_method": "blink",
  "blink_wallet_address": "tu_usuario@blink.sv",
  "email": "tu@email.com",
  "user_id": "<mismo_user_id_de_clerk_del_host>"
}
```

`user_id` debe ser el ID de usuario (Clerk) del host que está autenticado, y debe existir en la tabla `users`. Si la respuesta es 201, la cuenta Blink quedó guardada.

**Postman (cuenta Blink del host):**  
- **POST** `http://localhost:3002/api/v1/payments`  
- **Headers:** `Authorization: Bearer <token_clerk_host>`, `Content-Type: application/json`  
- **Body (raw JSON):**  
  `{ "payment_method": "blink", "blink_wallet_address": "tu@blink.sv", "email": "host@ejemplo.com", "user_id": "<clerk_user_id_del_host>" }`  
El token debe ser de un usuario con rol **host** en Clerk.

4. Listar cuentas del usuario: **GET** `http://localhost:3002/api/v1/payments/user/<userId>` con el mismo `Authorization`.

### 3. Probar checkout Blink (factura)

**POST** `http://localhost:3002/api/v1/TransaccionCompra/blink`  
**Body:** `{ "total": 25 }`

Respuesta: `paymentRequest` (factura LN para copiar), `idTransaccion`, `amount`. El frontend puede generar el QR a partir de `paymentRequest` y mostrar un botón "Copiar factura".

### 4. Probar envío real a host (payout, opcional)

Solo si quieres probar un envío real (mainnet o staging), desde tu código puedes llamar a `sendBtcToLightningAddress` o `sendUsdToLightningAddress` de `src/services/blink-service.ts` con una cantidad pequeña y una dirección que controles. Para staging usa `BLINK_GRAPHQL_URL=https://api.staging.blink.sv/graphql` en `.env`.

---

## Referencias

- [Blink API (es)](https://es.blink.sv/en/api)
- [Blink Developer Documentation](https://dev.blink.sv/)
- [Blink Dashboard – API Keys](https://dashboard.blink.sv/api-keys)
