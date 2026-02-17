-- Add 'type' column to meetings table
ALTER TABLE meetings ADD COLUMN type TEXT CHECK(type IN ('VIRTUAL', 'PRESENCIAL')) DEFAULT 'PRESENCIAL';
