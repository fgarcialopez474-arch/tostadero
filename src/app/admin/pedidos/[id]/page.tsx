// Detalle de un pedido en el panel de admin. (Los botones para cambiar de estado llegan en el paso 2.)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeEstado } from "@/components/badge-estado";
import { formatearPrecio } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Pedido #${(await params).id} · Admin · Tostadero` };
}

const fecha = (d: Date) => d.toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

export default async function DetallePedido({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { lineas: { include: { producto: { select: { nombre: true } } } } },
  });
  if (!pedido) notFound();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
        ← Todos los pedidos
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Pedido #{pedido.id}</h1>
        <BadgeEstado estado={pedido.estado} />
      </div>
      <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
        <dt className="text-muted-foreground">Cliente</dt>
        <dd>{pedido.estado === "PENDIENTE" ? "(sin pagar)" : pedido.email}</dd>
        <dt className="text-muted-foreground">Creado</dt>
        <dd>{fecha(pedido.creadoEn)}</dd>
        <dt className="text-muted-foreground">Actualizado</dt>
        <dd>{fecha(pedido.actualizadoEn)}</dd>
        <dt className="text-muted-foreground">Pago en Stripe</dt>
        <dd className="truncate font-mono text-xs">{pedido.stripeSessionId ?? "-"}</dd>
      </dl>
      <div className="rounded-xl border p-5">
        <ul className="space-y-1 text-sm">
          {pedido.lineas.map((l) => (
            <li key={l.id} className="flex justify-between">
              <span>
                {l.cantidad} × {l.producto.nombre}
              </span>
              <span className="tabular-nums">{formatearPrecio(l.precioUnitario * l.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{formatearPrecio(pedido.total)}</span>
        </p>
      </div>
    </main>
  );
}
