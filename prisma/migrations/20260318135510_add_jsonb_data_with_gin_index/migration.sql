-- AlterTable
ALTER TABLE "Row" ADD COLUMN     "data" JSONB;

-- Make the unique constraint DEFERRABLE to allow row reordering without transient violations
-- First drop the unique index, then add it back as a DEFERRABLE constraint
DROP INDEX IF EXISTS "Row_tableId_order_key";
ALTER TABLE "Row" ADD CONSTRAINT "Row_tableId_order_key" UNIQUE ("tableId", "order") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
CREATE INDEX "Row_data_idx" ON "Row" USING GIN ("data");

-- CreateIndex
CREATE INDEX "Row_tableId_idx" ON "Row"("tableId");
