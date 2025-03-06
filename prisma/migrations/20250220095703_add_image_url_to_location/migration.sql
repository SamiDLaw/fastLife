/*
  Warnings:

  - You are about to drop the `TouristActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TouristActivity` DROP FOREIGN KEY `TouristActivity_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Location` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `TouristActivity`;
