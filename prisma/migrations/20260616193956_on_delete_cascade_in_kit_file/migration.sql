-- DropForeignKey
ALTER TABLE "kit_files" DROP CONSTRAINT "kit_files_kitId_fkey";

-- AddForeignKey
ALTER TABLE "kit_files" ADD CONSTRAINT "kit_files_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
