-- AlterTable
ALTER TABLE "data_stream" ADD COLUMN     "linked_asset_id" TEXT,
ALTER COLUMN "is_streaming" SET DEFAULT false;
