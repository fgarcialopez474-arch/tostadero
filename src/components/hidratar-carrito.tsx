"use client";
// Carga el carrito guardado en localStorage DESPUES de que React haya hidratado la pagina.
// Asi el primer pintado del navegador coincide con el HTML del servidor (carrito vacio) y, un instante
// despues, aparecen los articulos guardados. No pinta nada.
import { useEffect } from "react";
import { useCarrito } from "@/store/carrito";

export function HidratarCarrito() {
  useEffect(() => {
    useCarrito.persist.rehydrate();
  }, []);
  return null;
}
