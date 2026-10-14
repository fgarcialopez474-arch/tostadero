"use client";
// Control del carrito en cada tarjeta del catalogo: "Añadir" si el producto no esta en el carrito,
// y un selector - N + si ya esta (con - hasta 0 se quita). Escribe en el mismo store que la ficha y la cabecera.
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCarrito, type LineaCarrito } from "@/store/carrito";

type Props = { producto: Omit<LineaCarrito, "cantidad"> };

export function ControlCarrito({ producto }: Props) {
  // Solo la cantidad de ESTE producto: la tarjeta no se repinta cuando cambian las demas
  const cantidad = useCarrito((s) => s.lineas.find((l) => l.id === producto.id)?.cantidad ?? 0);
  const anadir = useCarrito((s) => s.anadir);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);

  if (producto.stock === 0) {
    return (
      <Button variant="outline" disabled className="w-full">
        Agotado
      </Button>
    );
  }

  if (cantidad === 0) {
    return (
      <Button
        className="w-full"
        onClick={() => {
          anadir(producto, 1);
          toast.success(`${producto.nombre} en el carrito`);
        }}
      >
        <ShoppingBag />
        Añadir
      </Button>
    );
  }

  return (
    <div className="flex w-full items-center justify-between rounded-lg border">
      <Button
        variant="ghost"
        size="icon"
        aria-label={cantidad === 1 ? `Quitar ${producto.nombre} del carrito` : `Una unidad menos de ${producto.nombre}`}
        onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
      >
        <Minus />
      </Button>
      <span className="text-sm tabular-nums" aria-live="polite">
        {cantidad} en el carrito
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Una unidad más de ${producto.nombre}`}
        disabled={cantidad >= producto.stock}
        onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
