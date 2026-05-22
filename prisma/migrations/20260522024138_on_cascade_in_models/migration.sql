-- DropForeignKey
ALTER TABLE "kit_products" DROP CONSTRAINT "kit_products_kitId_fkey";

-- DropForeignKey
ALTER TABLE "kit_products" DROP CONSTRAINT "kit_products_productId_fkey";

-- DropForeignKey
ALTER TABLE "mobile_lab_files" DROP CONSTRAINT "mobile_lab_files_mobileLabId_fkey";

-- DropForeignKey
ALTER TABLE "mobile_lab_kits" DROP CONSTRAINT "mobile_lab_kits_kitId_fkey";

-- DropForeignKey
ALTER TABLE "mobile_lab_kits" DROP CONSTRAINT "mobile_lab_kits_mobileLabId_fkey";

-- DropForeignKey
ALTER TABLE "mobile_lab_products" DROP CONSTRAINT "mobile_lab_products_mobileLabId_fkey";

-- DropForeignKey
ALTER TABLE "mobile_lab_products" DROP CONSTRAINT "mobile_lab_products_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_files" DROP CONSTRAINT "product_files_productId_fkey";

-- DropForeignKey
ALTER TABLE "subcategories" DROP CONSTRAINT "subcategories_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_products" ADD CONSTRAINT "kit_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_products" ADD CONSTRAINT "kit_products_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_files" ADD CONSTRAINT "mobile_lab_files_mobileLabId_fkey" FOREIGN KEY ("mobileLabId") REFERENCES "mobile_labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_products" ADD CONSTRAINT "mobile_lab_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_products" ADD CONSTRAINT "mobile_lab_products_mobileLabId_fkey" FOREIGN KEY ("mobileLabId") REFERENCES "mobile_labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_kits" ADD CONSTRAINT "mobile_lab_kits_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_kits" ADD CONSTRAINT "mobile_lab_kits_mobileLabId_fkey" FOREIGN KEY ("mobileLabId") REFERENCES "mobile_labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
