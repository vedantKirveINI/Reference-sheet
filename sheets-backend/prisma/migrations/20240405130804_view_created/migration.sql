-- CreateTable
CREATE TABLE "view" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "table_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sort" TEXT,
    "filter" TEXT,
    "group" TEXT,
    "options" TEXT,
    "order" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL,
    "column_meta" TEXT NOT NULL,
    "enable_share" BOOLEAN,
    "share_id" TEXT,
    "share_meta" TEXT,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "deleted_time" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "last_modified_by" TEXT,

    CONSTRAINT "view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "view_order_idx" ON "view"("order");

-- AddForeignKey
ALTER TABLE "view" ADD CONSTRAINT "view_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "table_meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
