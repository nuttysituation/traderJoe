-- Remove net_worth field from investors table since we can't get real data for it
ALTER TABLE investors DROP COLUMN IF EXISTS net_worth; 