/*
  Warnings:

  - The `sort` column on the `view` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `filter` column on the `view` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `group` column on the `view` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `options` column on the `view` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "view" DROP COLUMN "sort",
ADD COLUMN     "sort" JSONB,
DROP COLUMN "filter",
ADD COLUMN     "filter" JSONB,
DROP COLUMN "group",
ADD COLUMN     "group" JSONB,
DROP COLUMN "options",
ADD COLUMN     "options" JSONB;
