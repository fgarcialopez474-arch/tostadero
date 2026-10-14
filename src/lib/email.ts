// Email de confirmacion de pedido con Resend. Solo se llama desde el WEBHOOK (el punto fiable).
import "server-only";
import { Resend } from "resend";
import { formatearPrecio } from "@/lib/formato";

type LineaEmail = { nombre: string; cantidad: number; precioUnitario: number };
type PedidoEmail = { id: number; email: string; total: number; lineas: LineaEmail[] };

// Los nombres van dentro de HTML: se escapan para que un "<" o un "&" no rompan el correo
const escapar = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Plantilla HTML sencilla: tablas y estilos en linea, que es lo que entienden todos los clientes de correo
export function plantillaConfirmacion(p: PedidoEmail): string {
  const filas = p.lineas
    .map(
      (l) => `<tr>
        <td style="padding:8px 0">${l.cantidad} × ${escapar(l.nombre)}</td>
        <td style="padding:8px 0;text-align:right">${formatearPrecio(l.precioUnitario * l.cantidad)}</td>
      </tr>`
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#2b1a10">
    <p style="font-size:13px;letter-spacing:2px;color:#6b3e26;margin:0">TOSTADERO</p>
    <h1 style="font-size:22px;margin:8px 0 16px">¡Gracias por tu compra!</h1>
    <p>Hemos recibido el pago de tu pedido <strong>#${p.id}</strong>. Lo tostamos, lo empaquetamos
      y te avisaremos cuando salga hacia tu casa.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8dccb">${filas}
      <tr><td style="padding:12px 0;border-top:1px solid #e8dccb"><strong>Total</strong></td>
      <td style="padding:12px 0;border-top:1px solid #e8dccb;text-align:right"><strong>${formatearPrecio(p.total)}</strong></td></tr>
    </table>
    <p style="color:#8a7565;font-size:12px">Tienda ficticia (ejercicio del Master). Pago en modo test: no se ha cobrado nada.</p>
  </div>`;
}

export async function enviarConfirmacion(p: PedidoEmail) {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) {
    console.warn("[email] sin RESEND_API_KEY: no se envia");
    return;
  }
  // Sin dominio propio verificado, Resend solo deja enviar DESDE onboarding@resend.dev
  // y SOLO A la direccion con la que te registraste. En desarrollo la ponemos en EMAIL_PRUEBAS.
  const para = process.env.EMAIL_PRUEBAS || p.email;
  const resend = new Resend(clave);
  const { data, error } = await resend.emails.send({
    from: "Tostadero <onboarding@resend.dev>",
    to: para,
    subject: `Pedido #${p.id} confirmado · Tostadero`,
    html: plantillaConfirmacion(p),
  });
  if (error) console.error("[email] Resend devolvio un error:", error.message);
  else console.log(`[email] confirmacion del pedido ${p.id} enviada (id ${data?.id})`);
}
