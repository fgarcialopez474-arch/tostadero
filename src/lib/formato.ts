// Los precios viajan en centimos (1490) y solo se formatean al pintarlos: "14,90 €"
const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatearPrecio(centimos: number): string {
  return euros.format(centimos / 100);
}
