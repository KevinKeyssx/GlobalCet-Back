/*
  Warnings:

  - You are about to drop the column `code` on the `kits` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `mobile_labs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `kits` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `mobile_labs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `kits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `mobile_labs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "kits_code_key";

-- DropIndex
DROP INDEX "mobile_labs_code_key";

-- AlterTable
ALTER TABLE "kits" DROP COLUMN "code",
ADD COLUMN     "sku" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "mobile_labs" DROP COLUMN "code",
ADD COLUMN     "sku" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "kits_sku_key" ON "kits"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_labs_sku_key" ON "mobile_labs"("sku");
