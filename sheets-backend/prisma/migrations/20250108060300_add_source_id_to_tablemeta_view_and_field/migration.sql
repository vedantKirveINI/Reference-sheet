-- AlterTable
ALTER TABLE "field" ADD COLUMN     "source_id" INTEGER;

-- AlterTable
ALTER TABLE "table_meta" ADD COLUMN     "source_id" TEXT;

-- AlterTable
ALTER TABLE "view" ADD COLUMN     "source_id" TEXT;
