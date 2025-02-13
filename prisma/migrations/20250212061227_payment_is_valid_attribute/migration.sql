-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "chequeNumber" TEXT,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true;
