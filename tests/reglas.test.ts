// Tests de las reglas de negocio que no necesitan base de datos ni Stripe.
import { describe, expect, it, vi } from "vitest";
import { leerFiltros, patronBusqueda } from "@/lib/catalogo";
import { puedeCambiar } from "@/lib/estados";
import { formatearPrecio, porcentajeDescuento } from "@/lib/formato";
import { calcularTotal, contarArticulos, type LineaCarrito } from "@/store/carrito";

// catalogo.ts importa la instancia de Prisma; aqui no queremos conectar a ninguna base de datos
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

const linea = (precio: number, cantidad: number): LineaCarrito => ({
  id: 1,
  nombre: "x",
  imagen: "",
  stock: 10,
  precio,
  cantidad,
});

describe("precios en centimos", () => {
  it("formatea 1490 como 14,90 €", () => {
    // Intl separa el euro con un espacio especial (no rompible): lo normalizamos
    expect(formatearPrecio(1490).replace(/\s/g, " ")).toBe("14,90 €");
  });
  it("suma el carrito sin decimales flotantes", () => {
    const lineas = [linea(1490, 2), linea(5900, 1)]; // 2 Etiopia + 1 molinillo
    expect(calcularTotal(lineas)).toBe(8880);
    expect(contarArticulos(lineas)).toBe(3);
  });
});

describe("estados del pedido (admin)", () => {
  it("permite PAGADO -> ENVIADO -> ENTREGADO", () => {
    expect(puedeCambiar("PAGADO", "ENVIADO")).toBe(true);
    expect(puedeCambiar("ENVIADO", "ENTREGADO")).toBe(true);
  });
  it("el admin NO puede marcar un pedido como PAGADO (eso es del webhook)", () => {
    expect(puedeCambiar("PENDIENTE", "PAGADO")).toBe(false);
  });
  it("no se vuelve atras ni se cancela algo ya pagado", () => {
    expect(puedeCambiar("ENVIADO", "PAGADO")).toBe(false);
    expect(puedeCambiar("PAGADO", "CANCELADO")).toBe(false);
  });
});

describe("filtros del catalogo (la URL la puede escribir cualquiera)", () => {
  it("lee los cinco filtros de la URL", () => {
    expect(leerFiltros({ q: " molinillo ", categoria: "molinillos", marca: "molienda-co", min: "30", max: "60" })).toEqual(
      { q: "molinillo", categoria: "molinillos", marca: "molienda-co", min: 30, max: 60 }
    );
  });
  it("ignora precios que no son numeros o son negativos", () => {
    const f = leerFiltros({ min: "abc", max: "-5" });
    expect(f.min).toBeNull();
    expect(f.max).toBeNull();
  });
  it("si un parametro llega repetido, usa el primero", () => {
    expect(leerFiltros({ categoria: ["cafeteras", "molinillos"] }).categoria).toBe("cafeteras");
  });
});

describe("busqueda", () => {
  it("rodea el texto de comodines para ILIKE", () => {
    expect(patronBusqueda("etiopia")).toBe("%etiopia%");
  });
  it("escapa los % y _ del usuario: buscar '50%' no es un comodin", () => {
    expect(patronBusqueda("50%_x")).toBe("%50\\%\\_x%");
  });
});

describe("ofertas", () => {
  it("el Fresa Pro de 59,00 a 47,20 es un -20 %", () => {
    expect(porcentajeDescuento(4720, 5900)).toBe(20);
  });
  it("sin precio anterior, o si no es mas caro, no hay oferta", () => {
    expect(porcentajeDescuento(4720, null)).toBeNull();
    expect(porcentajeDescuento(5900, 5900)).toBeNull();
  });
});
