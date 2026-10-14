-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "precioAnterior" INTEGER;

-- Busqueda sin tildes: la extension unaccent de PostgreSQL convierte "Etiopía" en "Etiopia".
-- (Anadido a mano: Prisma no gestiona extensiones en este schema)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Primera oferta: Molinillo manual Fresa Pro, de 59,00 a 47,20 EUR (-20 %).
-- Es un cambio de DATOS dentro de una migracion: asi llega igual a cualquier base ya sembrada sin relanzar el seed
-- (el seed borra los pedidos). Si el producto no existe, no hace nada.
UPDATE "Producto" SET "precioAnterior" = "precio", "precio" = 4720
WHERE "slug" = 'molinillo-manual-fresa-pro' AND "precioAnterior" IS NULL;
