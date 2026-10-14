// Los precios viajan en centimos (1490) y solo se formatean al pintarlos: "14,90 €"
const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatearPrecio(centimos: number): string {
  return euros.format(centimos / 100);
}

// Porcentaje de descuento de una oferta, redondeado: 4720 frente a 5900 -> 20.
// null si no hay oferta (sin precio anterior, o el anterior no es mayor que el actual).
export function porcentajeDescuento(precio: number, precioAnterior: number | null): number | null {
  if (precioAnterior === null || precioAnterior <= precio) return null;
  return Math.round((1 - precio / precioAnterior) * 100);
}
