-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "driver_visit_id" INTEGER;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_driver_visit_id_fkey" FOREIGN KEY ("driver_visit_id") REFERENCES "driver_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
