-- CreateTable
CREATE TABLE "driver_visit" (
    "id" SERIAL NOT NULL,
    "driver_name" TEXT NOT NULL,
    "verified_by" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "notes" TEXT,

    CONSTRAINT "driver_visit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "driver_visit" ADD CONSTRAINT "driver_visit_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
