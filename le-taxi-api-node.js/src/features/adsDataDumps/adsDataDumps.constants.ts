// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const tableName = `public."ADS"`;
const insertDateColumn = "added_at";
const updateDateColumn = "last_update_at";

const selectAll = `
SELECT public."ADS".id,
  public."ADS".numero,
  public."ADS".doublage,
  public."ADS".added_at,
  public."ADS".added_by,
  public."ADS".added_via,
  public."ADS".last_update_at,
  public."ADS".source,
  public."ADS".insee,
  null AS vehicle_id,
  public."ADS".category,
  public."ADS".owner_name,
  public."ADS".owner_type,
  public."ADS".zupc_id,
  public."ADS".vdm_vignette,
  public."ZUPC".nom as nom_zupc,
  public."user".email as added_by_name
FROM public."ADS"
LEFT OUTER JOIN public."ZUPC" on public."ZUPC".id = public."ADS".zupc_id
LEFT OUTER JOIN public."user" on public."user".id = public."ADS".added_by
ORDER BY id
`;

export { tableName, insertDateColumn, updateDateColumn, selectAll };
