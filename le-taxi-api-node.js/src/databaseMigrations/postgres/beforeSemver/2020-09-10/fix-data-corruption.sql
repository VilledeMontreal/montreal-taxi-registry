-- link taxis of each operator with its own drivers
update taxi 
set driver_id = realDriver.id
from driver as wrongDriver, driver as realDriver
where 
taxi.driver_id = wrongDriver.id and
taxi.added_by != wrongdriver.added_by and
taxi.added_by = realDriver.added_by and
realDriver.professional_licence = wrongdriver.professional_licence 

-- link taxis of each operator with its own ads
update taxi 
set ads_id = realAds.id
from "ADS" as wrongAds, "ADS" as realAds
where 
taxi.ads_id = wrongAds.id and
taxi.added_by != wrongAds.added_by and
taxi.added_by = realAds.added_by and
realAds.insee = wrongAds.insee and 
realAds.numero = wrongAds.numero 

-- relink taxi to the latest duplicated vehicles 
update taxi 
set vehicle_id = latestDuplicate.latestId
from vehicle join
(
	select v.added_by_user, v.licence_plate, max(v.id) as latestId
	from vehicle v
	group by v.added_by_user, v.licence_plate 
) latestDuplicate on vehicle.added_by_user = latestduplicate.added_by_user and vehicle.licence_plate =latestduplicate.licence_plate 
where 
  vehicle.id != latestDuplicate.latestId and 
  taxi.vehicle_id = vehicle.id 

-- delete duplicated vehicle_description 
DELETE FROM vehicle_description 
where vehicle_id IN (
  select vehicle.id 
  from vehicle join
  (
	select v.added_by_user, v.licence_plate, max(v.id) as latestId
	from vehicle v
	group by v.added_by_user, v.licence_plate 
  ) latestDuplicate on 
      vehicle.added_by_user = latestduplicate.added_by_user and 
      vehicle.licence_plate =latestduplicate.licence_plate 
  where 
    vehicle.id != latestDuplicate.latestId
)

-- delete duplicated vehicle
DELETE FROM vehicle
where id IN (
  select vehicle.id 
  from vehicle join
  (
	select v.added_by_user, v.licence_plate, max(v.id) as latestId
	from vehicle v
	group by v.added_by_user, v.licence_plate 
  ) latestDuplicate on 
      vehicle.added_by_user = latestduplicate.added_by_user and 
      vehicle.licence_plate =latestduplicate.licence_plate 
  where 
    vehicle.id != latestDuplicate.latestId
)

-- Cannot create unique constraint on vehicle licence_plate + added_by_user,
-- because the database design represent vehicle with two tables. 
-- The table vehicle contains licence_plate and the table vehicle_description contains added_by_user

-- Cannot create unique constraint on the vehicle, ads, driver, operator combination,
-- because, we cannot ask all operators to resync their taxis.
-- We will have to live with the +/- 784 combinations with duplicated taxis created in the past.
-- In the future, new vehicle, ads, driver, operator combinations will be unique.
