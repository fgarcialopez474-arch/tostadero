// Tarjeta de producto de la rejilla del catalogo (Server Component).
// La imagen y el nombre llevan a la ficha; abajo, el control para añadir/quitar del carrito sin entrar.
// (No envolvemos toda la tarjeta en un enlace: un boton dentro de un <a> no es HTML valido.)
import Image from "next/image";
import Link from "next/link";
import { ControlCarrito } from "@/components/control-carrito";
import { EtiquetaOferta, Precio } from "@/components/precio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  producto: {
    id: number;
    nombre: string;
    precio: number;
    precioAnterior: number | null;
    imagen: string;
    stock: number;
    categoria: { nombre: string };
    marca: { nombre: string };
  };
};

export function TarjetaProducto({ producto }: Props) {
  const agotado = producto.stock === 0;
  const enlace = `/producto/${producto.id}`;
  return (
    <Card className="group h-full pt-0 transition-shadow hover:shadow-md">
      <Link href={enlace} className="relative block" tabIndex={-1} aria-hidden>
        {/* next/image: reserva el hueco (width/height) y carga la imagen solo cuando se ve */}
        <Image
          src={producto.imagen}
          alt=""
          width={500}
          height={500}
          className={`aspect-square w-full object-cover ${agotado ? "opacity-50" : ""}`}
        />
        <span className="absolute left-3 top-3">
          <EtiquetaOferta precio={producto.precio} precioAnterior={producto.precioAnterior} />
        </span>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{producto.categoria.nombre}</Badge>
          {agotado && <Badge variant="destructive">Agotado</Badge>}
        </div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{producto.marca.nombre}</p>
        <h3 className="font-medium leading-snug">
          <Link href={enlace} className="hover:underline">
            {producto.nombre}
          </Link>
        </h3>
        <div className="mt-auto flex flex-col gap-3">
          <Precio precio={producto.precio} precioAnterior={producto.precioAnterior} />
          <ControlCarrito
            producto={{
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              imagen: producto.imagen,
              stock: producto.stock,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
