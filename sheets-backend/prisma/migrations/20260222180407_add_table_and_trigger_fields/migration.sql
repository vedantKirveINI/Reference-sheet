/*
  Warnings:

  - Added the required column `data_stream_id` to the `trigger_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "table_meta" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "source_id" TEXT;

-- AlterTable
ALTER TABLE "trigger_schedule" ADD COLUMN     "data_stream_id" TEXT NOT NULL,
ADD COLUMN     "deletedTime" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "trigger_schedule_data_stream_id_idx" ON "trigger_schedule"("data_stream_id");

-- AddForeignKey
ALTER TABLE "trigger_schedule" ADD CONSTRAINT "trigger_schedule_data_stream_id_fkey" FOREIGN KEY ("data_stream_id") REFERENCES "data_stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
