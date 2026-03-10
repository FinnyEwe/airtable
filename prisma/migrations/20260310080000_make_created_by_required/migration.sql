-- Make createdById NOT NULL on Table, Column, Row, View.
-- Backfill: trace each row back through Base to use Base.createdById.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- ─── Table ────────────────────────────────────────────────────────────────────
CREATE TABLE "new_Table" (
    "id"          TEXT     NOT NULL PRIMARY KEY,
    "name"        TEXT     NOT NULL,
    "order"       INTEGER  NOT NULL DEFAULT 0,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baseId"      TEXT     NOT NULL,
    "createdById" TEXT     NOT NULL,
    CONSTRAINT "Table_baseId_fkey"      FOREIGN KEY ("baseId")      REFERENCES "Base" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Table_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON UPDATE CASCADE
);
INSERT INTO "new_Table" ("id", "name", "order", "createdAt", "updatedAt", "baseId", "createdById")
SELECT t."id", t."name", t."order", t."createdAt", t."updatedAt", t."baseId",
       COALESCE(t."createdById", (SELECT b."createdById" FROM "Base" b WHERE b."id" = t."baseId"))
FROM "Table" t;
DROP TABLE "Table";
ALTER TABLE "new_Table" RENAME TO "Table";

-- ─── Column ───────────────────────────────────────────────────────────────────
CREATE TABLE "new_Column" (
    "id"          TEXT     NOT NULL PRIMARY KEY,
    "name"        TEXT     NOT NULL,
    "type"        TEXT     NOT NULL,
    "order"       INTEGER  NOT NULL DEFAULT 0,
    "config"      TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tableId"     TEXT     NOT NULL,
    "createdById" TEXT     NOT NULL,
    CONSTRAINT "Column_tableId_fkey"     FOREIGN KEY ("tableId")     REFERENCES "Table" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Column_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"  ("id") ON UPDATE CASCADE
);
INSERT INTO "new_Column" ("id", "name", "type", "order", "config", "createdAt", "updatedAt", "tableId", "createdById")
SELECT c."id", c."name", c."type", c."order", c."config", c."createdAt", c."updatedAt", c."tableId",
       COALESCE(c."createdById", (SELECT b."createdById" FROM "Base" b JOIN "Table" t ON t."baseId" = b."id" WHERE t."id" = c."tableId"))
FROM "Column" c;
DROP TABLE "Column";
ALTER TABLE "new_Column" RENAME TO "Column";

-- ─── Row ──────────────────────────────────────────────────────────────────────
CREATE TABLE "new_Row" (
    "id"          TEXT     NOT NULL PRIMARY KEY,
    "order"       INTEGER  NOT NULL DEFAULT 0,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tableId"     TEXT     NOT NULL,
    "createdById" TEXT     NOT NULL,
    CONSTRAINT "Row_tableId_fkey"     FOREIGN KEY ("tableId")     REFERENCES "Table" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Row_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"  ("id") ON UPDATE CASCADE
);
INSERT INTO "new_Row" ("id", "order", "createdAt", "updatedAt", "tableId", "createdById")
SELECT r."id", r."order", r."createdAt", r."updatedAt", r."tableId",
       COALESCE(r."createdById", (SELECT b."createdById" FROM "Base" b JOIN "Table" t ON t."baseId" = b."id" WHERE t."id" = r."tableId"))
FROM "Row" r;
DROP TABLE "Row";
ALTER TABLE "new_Row" RENAME TO "Row";

-- ─── View ─────────────────────────────────────────────────────────────────────
CREATE TABLE "new_View" (
    "id"          TEXT     NOT NULL PRIMARY KEY,
    "name"        TEXT     NOT NULL,
    "type"        TEXT     NOT NULL,
    "order"       INTEGER  NOT NULL DEFAULT 0,
    "config"      TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tableId"     TEXT     NOT NULL,
    "createdById" TEXT     NOT NULL,
    CONSTRAINT "View_tableId_fkey"     FOREIGN KEY ("tableId")     REFERENCES "Table" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "View_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"  ("id") ON UPDATE CASCADE
);
INSERT INTO "new_View" ("id", "name", "type", "order", "config", "createdAt", "updatedAt", "tableId", "createdById")
SELECT v."id", v."name", v."type", v."order", v."config", v."createdAt", v."updatedAt", v."tableId",
       COALESCE(v."createdById", (SELECT b."createdById" FROM "Base" b JOIN "Table" t ON t."baseId" = b."id" WHERE t."id" = v."tableId"))
FROM "View" v;
DROP TABLE "View";
ALTER TABLE "new_View" RENAME TO "View";

PRAGMA defer_foreign_keys=OFF;
PRAGMA foreign_keys=ON;
