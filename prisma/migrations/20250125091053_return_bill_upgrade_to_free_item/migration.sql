-- AlterTable
ALTER TABLE "return_bill_item" ADD COLUMN     "invoice_free_item_id" INTEGER;

-- AddForeignKey
ALTER TABLE "return_bill_item" ADD CONSTRAINT "return_bill_item_invoice_free_item_id_fkey" FOREIGN KEY ("invoice_free_item_id") REFERENCES "free_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
