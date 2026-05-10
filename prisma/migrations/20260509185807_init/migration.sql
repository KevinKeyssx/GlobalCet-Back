-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "material" TEXT,
    "technical_specs" JSONB DEFAULT '{}',
    "subcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_products" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,

    CONSTRAINT "kit_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_labs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dimensions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_lab_products" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    "mobileLabId" TEXT NOT NULL,

    CONSTRAINT "mobile_lab_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_lab_kits" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "kitId" TEXT NOT NULL,
    "mobileLabId" TEXT NOT NULL,

    CONSTRAINT "mobile_lab_kits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_technical_specs_idx" ON "products"("technical_specs");

-- CreateIndex
CREATE UNIQUE INDEX "kits_code_key" ON "kits"("code");

-- CreateIndex
CREATE UNIQUE INDEX "kit_products_productId_kitId_key" ON "kit_products"("productId", "kitId");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_labs_code_key" ON "mobile_labs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_lab_products_productId_mobileLabId_key" ON "mobile_lab_products"("productId", "mobileLabId");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_lab_kits_kitId_mobileLabId_key" ON "mobile_lab_kits"("kitId", "mobileLabId");

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_products" ADD CONSTRAINT "kit_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_products" ADD CONSTRAINT "kit_products_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_products" ADD CONSTRAINT "mobile_lab_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_products" ADD CONSTRAINT "mobile_lab_products_mobileLabId_fkey" FOREIGN KEY ("mobileLabId") REFERENCES "mobile_labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_kits" ADD CONSTRAINT "mobile_lab_kits_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_lab_kits" ADD CONSTRAINT "mobile_lab_kits_mobileLabId_fkey" FOREIGN KEY ("mobileLabId") REFERENCES "mobile_labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
