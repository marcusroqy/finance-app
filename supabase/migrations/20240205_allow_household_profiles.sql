-- Allow users to view profiles of other members in the same household

create policy "Users can view profiles of household members"
on profiles for select
to authenticated
using (
  exists (
    select 1 from household_members hm_me
    join household_members hm_target on hm_me.household_id = hm_target.household_id
    where hm_me.user_id = auth.uid()
    and hm_target.user_id = profiles.id
  )
);
