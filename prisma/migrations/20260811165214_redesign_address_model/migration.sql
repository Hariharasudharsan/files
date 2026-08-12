/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Address` table. All the data in the column will be lost.
  - Added the required column `flatOrHouseNumber` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localityOrArea` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "postalCode",
ADD COLUMN     "flatOrHouseNumber" TEXT NOT NULL,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "localityOrArea" TEXT NOT NULL,
ADD COLUMN     "pincode" TEXT NOT NULL;
