-- AlterTable
ALTER TABLE "OrderDetails" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetails_idempotencyKey_key" ON "OrderDetails"("idempotencyKey");
