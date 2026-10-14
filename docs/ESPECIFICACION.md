# Especificacion · Tostadero

Tienda online ficticia de **cafe de especialidad** (ejercicio del Master Desarrollo Agentico).
Vende cafe en grano, cafeteras, molinillos y accesorios, y tiene una marca propia, **Tostadero**.
Se construye paso a paso siguiendo las sesiones del proyecto Ecommerce, tomando como referencia `tienda-online`.

## Que hace la tienda

Un cliente entra, busca productos, los mete en el carrito y paga con tarjeta (Stripe, modo test).
El pedido se confirma cuando Stripe avisa al servidor (webhook) y el cliente recibe un email.
El administrador ve los pedidos y cambia su estado (pagado -> enviado -> entregado).

## Paginas

| Ruta | Pagina | Quien la usa | Sesion |
|---|---|---|---|
| `/` | Catalogo: rejilla de productos, busqueda por nombre (sin distinguir tildes) y filtros (categoria, marca, precio); anadir y quitar del carrito desde cada tarjeta | Cliente | S2 |
| `/producto/[id]` | Detalle: imagen, marca, precio, stock, cantidad, anadir al carrito (404 si no existe) | Cliente | S2 |
| `/carrito` | Carrito: lineas, cantidades, total, boton de pagar | Cliente | S2 |
| `/checkout/exito` y `/checkout/cancelado` | Vuelta desde Stripe (solo informan, no cambian nada) | Cliente | S3 |
| `/admin` | Panel de pedidos: lista por estado, detalle y cambio de estado (protegido con contrasena) | Administrador | S4 |
| `/api/webhooks/stripe` | Endpoint que recibe los eventos de Stripe (no es una pagina) | Stripe | S3 |

## Modelo de datos

- **Categoria** 1 — N **Producto**
- **Marca** 1 — N **Producto** (se anade al final de la Sesion 1)
- **Pedido** 1 — N **LineaPedido** N — 1 **Producto**
- Un pedido tiene un **estado**: PENDIENTE, PAGADO, ENVIADO, ENTREGADO, CANCELADO.

| Modelo | Campos principales |
|---|---|
| Categoria | id, nombre (unico), slug (unico) |
| Marca | id, nombre (unico), slug (unico) |
| Producto | id, nombre, slug (unico), descripcion, precio (centimos), precioAnterior (centimos, solo en ofertas), imagen, stock, creadoEn, categoriaId, marcaId |
| Pedido | id, email, estado, total (centimos), stripeSessionId (unico, opcional), creadoEn, actualizadoEn |
| LineaPedido | id, cantidad, precioUnitario (centimos, copiado al comprar), pedidoId, productoId |

## Catalogo inicial (seed)

4 categorias, 3 marcas y 12 productos. Cada producto lleva una imagen SVG en `public/productos/<slug>.svg`.

| Categoria | Producto | Marca | Precio | Stock |
|---|---|---|---|---|
| Cafe en grano | Etiopia Yirgacheffe 250 g | Tostadero | 14,90 € | 40 |
| Cafe en grano | Colombia Huila 250 g | Tostadero | 12,50 € | 35 |
| Cafe en grano | Brasil Cerrado 1 kg | Tostadero | 34,00 € | 10 |
| Cafeteras | Cafetera italiana Moka 6 tazas | Bruma Kitchen | 29,90 € | 15 |
| Cafeteras | Prensa francesa 1 L | Bruma Kitchen | 24,50 € | 20 |
| Cafeteras | Dripper V60 ceramico | Bruma Kitchen | 19,90 € | **0** (agotado, para probar ese caso) |
| Molinillos | Molinillo manual Fresa Pro | Molienda & Co | **47,20 €** (oferta −20 %, antes 59,00 €) | 12 |
| Molinillos | Molinillo electrico Muela 40 | Molienda & Co | 129,00 € | 6 |
| Molinillos | Molinillo de viaje Mini | Molienda & Co | 34,90 € | 18 |
| Accesorios | Bascula con temporizador | Bruma Kitchen | 27,90 € | 25 |
| Accesorios | Hervidor cuello de cisne | Bruma Kitchen | 49,90 € | 9 |
| Accesorios | Taza de ceramica Tostadero | Tostadero | 9,90 € | 50 |

Todas las marcas son inventadas.

## Stack

Next.js 15 (App Router, TypeScript, Tailwind), PostgreSQL en Neon con Prisma, Stripe Checkout en modo test,
Resend para emails, shadcn/ui para la UI y Zustand (con persist) para el carrito. Vitest y GitHub Actions para calidad,
Vercel para el despliegue.

## Plan por sesiones

1. **S1** · Especificacion, proyecto Next.js, Neon, schema Prisma, seed, Stripe (`lib/stripe.ts`), modelo Marca.
2. **S2** · UI con shadcn, catalogo con busqueda y filtros en la URL, ficha de producto, carrito con Zustand.
3. **S3** · Checkout con Server Action, webhook firmado e idempotente, email de confirmacion.
4. **S4** · Panel de admin protegido, cambio de estado, tests, CI y despliegue.

## Fuera de alcance

Cuentas de cliente, cupones, suscripciones de cafe, variantes de producto (molienda, peso), varias monedas,
gestion de stock en tiempo real, envios reales.

## Reglas que no se negocian

1. Los precios se guardan en **centimos** (enteros), nunca en decimales.
2. La clave secreta de Stripe vive solo en el servidor (`.env`), nunca en el navegador.
3. El pedido se marca como PAGADO en el **webhook**, no en la pagina de exito.
4. Nada que venga del navegador es fiable: el checkout recibe ids y cantidades y relee precios y stock de la base de datos.
5. El webhook es idempotente: solo cambia pedidos en PENDIENTE, asi un evento repetido no descuenta stock dos veces.
