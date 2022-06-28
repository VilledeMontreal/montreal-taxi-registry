// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const tableName = 'public.vehicle_description';
const insertDateColumn = 'public.vehicle_description.added_at';
const updateDateColumn = 'public.vehicle_description."last_nonStatus_update_at"';

const selectAll = `
SELECT
  public.vehicle.licence_plate,
  public.vehicle_description.added_at,
  public.vehicle_description.added_via,
  public.vehicle_description.source,
  public.vehicle_description.last_update_at,
  public.vehicle_description.id,
  public.vehicle_description.model_id,
  public.vehicle_description.constructor_id,
  public.vehicle_description.model_year,
  public.vehicle_description.engine,
  public.vehicle_description.horse_power,
  public.vehicle_description.relais,
  public.vehicle_description.horodateur,
  public.vehicle_description.taximetre,
  public.vehicle_description.date_dernier_ct,
  public.vehicle_description.date_validite_ct,
  public.vehicle_description.special_need_vehicle,
  public.vehicle_description.type_,
  public.vehicle_description.luxury,
  public.vehicle_description.credit_card_accepted,
  public.vehicle_description.nfc_cc_accepted,
  public.vehicle_description.amex_accepted,
  public.vehicle_description.bank_check_accepted,
  public.vehicle_description.fresh_drink,
  public.vehicle_description.dvd_player,
  public.vehicle_description.tablet,
  public.vehicle_description.wifi,
  public.vehicle_description.baby_seat,
  public.vehicle_description.bike_accepted,
  public.vehicle_description.pet_accepted,
  public.vehicle_description.air_con,
  public.vehicle_description.electronic_toll,
  public.vehicle_description.gps,
  public.vehicle_description.cpam_conventionne,
  public.vehicle_description.every_destination,
  public.vehicle_description.color,
  public.vehicle_description.vehicle_id,
  public.vehicle_description.added_by,
  public.vehicle_description.nb_seats,
  public.vehicle_description."last_nonStatus_update_at",
  public.vehicle_description.vehicle_identification_number,
  public.model.name as modelName,
  public.constructor.name as constructorName,
  public."user".email as added_By_name,
  false as private,
  'off' as status
FROM public.vehicle_description
LEFT OUTER JOIN public.vehicle on public.vehicle.id = public.vehicle_description.vehicle_id
LEFT OUTER JOIN public.model on public.model.id = public.vehicle_description.model_id
LEFT OUTER JOIN public.constructor on public.constructor.id = public.vehicle_description.constructor_id
LEFT OUTER JOIN public."user" on public."user".id = public.vehicle_description.added_by
ORDER BY id
`;

export { tableName, insertDateColumn, updateDateColumn, selectAll };
