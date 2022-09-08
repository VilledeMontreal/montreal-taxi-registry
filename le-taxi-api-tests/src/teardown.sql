truncate table driver, public."ADS", vehicle, vehicle_description, taxi

delete from roles_users
where user_id in (
  select id
  from public.user
  where email like 'zApiTest%'
)

delete from customer
where added_by in (
  select id
  from public.user
  where email like 'zApiTest%'
)

delete from public.user
where email like 'zApiTest%'





