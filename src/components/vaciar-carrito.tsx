"use client";
// Vacia el carrito del navegador al llegar a la pagina de exito. No pinta nada.
// Espera a que <HidratarCarrito /> haya cargado el carrito guardado: si vaciaramos antes,
// esa carga traeria de vuelta los articulos de localStorage.
import { useEffect } from "react";
import { useCarrito } from "@/store/carrito";

export function VaciarCarrito() {
  const vaciar = useCarrito((s) => s.vaciar);
  useEffect(() => {
    if (useCarrito.persist.hasHydrated()) {
      vaciar();
      return;
    }
    return useCarrito.persist.onFinishHydration(() => vaciar()); // devuelve la funcion para dejar de escuchar
  }, [vaciar]);
  return null;
}
