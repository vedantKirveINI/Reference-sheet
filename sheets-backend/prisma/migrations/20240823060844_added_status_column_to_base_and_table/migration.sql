-- AlterTable
ALTER TABLE "base" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "table_meta" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
