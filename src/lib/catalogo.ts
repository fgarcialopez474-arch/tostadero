// Busqueda y filtros del catalogo: se resuelven en el SERVIDOR con Prisma a partir de la URL.
//   /?q=molinillo&categoria=molinillos&marca=molienda-co&min=30&max=60
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type Filtros = { q: string; categoria: string; marca: string; min: number | null; max: number | null };

// Los searchParams llegan como texto (o lista de textos) y pueden venir de cualquiera: se validan
export function leerFiltros(sp: Record<string, string | string[] | undefined>): Filtros {
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  const euros = (v: string) => (v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null);
  return {
    q: uno(sp.q),
    categoria: uno(sp.categoria),
    marca: uno(sp.marca),
    min: euros(uno(sp.min)),
    max: euros(uno(sp.max)),
  };
}

// Patron para ILIKE: el texto del usuario entre comodines. Sus propios % y _ se escapan para que
// busque "50%" literalmente y no "50 seguido de cualquier cosa".
export function patronBusqueda(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

// Ids de los productos cuyo nombre contiene el texto SIN distinguir tildes ni mayusculas
// ("etiopia" encuentra "Etiopía"). Prisma no tiene este filtro, asi que va en SQL con la extension unaccent.
// $queryRaw con plantilla: el texto viaja como PARAMETRO ($1), nunca pegado en el SQL (sin inyeccion).
async function idsPorNombre(q: string): Promise<number[]> {
  const filas = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM "Producto" WHERE unaccent("nombre") ILIKE unaccent(${patronBusqueda(q)})`;
  return filas.map((f) => f.id);
}

export async function buscarProductos(f: Filtros) {
  const where: Prisma.ProductoWhereInput = {};
  if (f.q) where.id = { in: await idsPorNombre(f.q) };
  if (f.categoria) where.categoria = { slug: f.categoria };
  if (f.marca) where.marca = { slug: f.marca };
  if (f.min !== null || f.max !== null) {
    // el usuario escribe euros; en la base guardamos centimos
    where.precio = {
      ...(f.min !== null && { gte: Math.round(f.min * 100) }),
      ...(f.max !== null && { lte: Math.round(f.max * 100) }),
    };
  }
  return prisma.producto.findMany({
    where,
    include: { categoria: { select: { nombre: true } }, marca: { select: { nombre: true } } },
    orderBy: { precio: "asc" },
  });
}

export function listarCategorias() {
  return prisma.categoria.findMany({ orderBy: { id: "asc" } });
}

export function listarMarcas() {
  return prisma.marca.findMany({ orderBy: { id: "asc" } });
}
