"use client";
// Selector de cantidad + boton "anadir al carrito". Es un componente de CLIENTE porque tiene estado
// (la cantidad) y eventos (clics). En el paso 4 el boton escribira en el store del carrito (Zustand).
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { producto: { id: number; nombre: string; precio: number; imagen: string; stock: number } };

export function ComprarProducto({ producto }: Props) {
  const [cantidad, setCantidad] = useState(1);
  const agotado = producto.stock === 0;
  const max = Math.min(producto.stock, 10); // nunca mas de lo que hay en stock, y como mucho 10

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="flex items-center rounded-lg border">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menos"
          disabled={agotado || cantidad <= 1}
          onClick={() => setCantidad((c) => c - 1)}
        >
          <Minus />
        </Button>
        <span className="w-10 text-center tabular-nums">{agotado ? 0 : cantidad}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Más"
          disabled={agotado || cantidad >= max}
          onClick={() => setCantidad((c) => c + 1)}
        >
          <Plus />
        </Button>
      </div>
      {/* Sin onClick todavia: se conecta al carrito en el paso 4 */}
      <Button size="lg" disabled={agotado} className="px-6">
        {agotado ? "Agotado" : "Añadir al carrito"}
      </Button>
    </div>
  );
}
