/*
  Warnings:

  - You are about to drop the column `loose` on the `return_bill_item` table. All the data in the column will be lost.
  - You are about to drop the column `packs` on the `return_bill_item` table. All the data in the column will be lost.
  - You are about to drop the column `uom` on the `return_bill_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "return_bill_item" DROP COLUMN "loose",
DROP COLUMN "packs",
DROP COLUMN "uom";
