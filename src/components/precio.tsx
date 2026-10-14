// Precio de un producto. Si esta en oferta: precio actual, precio anterior tachado y el % de descuento.
import { formatearPrecio, porcentajeDescuento } from "@/lib/formato";

type Props = { precio: number; precioAnterior: number | null; grande?: boolean };

export function Precio({ precio, precioAnterior, grande = false }: Props) {
  const descuento = porcentajeDescuento(precio, precioAnterior);
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-semibold ${grande ? "text-3xl" : "text-lg"} ${descuento ? "text-destructive" : ""}`}>
        {formatearPrecio(precio)}
      </span>
      {descuento && precioAnterior !== null && (
        <>
          {/* <s> marca el precio antiguo como "ya no valido", tambien para lectores de pantalla */}
          <s className={`text-muted-foreground ${grande ? "text-lg" : "text-sm"}`}>{formatearPrecio(precioAnterior)}</s>
          <span className="sr-only">, {descuento} % de descuento</span>
        </>
      )}
    </p>
  );
}

// Etiqueta "Oferta -20 %" para poner sobre la imagen o junto a la categoria
export function EtiquetaOferta({ precio, precioAnterior }: Omit<Props, "grande">) {
  const descuento = porcentajeDescuento(precio, precioAnterior);
  if (!descuento) return null;
  return (
    <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-white" aria-hidden>
      Oferta −{descuento} %
    </span>
  );
}
