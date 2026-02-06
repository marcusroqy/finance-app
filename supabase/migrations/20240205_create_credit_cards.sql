-- Create the credit_cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name VARCHAR(50) NOT NULL,
  last_4_digits VARCHAR(4),
  brand VARCHAR(20),
  color VARCHAR(20) DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for credit_cards
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" 
ON credit_cards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" 
ON credit_cards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" 
ON credit_cards FOR DELETE 
USING (auth.uid() = user_id);

-- Add card_id to transactions
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'card_id') THEN
    ALTER TABLE transactions ADD COLUMN card_id UUID REFERENCES credit_cards(id);
  END IF;
END $$;
