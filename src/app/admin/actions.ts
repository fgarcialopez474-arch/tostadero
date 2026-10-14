"use server";
// Server Actions del panel de admin. OJO: una Server Action es un endpoint publico (cualquiera puede llamarla),
// asi que CADA accion que toque datos vuelve a comprobar que quien llama es admin.
// El middleware protege las paginas, no las acciones.
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { EstadoPedido } from "@/generated/prisma/enums";
import { COOKIE_ADMIN, esAdmin, huella } from "@/lib/admin";
import { ETIQUETA, puedeCambiar } from "@/lib/estados";
import { prisma } from "@/lib/prisma";

export async function entrar(_: unknown, datos: FormData): Promise<{ error: string }> {
  const clave = process.env.ADMIN_PASSWORD;
  if (!clave || datos.get("clave") !== clave) return { error: "Contraseña incorrecta" };
  (await cookies()).set(COOKIE_ADMIN, await huella(clave), {
    httpOnly: true, // JavaScript del navegador no puede leerla
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // solo por HTTPS en produccion
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/",
  });
  redirect("/admin");
}

export async function salir() {
  (await cookies()).delete(COOKIE_ADMIN);
  redirect("/admin/entrar");
}

export async function cambiarEstado(pedidoId: number, nuevo: EstadoPedido): Promise<{ error?: string }> {
  // 1. ¿Es admin? (aunque la pagina ya lo compruebe: la accion se puede llamar sin pasar por la pagina)
  if (!(await esAdmin((await cookies()).get(COOKIE_ADMIN)?.value))) return { error: "No autorizado" };
  if (!Number.isInteger(pedidoId)) return { error: "Pedido no valido" };

  // 2. ¿Es un cambio permitido desde el estado ACTUAL de la base de datos? (no desde lo que diga el navegador)
  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
  if (!pedido) return { error: "El pedido no existe" };
  if (!puedeCambiar(pedido.estado, nuevo)) {
    return { error: `No se puede pasar de ${ETIQUETA[pedido.estado]} a ${ETIQUETA[nuevo] ?? nuevo}` };
  }

  // 3. Guardar SOLO si sigue en el estado que hemos comprobado: si otra pestana (u otro clic) lo cambio
  //    entre la lectura y la escritura, count vale 0 y no pisamos nada.
  const { count } = await prisma.pedido.updateMany({
    where: { id: pedidoId, estado: pedido.estado },
    data: { estado: nuevo },
  });
  if (count === 0) return { error: "El pedido ha cambiado mientras tanto: recarga la página" };

  // 4. Avisar a Next de que esas paginas han cambiado: en la siguiente visita se vuelven a generar con datos nuevos
  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${pedidoId}`);
  return {};
}
