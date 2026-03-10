-- Rename Field → Column and Record → Row
-- SQLite does not update FK references automatically on table rename,
-- so we recreate Cell with the new column names and copy the data.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- 1. Rename Field table to Column
ALTER TABLE "Field" RENAME TO "Column";

-- 2. Rename Record table to Row
ALTER TABLE "Record" RENAME TO "Row";

-- 3. Recreate Cell with rowId / columnId instead of recordId / fieldId
CREATE TABLE "new_Cell" (
    "id"       TEXT NOT NULL PRIMARY KEY,
    "value"    TEXT,
    "rowId"    TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    CONSTRAINT "Cell_rowId_fkey"    FOREIGN KEY ("rowId")    REFERENCES "Row"    ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Cell" ("id", "value", "rowId", "columnId")
SELECT "id", "value", "recordId", "fieldId" FROM "Cell";

DROP TABLE "Cell";
ALTER TABLE "new_Cell" RENAME TO "Cell";

CREATE UNIQUE INDEX "Cell_rowId_columnId_key" ON "Cell"("rowId", "columnId");

PRAGMA defer_foreign_keys=OFF;
PRAGMA foreign_keys=ON;
