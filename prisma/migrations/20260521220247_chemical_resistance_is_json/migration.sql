/*
  Warnings:

  - The `chemicalResistance` column on the `materials` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "materials" DROP COLUMN "chemicalResistance",
ADD COLUMN     "chemicalResistance" JSONB;
