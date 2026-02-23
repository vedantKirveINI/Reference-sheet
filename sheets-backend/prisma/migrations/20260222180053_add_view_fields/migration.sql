-- AlterTable
ALTER TABLE "view" ADD COLUMN     "lastModifiedBy" TEXT,
ADD COLUMN     "shareMeta" JSONB,
ADD COLUMN     "user_id" TEXT;
