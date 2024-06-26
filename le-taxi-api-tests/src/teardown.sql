delete from roles_users
where user_id in (
  select id
  from public.user
  where email like 'zApiTest%'
);

delete from customer
where added_by in (
  select id
  from public.user
  where email like 'zApiTest%'
);

-- truncate if you don't want to keep existing data otherwise use the deletes
-- truncate table driver, public."ADS", vehicle, vehicle_description, taxi

-- start of deletes
delete
from public."taxi" t
using public.user u
where u.id = t.added_by
and u.email like 'zApiTest%';

delete
from public."vehicle_description" vd
using public.user u
where u.id = vd.added_by
and u.email like 'zApiTest%';

delete
from public."vehicle" v
using public.user u
where u.id = v.added_by_user
and u.email like 'zApiTest%';

delete
from public."driver" d
using public.user u
where u.id = d.added_by
and u.email like 'zApiTest%';

delete
from public."ADS" ads
using public.user u
where u.id = ads.added_by
and u.email like 'zApiTest%';
-- end of deletes

-- then delete the tests users
delete from public.user
where email like 'zApiTest%';