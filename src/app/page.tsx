// Catalogo (Server Component): busqueda y filtros resueltos en el servidor a partir de la URL.
// No hay API ni fetch: el HTML llega al navegador ya con los productos filtrados.
import Link from "next/link";
import { Filtros } from "@/components/filtros";
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { buscarProductos, leerFiltros, listarCategorias, listarMarcas } from "@/lib/catalogo";

// En Next 15 searchParams es una Promise: hay que esperarla.
// Cada vez que cambia la URL (?q=...), Next vuelve a ejecutar esta funcion en el servidor.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Catalogo({ searchParams }: Props) {
  const filtros = leerFiltros(await searchParams);
  // Las tres consultas son independientes: se lanzan a la vez
  const [productos, categorias, marcas] = await Promise.all([
    buscarProductos(filtros),
    listarCategorias(),
    listarMarcas(),
  ]);
  const hayFiltros = Boolean(
    filtros.q || filtros.categoria || filtros.marca || filtros.min !== null || filtros.max !== null
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
      <p className="mt-2 text-muted-foreground">Café de especialidad y todo lo necesario para prepararlo en casa.</p>
      <div className="mt-6">
        <Filtros filtros={filtros} categorias={categorias} marcas={marcas} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {productos.length} {productos.length === 1 ? "producto" : "productos"}
        {hayFiltros && (
          <>
            {" · "}
            <Link href="/" className="underline underline-offset-4">
              quitar filtros
            </Link>
          </>
        )}
      </p>

      {productos.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">Ningún producto coincide con la búsqueda.</p>
      ) : (
        // Rejilla responsive: 2 columnas en movil, 3 en tablet, 4 en escritorio
        <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <TarjetaProducto key={p.id} producto={p} />
          ))}
        </div>
      )}
    </main>
  );
}
