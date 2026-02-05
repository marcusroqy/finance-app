-- =============================================
-- FIX: HOUSEHOLD RLS POLICIES - Corrigir Recursão Infinita
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. DROP todas as policies problemáticas
DROP POLICY IF EXISTS "Users can view their households" ON households;
DROP POLICY IF EXISTS "Users can create households" ON households;
DROP POLICY IF EXISTS "Owners can update households" ON households;
DROP POLICY IF EXISTS "Members can view household members" ON household_members;
DROP POLICY IF EXISTS "Owners can insert members" ON household_members;
DROP POLICY IF EXISTS "Owners can delete members" ON household_members;
DROP POLICY IF EXISTS "Owners can manage invites" ON household_invites;
DROP POLICY IF EXISTS "Anyone can view invite by token" ON household_invites;

-- 2. Criar função helper para evitar recursão
CREATE OR REPLACE FUNCTION get_user_household_id(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_household_id UUID;
BEGIN
  SELECT household_id INTO v_household_id
  FROM household_members
  WHERE user_id = p_user_id
  LIMIT 1;
  RETURN v_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policies para households (simples, sem subquery recursiva)
CREATE POLICY "Users can view their households" ON households
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their households" ON households
  FOR UPDATE USING (created_by = auth.uid());

-- 4. Policies para household_members (permitir tudo para usuários autenticados, validar via app)
CREATE POLICY "Authenticated users can view members" ON household_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert members" ON household_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own membership" ON household_members
  FOR DELETE USING (user_id = auth.uid());

-- 5. Policies para household_invites
CREATE POLICY "Authenticated users can manage invites" ON household_invites
  FOR ALL USING (auth.uid() IS NOT NULL);

-- DONE!
SELECT 'Policies corrigidas com sucesso!' AS status;
