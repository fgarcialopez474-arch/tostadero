// Datos de ejemplo de Tostadero: 4 categorias, 3 marcas y 12 productos.
//   npm run seed      (o npx prisma db seed)
// Es idempotente: borra y vuelve a crear, asi se puede lanzar tantas veces como haga falta.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const CATEGORIAS = [
  { nombre: "Café en grano", slug: "cafe-en-grano" },
  { nombre: "Cafeteras", slug: "cafeteras" },
  { nombre: "Molinillos", slug: "molinillos" },
  { nombre: "Accesorios", slug: "accesorios" },
];

// Todas inventadas. Tostadero es la marca propia.
const MARCAS = [
  { nombre: "Tostadero", slug: "tostadero" },
  { nombre: "Molienda & Co", slug: "molienda-co" },
  { nombre: "Bruma Kitchen", slug: "bruma-kitchen" },
];

// precio en CENTIMOS (lo que se cobra). precioAnterior: solo en ofertas, se pinta tachado
const PRODUCTOS = [
  { cat: "cafe-en-grano", marca: "tostadero", nombre: "Etiopía Yirgacheffe 250 g", slug: "etiopia-yirgacheffe-250g", precio: 1490, stock: 40,
    descripcion: "Lavado, tueste claro. Notas de bergamota, jazmín y limón. Ideal para filtro. Marca propia Tostadero." },
  { cat: "cafe-en-grano", marca: "tostadero", nombre: "Colombia Huila 250 g", slug: "colombia-huila-250g", precio: 1250, stock: 35,
    descripcion: "Tueste medio. Notas de caramelo, manzana roja y chocolate con leche. Va bien en cualquier método." },
  { cat: "cafe-en-grano", marca: "tostadero", nombre: "Brasil Cerrado 1 kg", slug: "brasil-cerrado-1kg", precio: 3400, stock: 10,
    descripcion: "Natural, tueste medio-oscuro. Cuerpo denso, cacao y avellana. Pensado para espresso y moka." },
  { cat: "cafeteras", marca: "bruma-kitchen", nombre: "Cafetera italiana Moka 6 tazas", slug: "cafetera-moka-6-tazas", precio: 2990, stock: 15,
    descripcion: "Aluminio pulido, válvula de seguridad y asa que no quema. Apta para gas y vitrocerámica, no para inducción." },
  { cat: "cafeteras", marca: "bruma-kitchen", nombre: "Prensa francesa 1 L", slug: "prensa-francesa-1l", precio: 2450, stock: 20,
    descripcion: "Jarra de vidrio borosilicato con filtro de acero de doble malla. Molienda gruesa y 4 minutos de infusión." },
  { cat: "cafeteras", marca: "bruma-kitchen", nombre: "Dripper V60 cerámico", slug: "dripper-v60-ceramico", precio: 1990, stock: 0,
    descripcion: "Cono de cerámica para 1 a 4 tazas, con estrías en espiral. Agotado: vuelve el mes que viene." },
  { cat: "molinillos", marca: "molienda-co", nombre: "Molinillo manual Fresa Pro", slug: "molinillo-manual-fresa-pro", precio: 4720, precioAnterior: 5900, stock: 12,
    descripcion: "Muelas cónicas de acero inoxidable, 30 ajustes de molienda, de espresso a prensa francesa." },
  { cat: "molinillos", marca: "molienda-co", nombre: "Molinillo eléctrico Muela 40", slug: "molinillo-electrico-muela-40", precio: 12900, stock: 6,
    descripcion: "Muelas planas de 40 mm, 40 posiciones y temporizador. Poca retención y molienda uniforme." },
  { cat: "molinillos", marca: "molienda-co", nombre: "Molinillo de viaje Mini", slug: "molinillo-viaje-mini", precio: 3490, stock: 18,
    descripcion: "Compacto y ligero (290 g), muela cerámica. Muele 20 g para una taza grande en menos de un minuto." },
  { cat: "accesorios", marca: "bruma-kitchen", nombre: "Báscula con temporizador", slug: "bascula-temporizador", precio: 2790, stock: 25,
    descripcion: "Precisión de 0,1 g hasta 2 kg y cronómetro integrado para controlar la receta. Recargable por USB-C." },
  { cat: "accesorios", marca: "bruma-kitchen", nombre: "Hervidor cuello de cisne", slug: "hervidor-cuello-cisne", precio: 4990, stock: 9,
    descripcion: "1 L, caño de vertido fino y control de temperatura de 40 a 100 °C. Imprescindible para el V60." },
  { cat: "accesorios", marca: "tostadero", nombre: "Taza de cerámica Tostadero", slug: "taza-ceramica-tostadero", precio: 990, stock: 50,
    descripcion: "350 ml, esmalte mate hecho a mano. Apta para lavavajillas y microondas. Marca propia Tostadero." },
];

async function main() {
  // Vaciamos las tablas Y reiniciamos los contadores de id (RESTART IDENTITY),
  // asi los enlaces /producto/1, /producto/2... siempre apuntan al mismo producto.
  await prisma.$executeRaw`TRUNCATE "LineaPedido", "Pedido", "Producto", "Categoria", "Marca" RESTART IDENTITY CASCADE`;

  // Las marcas van primero: cada producto se enlaza a la suya por slug
  for (const m of MARCAS) await prisma.marca.create({ data: m });

  for (const c of CATEGORIAS) {
    await prisma.categoria.create({
      data: {
        ...c,
        productos: {
          create: PRODUCTOS.filter((p) => p.cat === c.slug).map((p) => ({
            nombre: p.nombre,
            slug: p.slug,
            descripcion: p.descripcion,
            precio: p.precio,
            precioAnterior: "precioAnterior" in p ? p.precioAnterior : null,
            stock: p.stock,
            imagen: `/productos/${p.slug}.svg`,
            marca: { connect: { slug: p.marca } },
          })),
        },
      },
    });
  }

  const porCategoria = await prisma.categoria.findMany({
    select: { nombre: true, _count: { select: { productos: true } } },
    orderBy: { id: "asc" },
  });
  for (const c of porCategoria) console.log(`  ${c.nombre.padEnd(14)} ${c._count.productos} productos`);

  const porMarca = await prisma.marca.findMany({
    select: { nombre: true, _count: { select: { productos: true } } },
    orderBy: { id: "asc" },
  });
  for (const m of porMarca) console.log(`  ${m.nombre.padEnd(14)} ${m._count.productos} productos`);

  console.log(
    `Seed completado: ${await prisma.categoria.count()} categorias, ${await prisma.marca.count()} marcas, ` +
      `${await prisma.producto.count()} productos`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
