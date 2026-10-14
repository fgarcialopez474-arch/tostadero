// Icono del carrito de la cabecera.
// De momento es solo un enlace: en el paso 4 lo conectaremos al store de Zustand para mostrar el numero de articulos.
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function IconoCarrito() {
  return (
    <Link href="/carrito" className="relative" aria-label="Carrito">
      <ShoppingBag className="size-5" />
    </Link>
  );
}
