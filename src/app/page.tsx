// Catalogo (Server Component): se ejecuta en el servidor y lee los productos de Neon directamente con Prisma.
// No hay API ni fetch: el HTML llega al navegador ya con los productos pintados.
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { prisma } from "@/lib/prisma";

export default async function Catalogo() {
  const productos = await prisma.producto.findMany({
    include: { categoria: true, marca: true },
    orderBy: { precio: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
      <p className="mt-2 text-muted-foreground">Café de especialidad y todo lo necesario para prepararlo en casa.</p>

      <p className="mt-6 text-sm text-muted-foreground">{productos.length} productos</p>
      {/* Rejilla responsive: 2 columnas en movil, 3 en tablet, 4 en escritorio */}
      <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => (
          <TarjetaProducto key={p.id} producto={p} />
        ))}
      </div>
    </main>
  );
}
