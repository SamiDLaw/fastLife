/*
  Warnings:

  - You are about to drop the column `description` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Place` DROP COLUMN `description`,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    DROP COLUMN `type`;

-- DropTable
DROP TABLE `Item`;
