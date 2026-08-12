/*
  Warnings:

  - You are about to drop the column `content` on the `CmsPage` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `CmsPage` table. All the data in the column will be lost.
  - You are about to drop the `PaymentWebhook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReplayQueue` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "CmsPage" DROP COLUMN "content",
DROP COLUMN "isPublished",
ADD COLUMN     "activeVersionId" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "FeatureFlag" ADD COLUMN     "rules" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "shippingAddress" JSONB;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "wholesalePrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isB2B" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "PaymentWebhook";

-- DropTable
DROP TABLE "ReplayQueue";

-- CreateTable
CREATE TABLE "CmsPageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsPageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsPageVersion_pageId_version_key" ON "CmsPageVersion"("pageId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_name_key" ON "NotificationTemplate"("name");

-- AddForeignKey
ALTER TABLE "CmsPageVersion" ADD CONSTRAINT "CmsPageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
