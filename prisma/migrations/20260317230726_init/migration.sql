/*
  Warnings:

  - You are about to drop the column `createdById` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Table` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `View` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tableId,name]` on the table `Column` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tableId,order]` on the table `Row` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_createdById_fkey";

-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_createdById_fkey";

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPassword",
DROP COLUMN "role",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "View" DROP COLUMN "createdById";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ViewColumnVisibility" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "ViewColumnVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewGroup" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'asc',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "ViewGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ViewColumnVisibility_viewId_columnId_key" ON "ViewColumnVisibility"("viewId", "columnId");

-- CreateIndex
CREATE INDEX "Column_tableId_order_idx" ON "Column"("tableId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Column_tableId_name_key" ON "Column"("tableId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Row_tableId_order_key" ON "Row"("tableId", "order");

-- CreateIndex
CREATE INDEX "Table_baseId_order_idx" ON "Table"("baseId", "order");

-- CreateIndex
CREATE INDEX "View_tableId_idx" ON "View"("tableId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewColumnVisibility" ADD CONSTRAINT "ViewColumnVisibility_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewGroup" ADD CONSTRAINT "ViewGroup_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;
