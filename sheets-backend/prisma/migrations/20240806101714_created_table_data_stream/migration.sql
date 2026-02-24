-- CreateTable
CREATE TABLE "data_stream" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "webhook_url" TEXT NOT NULL,
    "is_streaming" BOOLEAN NOT NULL DEFAULT true,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),

    CONSTRAINT "data_stream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_stream_table_id_webhook_url_key" ON "data_stream"("table_id", "webhook_url");

-- AddForeignKey
ALTER TABLE "data_stream" ADD CONSTRAINT "data_stream_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "table_meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
