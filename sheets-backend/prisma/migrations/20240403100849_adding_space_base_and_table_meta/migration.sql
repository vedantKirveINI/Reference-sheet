-- AlterTable
ALTER TABLE "field" ADD COLUMN     "tableMetaId" TEXT;

-- CreateTable
CREATE TABLE "space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credit" INTEGER,
    "deleted_time" TIMESTAMP(3),
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "last_modified_by" TEXT,
    "last_modified_time" TIMESTAMP(3),

    CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL,
    "icon" TEXT,
    "schema_pass" TEXT,
    "deleted_time" TIMESTAMP(3),
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "last_modified_by" TEXT,
    "last_modified_time" TIMESTAMP(3),

    CONSTRAINT "base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_meta" (
    "id" TEXT NOT NULL,
    "base_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "db_table_name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "order" DOUBLE PRECISION NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "deleted_time" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "last_modified_by" TEXT,

    CONSTRAINT "table_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "base_order_idx" ON "base"("order");

-- CreateIndex
CREATE INDEX "table_meta_order_idx" ON "table_meta"("order");

-- AddForeignKey
ALTER TABLE "field" ADD CONSTRAINT "field_tableMetaId_fkey" FOREIGN KEY ("tableMetaId") REFERENCES "table_meta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base" ADD CONSTRAINT "base_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_meta" ADD CONSTRAINT "table_meta_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
