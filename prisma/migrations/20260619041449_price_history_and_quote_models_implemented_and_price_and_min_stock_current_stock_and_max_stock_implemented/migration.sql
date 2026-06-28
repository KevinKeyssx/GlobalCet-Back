-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'SENT_TO_CLIENT', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "kits" ADD COLUMN     "currentPrice" DECIMAL(65,30),
ADD COLUMN     "currentStock" INTEGER DEFAULT 0,
ADD COLUMN     "maxStock" INTEGER DEFAULT 0,
ADD COLUMN     "minStock" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "mobile_labs" ADD COLUMN     "currentPrice" DECIMAL(65,30),
ADD COLUMN     "currentStock" INTEGER DEFAULT 0,
ADD COLUMN     "maxStock" INTEGER DEFAULT 0,
ADD COLUMN     "minStock" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "currentPrice" DECIMAL(65,30),
ADD COLUMN     "currentStock" INTEGER DEFAULT 54,
ADD COLUMN     "maxStock" INTEGER DEFAULT 100,
ADD COLUMN     "minStock" INTEGER DEFAULT 54;

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "clientData" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_histories" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT,
    "kitId" TEXT,
    "mobileLabId" TEXT,

    CONSTRAINT "price_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quoteNumber_key" ON "quotes"("quoteNumber");

-- CreateIndex
CREATE INDEX "price_histories_productId_idx" ON "price_histories"("productId");

-- CreateIndex
CREATE INDEX "price_histories_kitId_idx" ON "price_histories"("kitId");

-- CreateIndex
CREATE INDEX "price_histories_mobileLabId_idx" ON "price_histories"("mobileLabId");

-- AddForeignKey
ALTER TABLE "price_histories" ADD CONSTRAINT "price_histories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_histories" ADD CONSTRAINT "price_histories_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_histories" ADD CONSTRAINT "price_histories_mobileLabId_fkey" FOREIGN KEY ("mobileLabId") REFERENCES "mobile_labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
