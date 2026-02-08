
-- Add recurring and status fields to transactions
ALTER TABLE transactions 
ADD COLUMN is_recurring BOOLEAN DEFAULT false,
ADD COLUMN recurring_day INTEGER CHECK (recurring_day BETWEEN 1 AND 31),
ADD COLUMN status TEXT CHECK (status IN ('paid', 'pending')) DEFAULT 'paid';

-- Create an index for faster filtering of pending bills
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_is_recurring ON transactions(is_recurring);
