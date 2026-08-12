-- Rename Enum
ALTER TYPE "Role" RENAME TO "Role_old";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_resource_key" ON "Permission"("action", "resource");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- Insert Default Roles
INSERT INTO "Role" ("id", "name", "description", "isSystem", "updatedAt") 
VALUES 
  ('role_admin_123', 'ADMIN', 'System Administrator', true, CURRENT_TIMESTAMP),
  ('role_manager_123', 'MANAGER', 'Store Manager', true, CURRENT_TIMESTAMP);

-- AlterTable (Add roleId)
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Map Existing Roles
UPDATE "User" SET "roleId" = 'role_admin_123' WHERE "role"::text = 'ADMIN';
UPDATE "User" SET "roleId" = 'role_manager_123' WHERE "role"::text = 'MANAGER';

-- AlterTable (Drop old role column)
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role_old";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
