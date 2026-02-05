-- =============================================
-- HOUSEHOLD SCHEMA - Conta Compartilhada
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. Tabela households (Lares/Famílias)
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Minha Família',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela household_members (Membros)
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- 3. Tabela household_invites (Convites)
CREATE TABLE IF NOT EXISTS household_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES auth.users NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Adicionar household_id na tabela transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households ON DELETE SET NULL;

-- 5. Habilitar RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;

-- 6. Policies para households
CREATE POLICY "Users can view their households" ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update households" ON households
  FOR UPDATE USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- 7. Policies para household_members
CREATE POLICY "Members can view household members" ON household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can insert members" ON household_members
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
    OR user_id = auth.uid() -- Allow user to add themselves when accepting invite
  );

CREATE POLICY "Owners can delete members" ON household_members
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
    OR user_id = auth.uid() -- Members can remove themselves
  );

-- 8. Policies para household_invites
CREATE POLICY "Owners can manage invites" ON household_invites
  FOR ALL USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Anyone can view invite by token" ON household_invites
  FOR SELECT USING (true); -- Token validation done in app

-- 9. Atualizar policy de transactions para incluir household
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view household transactions" ON transactions
  FOR SELECT USING (
    auth.uid() = user_id 
    OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert household transactions" ON transactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update household transactions" ON transactions
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete household transactions" ON transactions
  FOR DELETE USING (
    auth.uid() = user_id 
    OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- 10. Função para criar household automaticamente para novos usuários
CREATE OR REPLACE FUNCTION create_default_household()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Criar household padrão
  INSERT INTO households (name, created_by)
  VALUES ('Minha Família', NEW.id)
  RETURNING id INTO new_household_id;
  
  -- Adicionar usuário como owner
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (new_household_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger para criar household ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created_household ON auth.users;
CREATE TRIGGER on_auth_user_created_household
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_household();

-- 12. Migrar usuários existentes (criar household para quem não tem)
DO $$
DECLARE
  user_record RECORD;
  new_household_id UUID;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM household_members)
  LOOP
    -- Criar household
    INSERT INTO households (name, created_by)
    VALUES ('Minha Família', user_record.id)
    RETURNING id INTO new_household_id;
    
    -- Adicionar como owner
    INSERT INTO household_members (household_id, user_id, role)
    VALUES (new_household_id, user_record.id, 'owner');
    
    -- Migrar transações existentes
    UPDATE transactions 
    SET household_id = new_household_id 
    WHERE user_id = user_record.id AND household_id IS NULL;
  END LOOP;
END $$;
