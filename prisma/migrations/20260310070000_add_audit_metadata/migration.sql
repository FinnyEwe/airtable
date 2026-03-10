-- Add createdById (nullable) to Table, Column, Row, View
ALTER TABLE "Table"  ADD COLUMN "createdById" TEXT;
ALTER TABLE "Column" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Row"    ADD COLUMN "createdById" TEXT;
ALTER TABLE "View"   ADD COLUMN "createdById" TEXT;

-- Add createdAt / updatedAt to Cell (NOT NULL → recreate the table)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Cell" (
    "id"        TEXT     NOT NULL PRIMARY KEY,
    "value"     TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowId"     TEXT     NOT NULL,
    "columnId"  TEXT     NOT NULL,
    CONSTRAINT "Cell_rowId_fkey"    FOREIGN KEY ("rowId")    REFERENCES "Row"    ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Cell" ("id", "value", "rowId", "columnId", "createdAt", "updatedAt")
SELECT "id", "value", "rowId", "columnId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Cell";

DROP TABLE "Cell";
ALTER TABLE "new_Cell" RENAME TO "Cell";
CREATE UNIQUE INDEX "Cell_rowId_columnId_key" ON "Cell"("rowId", "columnId");

PRAGMA defer_foreign_keys=OFF;
PRAGMA foreign_keys=ON;
