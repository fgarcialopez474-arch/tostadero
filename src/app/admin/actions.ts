"use server";
// Server Actions del panel de admin. OJO: una Server Action es un endpoint publico (cualquiera puede llamarla),
// asi que CADA accion que toque datos vuelve a comprobar que quien llama es admin.
// El middleware protege las paginas, no las acciones.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ADMIN, huella } from "@/lib/admin";

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
