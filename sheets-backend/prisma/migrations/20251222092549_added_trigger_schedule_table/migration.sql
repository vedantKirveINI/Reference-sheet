/*
  Warnings:

  - You are about to drop the column `trigger_config` on the `data_stream` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[record_id,trigger_schedule_id,status,scheduled_time]` on the table `scheduled_trigger` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trigger_schedule_id` to the `scheduled_trigger` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "scheduled_trigger_record_id_data_stream_id_status_original__key";

-- AlterTable
ALTER TABLE "data_stream" DROP COLUMN "trigger_config";

-- AlterTable
ALTER TABLE "scheduled_trigger" ADD COLUMN     "trigger_schedule_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "trigger_schedule" (
    "id" TEXT NOT NULL,
    "data_stream_id" TEXT NOT NULL,
    "field_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "offset_minutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "deleted_time" TIMESTAMP(3),

    CONSTRAINT "trigger_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trigger_schedule_data_stream_id_idx" ON "trigger_schedule"("data_stream_id");

-- CreateIndex
CREATE UNIQUE INDEX "trigger_schedule_data_stream_id_field_id_type_offset_minute_key" ON "trigger_schedule"("data_stream_id", "field_id", "type", "offset_minutes", "status");

-- CreateIndex
CREATE INDEX "scheduled_trigger_trigger_schedule_id_idx" ON "scheduled_trigger"("trigger_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_trigger_record_id_trigger_schedule_id_status_sche_key" ON "scheduled_trigger"("record_id", "trigger_schedule_id", "status", "scheduled_time");

-- AddForeignKey
ALTER TABLE "trigger_schedule" ADD CONSTRAINT "trigger_schedule_data_stream_id_fkey" FOREIGN KEY ("data_stream_id") REFERENCES "data_stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_trigger" ADD CONSTRAINT "scheduled_trigger_trigger_schedule_id_fkey" FOREIGN KEY ("trigger_schedule_id") REFERENCES "trigger_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
