// Barra de busqueda y filtros. Es un Server Component: no hay estado en el navegador,
// todo vive en la URL (?q=...&categoria=...&marca=...&min=...&max=...).
import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Filtros as TFiltros } from "@/lib/catalogo";

type Opcion = { nombre: string; slug: string };
type Props = { filtros: TFiltros; categorias: Opcion[]; marcas: Opcion[] };

// Construye la URL del catalogo cambiando solo un parametro y conservando el resto
function urlCon(f: TFiltros, cambio: Partial<Record<keyof TFiltros, string>>) {
  const p = new URLSearchParams();
  const v = {
    q: f.q,
    categoria: f.categoria,
    marca: f.marca,
    min: f.min?.toString() ?? "",
    max: f.max?.toString() ?? "",
    ...cambio,
  };
  for (const [k, val] of Object.entries(v)) if (val) p.set(k, val);
  const qs = p.toString();
  return qs ? `/?${qs}` : "/";
}

export function Filtros({ filtros, categorias, marcas }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* next/form: un formulario GET que navega sin recargar la pagina (y funciona sin JavaScript) */}
      <Form action="/" className="flex flex-wrap items-end gap-3">
        {/* Los chips activos viajan ocultos para no perderlos al buscar */}
        {filtros.categoria && <input type="hidden" name="categoria" value={filtros.categoria} />}
        {filtros.marca && <input type="hidden" name="marca" value={filtros.marca} />}
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Buscar
          <Input name="q" defaultValue={filtros.q} placeholder="etiopía, molinillo, hervidor..." className="min-w-56" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Precio mín. (€)
          <Input name="min" type="number" min={0} defaultValue={filtros.min ?? ""} className="w-28" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Precio máx. (€)
          <Input name="max" type="number" min={0} defaultValue={filtros.max ?? ""} className="w-28" />
        </label>
        <Button type="submit">Filtrar</Button>
      </Form>

      {/* Categorias y marcas: enlaces normales. Cada filtro es una URL que se puede compartir */}
      <FilaChips titulo="Categoría" campo="categoria" opciones={categorias} filtros={filtros} />
      <FilaChips titulo="Marca" campo="marca" opciones={marcas} filtros={filtros} />
    </div>
  );
}

type FilaProps = { titulo: string; campo: "categoria" | "marca"; opciones: Opcion[]; filtros: TFiltros };

function FilaChips({ titulo, campo, opciones, filtros }: FilaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-sm text-muted-foreground">{titulo}</span>
      <Chip href={urlCon(filtros, { [campo]: "" })} activo={!filtros[campo]}>
        Todas
      </Chip>
      {opciones.map((o) => (
        <Chip key={o.slug} href={urlCon(filtros, { [campo]: o.slug })} activo={filtros[campo] === o.slug}>
          {o.nombre}
        </Chip>
      ))}
    </div>
  );
}

function Chip({ href, activo, children }: { href: string; activo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        activo ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
