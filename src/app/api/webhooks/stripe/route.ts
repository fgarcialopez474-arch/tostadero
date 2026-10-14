// Webhook de Stripe: Stripe llama a esta URL desde SUS servidores cuando pasa algo (un pago completado).
// Es el UNICO sitio donde un pedido pasa a PAGADO: el cliente puede cerrar el navegador, el webhook llega igual.
// Es la unica API route de la tienda: Stripe necesita una URL a la que hacer POST (no puede llamar a una Server Action).
import type Stripe from "stripe";
import { enviarConfirmacion } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  // 1. El cuerpo EXACTO, como texto: la firma se calcula sobre estos bytes (si lo parseamos antes, no cuadra)
  const cuerpo = await req.text();
  const firma = req.headers.get("stripe-signature");
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!firma || !secreto) return new Response("Falta la firma o el secreto", { status: 400 });

  // 2. Verificar que el evento viene de Stripe y no de cualquiera que conozca la URL
  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(cuerpo, firma, secreto);
  } catch (e) {
    console.warn("[webhook] firma NO valida:", (e as Error).message);
    return new Response("Firma no valida", { status: 400 });
  }

  // 3. Solo nos interesa el pago completado
  if (evento.type === "checkout.session.completed") {
    const sesion = evento.data.object;
    const pedidoId = Number(sesion.metadata?.pedidoId);

    // Marcar PAGADO y descontar stock van en una TRANSACCION: o se hacen las dos cosas o ninguna.
    // Devuelve las lineas vendidas, o null si el pedido ya estaba procesado.
    const lineas = await prisma.$transaction(async (tx) => {
      // updateMany con estado PENDIENTE: si Stripe reenvia el evento, no se procesa dos veces (idempotencia)
      const { count } = await tx.pedido.updateMany({
        where: { id: pedidoId, estado: "PENDIENTE" },
        data: { estado: "PAGADO", email: sesion.customer_details?.email ?? "sin-email" },
      });
      if (count === 0) return null;

      const vendidas = await tx.lineaPedido.findMany({ where: { pedidoId }, include: { producto: true } });
      for (const l of vendidas) {
        await tx.producto.update({ where: { id: l.productoId }, data: { stock: { decrement: l.cantidad } } });
      }
      return vendidas;
    });

    if (lineas) {
      // Sin el email del cliente en el log: es un dato personal
      console.log(`[webhook] pedido ${pedidoId} PAGADO (${sesion.amount_total} centimos)`);

      // El email sale de AQUI, del webhook: si el cliente cierra el navegador tras pagar, lo recibe igual.
      // Va FUERA de la transaccion y con su propio try/catch: si el email falla, el pedido sigue pagado
      // y respondemos 200 a Stripe (si respondieramos error, Stripe reintentaria un pago ya confirmado).
      try {
        await enviarConfirmacion({
          id: pedidoId,
          email: sesion.customer_details?.email ?? "",
          total: sesion.amount_total ?? 0,
          lineas: lineas.map((l) => ({
            nombre: l.producto.nombre,
            cantidad: l.cantidad,
            precioUnitario: l.precioUnitario,
          })),
        });
      } catch (e) {
        console.error("[email] no se pudo enviar:", (e as Error).message);
      }
    } else {
      console.log(`[webhook] pedido ${pedidoId} ya estaba procesado: se ignora`);
    }
  }

  // 4. Responder 200 rapido: si no, Stripe reintenta durante dias
  return Response.json({ recibido: true });
}
