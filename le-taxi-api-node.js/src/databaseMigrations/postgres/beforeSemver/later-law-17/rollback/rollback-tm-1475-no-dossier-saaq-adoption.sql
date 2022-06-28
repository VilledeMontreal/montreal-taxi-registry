-- Requis seulement si des taxis ont déjà été créé avec ces nouveaux departements
--delete from taxi where ads_id in (select id  from "ADS" where zupc_id between 1000 and 1002);
--delete from "ADS" where zupc_id between 1000 and 1002;

delete from "ZUPC" where id between 1000 and 1002;

-- Requis seulement si des taxis ont déjà été créé avec ces nouveaux departements
--delete from taxi where driver_id in (select id from driver where departement_id in (select id from departement where numero::integer between 1000 and 1002));
--delete from driver where departement_id in (select id from departement where numero::integer between 1000 and 1002);

delete from departement where numero::integer between 1000 and 1002;

-- AUTOCOMMIT effective by default
--commit;

-- \q
