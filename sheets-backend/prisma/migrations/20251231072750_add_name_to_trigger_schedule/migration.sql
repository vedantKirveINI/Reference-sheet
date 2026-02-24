/*
  Warnings:

  - Added the required column `name` to the `trigger_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trigger_schedule" ADD COLUMN     "name" TEXT NOT NULL;
