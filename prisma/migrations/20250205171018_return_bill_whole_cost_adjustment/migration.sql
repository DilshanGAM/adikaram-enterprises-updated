/*
  Warnings:

  - Added the required column `value` to the `return_bill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "return_bill" ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;
