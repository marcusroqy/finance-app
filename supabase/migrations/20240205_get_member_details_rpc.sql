-- Secure function to fetch details of a household member directly from auth.users
-- This bypasses the need for a public profile row, but enforces household membership check.

create or replace function public.get_household_member_details(target_user_id uuid)
returns table (
  email varchar,
  full_name text,
  avatar_url text
) 
security definer
language plpgsql
as $$
declare
  requester_household_id uuid;
  target_household_id uuid;
begin
  -- Get requester's household
  select household_id into requester_household_id
  from household_members
  where user_id = auth.uid()
  limit 1;

  -- Get target's household (verify they are in the same one)
  select household_id into target_household_id
  from household_members
  where user_id = target_user_id
  and household_id = requester_household_id
  limit 1;

  -- If not in same household, return empty/null
  if target_household_id is null then
    return;
  end if;

  -- Return data from auth.users
  return query
  select 
    au.email::varchar,
    (au.raw_user_meta_data->>'full_name')::text,
    (au.raw_user_meta_data->>'avatar_url')::text
  from auth.users au
  where au.id = target_user_id;
end;
$$;
