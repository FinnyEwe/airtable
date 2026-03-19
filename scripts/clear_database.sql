-- Run this in your Neon SQL Editor to clear all data and free up space
-- This will CASCADE delete all Cells automatically

-- Option 1: Delete all rows (this will also delete all cells via CASCADE)
DELETE FROM "Row";

-- Option 2: If you want to keep the schema but start fresh, also clear views
-- DELETE FROM "ViewFilter";
-- DELETE FROM "ViewSort"; 
-- DELETE FROM "ViewGroup";
-- DELETE FROM "ViewColumnVisibility";
-- DELETE FROM "View";
-- DELETE FROM "Column";
-- DELETE FROM "Table";

-- Check remaining space usage
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(pg_total_relation_size('"Row"')) as row_table_size,
    pg_size_pretty(pg_total_relation_size('"Cell"')) as cell_table_size;
