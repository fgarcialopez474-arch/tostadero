// Panel de admin: lista de pedidos con filtro por estado (en la URL, como el catalogo).
import type { Metadata } from "next";
import Link from "next/link";
import { salir } from "@/app/admin/actions";
import { BadgeEstado } from "@/components/badge-estado";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EstadoPedido } from "@/generated/prisma/enums";
import { ESTADOS, ETIQUETA } from "@/lib/estados";
import { formatearPrecio } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Pedidos · Admin · Tostadero" };
export const dynamic = "force-dynamic"; // los pedidos cambian: siempre datos frescos

type Props = { searchParams: Promise<{ estado?: string }> };

const fecha = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" });

export default async function PanelPedidos({ searchParams }: Props) {
  const { estado } = await searchParams;
  // Solo aceptamos estados que existen: ?estado=LOQUESEA se ignora
  const filtro = ESTADOS.includes(estado as EstadoPedido) ? (estado as EstadoPedido) : undefined;

  const [pedidos, conteo] = await Promise.all([
    prisma.pedido.findMany({
      where: filtro ? { estado: filtro } : {},
      orderBy: { id: "desc" },
      include: { lineas: { select: { cantidad: true } } },
    }),
    prisma.pedido.groupBy({ by: ["estado"], _count: true }), // cuantos hay de cada estado
  ]);
  const cuantos = (e: EstadoPedido) => conteo.find((c) => c.estado === e)?._count ?? 0;
  const chip = (activo: boolean) =>
    `rounded-full border px-3 py-1 ${activo ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <form action={salir}>
          <Button variant="outline" size="sm">
            Salir
          </Button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className={chip(!filtro)}>
          Todos ({conteo.reduce((n, c) => n + c._count, 0)})
        </Link>
        {ESTADOS.map((e) => (
          <Link key={e} href={`/admin?estado=${e}`} className={chip(filtro === e)}>
            {ETIQUETA[e]} ({cuantos(e)})
          </Link>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">No hay pedidos en este estado.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Artículos</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/pedidos/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                    #{p.id}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{fecha.format(p.creadoEn)}</TableCell>
                <TableCell>
                  {p.estado === "PENDIENTE" ? <span className="text-muted-foreground">(sin pagar)</span> : p.email}
                </TableCell>
                <TableCell>
                  <BadgeEstado estado={p.estado} />
                </TableCell>
                {/* Unidades, no lineas: 2 tazas + 3 cafes = 5 articulos */}
                <TableCell className="text-right tabular-nums">
                  {p.lineas.reduce((n, l) => n + l.cantidad, 0)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatearPrecio(p.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
