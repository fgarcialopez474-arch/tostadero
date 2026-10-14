# Tostadero · tienda online de cafe de especialidad

Tienda online ficticia (ejercicio del Master Desarrollo Agentico, The Power): cafe en grano, cafeteras, molinillos y
accesorios, con marca propia **Tostadero**. Se construye paso a paso; la especificacion esta en
[`docs/ESPECIFICACION.md`](docs/ESPECIFICACION.md).

## Estado

| Sesion | Contenido | Estado |
|---|---|---|
| S1 | Proyecto Next.js, Neon, Prisma (schema, migraciones y modelo Marca), seed, Stripe en modo test | Hecha |
| S2 | UI con shadcn, catalogo con busqueda y filtros (categoria, marca, precio), ficha de producto, carrito persistente | Hecha |
| S3 | Checkout con Stripe, webhook, email de confirmacion | Pendiente |
| S4 | Panel de admin, tests, CI y despliegue en Vercel | Pendiente |

## Stack

| Capa | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Base de datos | PostgreSQL en Neon + Prisma 7 (driver adapter pg) |
| Pagos | Stripe en modo test |
| UI y carrito | shadcn/ui (Base UI) + Zustand con persist (localStorage) |
| Proximamente | Resend, Vitest, GitHub Actions, Vercel |

## Ejecutarlo en local

Necesitas Node.js 20+, una base PostgreSQL (Neon free tier o `docker compose up -d`) y una cuenta de Stripe en modo test.

```bash
npm install                 # dependencias + cliente de Prisma (postinstall)
cp .env.example .env        # y rellena los valores
npm run db:check            # comprueba que la base responde
npx prisma migrate deploy   # crea las tablas
npm run seed                # 4 categorias y 12 productos
npm run stripe:check        # comprueba las claves de Stripe (sin cobrar nada)
npm run dev                 # http://localhost:3000
```

`npx prisma studio` abre un visor de las tablas en http://localhost:5555.

## Estructura

```
docs/ESPECIFICACION.md   paginas, modelo de datos, catalogo y reglas
src/app/                 paginas (App Router): cada carpeta es una ruta
src/lib/prisma.ts        unica instancia de Prisma (conexion con pooler)
src/lib/stripe.ts        instancia de Stripe solo de servidor (server-only)
prisma/schema.prisma     modelos: Categoria, Marca, Producto, Pedido, LineaPedido
prisma/migrations/       SQL generado por Prisma, versionado en git
prisma/seed.ts           datos de ejemplo (idempotente)
public/productos/        imagenes SVG de los productos
scripts/                 comprobaciones de base de datos y Stripe
docker-compose.yml       alternativa local a Neon
```

## Reglas

1. Precios en **centimos** (enteros).
2. Secretos solo en `.env` (ignorado por git); la clave secreta de Stripe nunca llega al navegador.
3. El pedido se marca como PAGADO en el **webhook** de Stripe, no en la pagina de exito.

Material de clase: tienda y marcas ficticias, pagos en modo test.
