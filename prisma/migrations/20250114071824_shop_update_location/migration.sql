/*
  Warnings:

  - You are about to drop the `Batch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_addedBy_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_product_key_fkey";

-- DropTable
DROP TABLE "Batch";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '$2a$12$RdUwAbGF35Xn8/wEAcG4Q.gADhB0LiLGDUKsaRrRkuCFafavKb0x2',
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "user_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "product" (
    "barcode" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "container_type" TEXT NOT NULL,
    "uom" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "flavour" TEXT NOT NULL,
    "default_labeled_price" DOUBLE PRECISION NOT NULL,
    "default_cost" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "product_image" TEXT NOT NULL DEFAULT '/default.jpg',

    CONSTRAINT "product_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "batch" (
    "batch_id" SERIAL NOT NULL,
    "product_key" TEXT NOT NULL,
    "uom" INTEGER NOT NULL,
    "packs" INTEGER NOT NULL,
    "loose" INTEGER NOT NULL,
    "mfd" TIMESTAMP(3) NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "labeled_price" DOUBLE PRECISION NOT NULL,
    "purchase_invoice_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-stock',
    "remaining" INTEGER NOT NULL DEFAULT 0,
    "in_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "batch_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "route" (
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "shop" (
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "owner" TEXT NOT NULL,
    "max_credit" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "shop_route" (
    "order" INTEGER NOT NULL,
    "route_name" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,

    CONSTRAINT "shop_route_pkey" PRIMARY KEY ("route_name","shop_name")
);

-- CreateTable
CREATE TABLE "visit" (
    "id" SERIAL NOT NULL,
    "route_name" TEXT NOT NULL,
    "visited_by" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "confirmed_by" TEXT,
    "status" TEXT NOT NULL DEFAULT 'started',
    "notes" TEXT,

    CONSTRAINT "visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" SERIAL NOT NULL,
    "shop_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visit_id" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "delivered_date" TIMESTAMP(3),
    "type" TEXT NOT NULL DEFAULT 'on-delivery',
    "status" TEXT NOT NULL DEFAULT 'not-paid',
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_item" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "product_key" TEXT NOT NULL,
    "batch_id" INTEGER,
    "uom" INTEGER NOT NULL,
    "packs" INTEGER NOT NULL,
    "loose" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "invoice_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_item" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "product_key" TEXT NOT NULL,
    "batch_id" INTEGER,
    "uom" INTEGER NOT NULL,
    "packs" INTEGER NOT NULL,
    "loose" INTEGER NOT NULL,

    CONSTRAINT "free_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_bill" (
    "id" SERIAL NOT NULL,
    "shop_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visit_id" INTEGER NOT NULL,
    "returned_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not-covered',
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "covered_in" INTEGER,

    CONSTRAINT "return_bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_bill_item" (
    "id" SERIAL NOT NULL,
    "return_bill_id" INTEGER NOT NULL,
    "product_key" TEXT NOT NULL,
    "batch_id" INTEGER,
    "uom" INTEGER NOT NULL,
    "packs" INTEGER NOT NULL,
    "loose" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "invoice_item_id" INTEGER,
    "invoice" INTEGER,
    "reason" TEXT NOT NULL DEFAULT 'expired',

    CONSTRAINT "return_bill_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "shop_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visit_id" INTEGER,
    "invoice_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'cash',
    "return_bill_id" INTEGER,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_key_key" ON "product"("key");

-- CreateIndex
CREATE UNIQUE INDEX "route_name_key" ON "route"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shop_name_key" ON "shop"("name");

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_product_key_fkey" FOREIGN KEY ("product_key") REFERENCES "product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_route" ADD CONSTRAINT "shop_route_route_name_fkey" FOREIGN KEY ("route_name") REFERENCES "route"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_route" ADD CONSTRAINT "shop_route_shop_name_fkey" FOREIGN KEY ("shop_name") REFERENCES "shop"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit" ADD CONSTRAINT "visit_route_name_fkey" FOREIGN KEY ("route_name") REFERENCES "route"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit" ADD CONSTRAINT "visit_visited_by_fkey" FOREIGN KEY ("visited_by") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit" ADD CONSTRAINT "visit_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "user"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_shop_name_fkey" FOREIGN KEY ("shop_name") REFERENCES "shop"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_product_key_fkey" FOREIGN KEY ("product_key") REFERENCES "product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_item" ADD CONSTRAINT "free_item_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_item" ADD CONSTRAINT "free_item_product_key_fkey" FOREIGN KEY ("product_key") REFERENCES "product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_item" ADD CONSTRAINT "free_item_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bill" ADD CONSTRAINT "return_bill_shop_name_fkey" FOREIGN KEY ("shop_name") REFERENCES "shop"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bill_item" ADD CONSTRAINT "return_bill_item_return_bill_id_fkey" FOREIGN KEY ("return_bill_id") REFERENCES "return_bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bill_item" ADD CONSTRAINT "return_bill_item_product_key_fkey" FOREIGN KEY ("product_key") REFERENCES "product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bill_item" ADD CONSTRAINT "return_bill_item_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bill_item" ADD CONSTRAINT "return_bill_item_invoice_item_id_fkey" FOREIGN KEY ("invoice_item_id") REFERENCES "invoice_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bill_item" ADD CONSTRAINT "return_bill_item_invoice_fkey" FOREIGN KEY ("invoice") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_return_bill_id_fkey" FOREIGN KEY ("return_bill_id") REFERENCES "return_bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_shop_name_fkey" FOREIGN KEY ("shop_name") REFERENCES "shop"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
