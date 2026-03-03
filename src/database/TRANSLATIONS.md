# Traducciones: flujo y tablas

## ¿Dónde se hace? (Backend vs front)

**Todo el flujo de idioma y traducción se hace en el backend.** El front solo envía los datos del producto (nombre, descripción, dirección) en el idioma que sea (español o inglés). La API:

1. Detecta el idioma del texto (Google Detect).
2. Crea el producto en `products`.
3. Guarda en `product_translations` el contenido recibido (en el idioma detectado).
4. Traduce a los demás idiomas habilitados (por ahora `es` y `en`) y guarda una fila por idioma.

Así el front no necesita enviar `locale` ni listas de idiomas; solo los campos del producto.

---

## Cómo quedan los datos al guardar

### Tabla `products` (una fila por producto)

Aquí se guarda **una sola vez** el producto: precio, país, imágenes, IDs de categoría, etc. Los campos de texto (name, description, address) se repiten aquí por compatibilidad con el esquema actual; **la fuente de verdad por idioma es `product_translations`**.

| id (uuid) | name (ej. copia ES) | description | address | price | country | user_id | ... |
|-----------|---------------------|-------------|---------|-------|---------|---------|-----|
| `abc-111` | Tour por la selva   | Descripción en español... | Cusco, Perú | 100.00 | Perú | usr_1 | ... |

*(En el futuro puedes dejar name/description/address vacíos en `products` y leer siempre de `product_translations` por locale.)*

---

### Tabla `product_translations` (una fila por producto **y** por idioma)

Cada fila = un producto en un idioma. Por defecto hay **2 idiomas habilitados** (`es` y `en`), así que por cada producto habrá **2 filas** en esta tabla.

**Ejemplo 1: el usuario envía el producto en español**

Body que manda el front (sin indicar idioma):

```json
{
  "name": "Tour por la selva",
  "description": "Un recorrido increíble por la selva peruana...",
  "address": "Cusco, Perú",
  "price": 100,
  "country": "Perú",
  ...
}
```

La API detecta idioma **es** → guarda el contenido en `es` y traduce a **en** con Google → guarda esa traducción.

| product_id | locale | name | description | address |
|------------|--------|------|-------------|---------|
| `abc-111` | **es** | Tour por la selva | Un recorrido increíble por la selva peruana... | Cusco, Perú |
| `abc-111` | **en** | Jungle tour | An amazing tour through the Peruvian jungle... | Cusco, Peru |

---

**Ejemplo 2: el usuario envía el producto en inglés**

Body:

```json
{
  "name": "Jungle tour",
  "description": "An amazing tour through the Peruvian jungle...",
  "address": "Cusco, Peru",
  "price": 100,
  "country": "Peru",
  ...
}
```

La API detecta idioma **en** → guarda ese contenido en `en` y traduce a **es** con Google.

| product_id | locale | name | description | address |
|------------|--------|------|-------------|---------|
| `abc-111` | **en** | Jungle tour | An amazing tour through the Peruvian jungle... | Cusco, Peru |
| `abc-111` | **es** | Tour por la selva | Un increíble recorrido por la selva peruana... | Cusco, Perú |

---

## Resumen del flujo al guardar

```
Front envía: { name, description, address, price, country, ... }
                    ↓
Backend detecta idioma (Google) → ej. "es" o "en"
                    ↓
Backend inserta en `products` (una fila)
                    ↓
Backend inserta en `product_translations`:
  - 1 fila con el idioma detectado (texto tal cual lo envió el usuario)
  - 1 fila por cada otro idioma habilitado (texto traducido con Google)
```

Por tanto, con idiomas habilitados **es** y **en**, siempre habrá **2 filas** en `product_translations` por producto.

---

## Añadir más idiomas en el futuro (ej. portugués)

1. **Configuración:** Añadir el código del idioma a la variable de entorno:
   ```env
   ENABLED_LOCALES=es,en,pt
   ```
   (Por defecto, si no pones nada, se usa `es,en`.)

2. **Base de datos:** No hace falta cambiar el esquema. La tabla `product_translations` ya tiene `(product_id, locale)`; solo se añaden **más filas** por producto.

Ejemplo con **es, en y pt** habilitados — mismo producto, 3 filas:

| product_id | locale | name | description | address |
|------------|--------|------|-------------|---------|
| `abc-111` | es | Tour por la selva | Un recorrido increíble... | Cusco, Perú |
| `abc-111` | en | Jungle tour | An amazing tour... | Cusco, Peru |
| `abc-111` | pt | Tour pela selva | Um passeio incrível... | Cusco, Perú |

Para productos ya existentes puedes:
- rellenar las traducciones a `pt` cuando se editen, o
- ejecutar un script que, para cada producto, tome la fila en `es` (o `en`) y genere la fila en `pt` con Google y la inserte.

---

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `GOOGLE_TRANSLATE_API_KEY` | API key de Google Cloud Translation (v2). Necesaria para detectar idioma y traducir. |
| `ENABLED_LOCALES` | Idiomas habilitados, separados por coma. Por defecto: `es,en`. Ej. `es,en,pt`. |

---

## Cómo consultar (devolver producto en un idioma)

En la API de lectura (listado o detalle), el cliente puede enviar `?locale=es` o `?locale=en`. El backend hace JOIN de `products` con `product_translations` filtrando por `locale` y devuelve `name`, `description`, `address` de esa fila. Así solo se envía un idioma por petición (poco ancho de banda).

```ts
// Ejemplo: listar productos en español
const locale = req.query.locale ?? 'es'
const rows = await db
  .select({
    id: Products.id,
    name: ProductTranslations.name,
    description: ProductTranslations.description,
    address: ProductTranslations.address,
    price: Products.price,
    // ...
  })
  .from(Products)
  .innerJoin(
    ProductTranslations,
    and(
      eq(Products.id, ProductTranslations.product_id),
      eq(ProductTranslations.locale, locale)
    )
  )
```

Si en algún producto no existiera esa locale, puedes usar `leftJoin` y `COALESCE(tr.name, p.name)` usando los campos de `products` como fallback.
