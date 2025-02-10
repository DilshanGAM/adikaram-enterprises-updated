-- AddForeignKey
ALTER TABLE "return_bill" ADD CONSTRAINT "return_bill_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
