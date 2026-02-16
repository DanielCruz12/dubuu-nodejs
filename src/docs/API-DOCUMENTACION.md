# Cómo documentar la API (Swagger / OpenAPI)

La API se documenta con **Swagger (OpenAPI 3.0)** y se sirve en:

- **URL:** `http://localhost:3002/api-docs` (con el servidor en marcha)

## Dónde se genera la doc

- **Archivos que se escanean:** `src/routes/v1/*.ts`
- **Configuración:** `src/swagger.ts` (título, servidor, etc.)

Cada ruta que quieras documentar debe tener un bloque JSDoc con la etiqueta `@openapi` en el mismo archivo donde defines la ruta.

## Patrón para documentar un endpoint

En el archivo de rutas (por ejemplo `panel-routes.ts`, `booking-routes.ts`), justo **encima** del `router.get/post/put/delete(...)` correspondiente, añade un comentario así:

```ts
/**
 * @openapi
 * /api/v1/panel/summary:
 *   get:
 *     tags: [Panel]
 *     summary: Resumen completo del panel
 *     description: Explica qué devuelve y para quién (ej. datos del host).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: "ID del host" }
 *     responses:
 *       200: { description: Objeto con el resumen }
 *       400: { description: "userId es obligatorio en el body" }
 */
router.get('/summary', getSummary)
```

## Reglas útiles

1. **Path:** Usa la ruta completa que usa el cliente: `/api/v1/<recurso>/<accion>` (por ejemplo `/api/v1/panel/summary`, `/api/v1/bookings/user/:userId`).
2. **tags:** Agrupa por recurso (`[Panel]`, `[Bookings]`, `[Users]`, etc.) para que en Swagger UI queden agrupados.
3. **requestBody:** Si el endpoint recibe body, descríbelo con `schema` y `required`.
4. **params:** Si usas `:id` o `:userId` en la URL, documéntalos en `parameters` (in: path).
5. **responses:** Indica al menos 200 y los códigos de error típicos (400, 401, 404, 500).

## Ejemplo con parámetros en la URL

```yaml
# @openapi
# /api/v1/bookings/user/{userId}:
#   get:
#     tags: [Bookings]
#     summary: Reservas de un usuario
#     parameters:
#       - in: path
#         name: userId
#         required: true
#         schema:
#           type: string
#     responses:
#       200: { description: Lista de reservas }
#       400: { description: ID obligatorio }
```

## Ver la documentación

1. Arranca el servidor: `npm run dev`
2. Abre en el navegador: `http://localhost:3002/api-docs`
3. Ahí puedes probar los endpoints (envía body, params, etc.) desde la misma interfaz.

## Referencia

- [OpenAPI 3.0](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) (comentarios JSDoc → OpenAPI)
