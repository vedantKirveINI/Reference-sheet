-- AlterTable
ALTER TABLE "data_stream" ADD COLUMN     "trigger_config" JSONB,
ADD COLUMN     "trigger_type" TEXT;

-- CreateTable
CREATE TABLE "scheduled_trigger" (
    "id" TEXT NOT NULL,
    "data_stream_id" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "table_id" TEXT NOT NULL,
    "original_field_id" INTEGER NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "original_time" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'active',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "next_retry_time" TIMESTAMP(3),
    "last_error" TEXT,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "deleted_time" TIMESTAMP(3),

    CONSTRAINT "scheduled_trigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_trigger_status_state_scheduled_time_idx" ON "scheduled_trigger"("status", "state", "scheduled_time");

-- CreateIndex
CREATE INDEX "scheduled_trigger_status_state_next_retry_time_idx" ON "scheduled_trigger"("status", "state", "next_retry_time");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_trigger_record_id_data_stream_id_status_original__key" ON "scheduled_trigger"("record_id", "data_stream_id", "status", "original_field_id");

-- AddForeignKey
ALTER TABLE "scheduled_trigger" ADD CONSTRAINT "scheduled_trigger_data_stream_id_fkey" FOREIGN KEY ("data_stream_id") REFERENCES "data_stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
