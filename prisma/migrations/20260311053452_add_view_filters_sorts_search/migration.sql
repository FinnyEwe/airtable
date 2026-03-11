-- AlterTable
ALTER TABLE "View" ADD COLUMN     "searchQuery" TEXT;

-- CreateTable
CREATE TABLE "ViewFilter" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "ViewFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewSort" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'asc',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "ViewSort_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ViewFilter" ADD CONSTRAINT "ViewFilter_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewSort" ADD CONSTRAINT "ViewSort_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;
