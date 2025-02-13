/*
  Warnings:

  - You are about to drop the column `chequeNumber` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "chequeNumber",
ADD COLUMN     "notes" TEXT;
