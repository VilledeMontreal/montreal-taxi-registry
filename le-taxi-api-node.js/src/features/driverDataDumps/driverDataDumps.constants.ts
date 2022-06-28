// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const tableName = 'public.driver';
const insertDateColumn = 'public.driver.added_at';
const updateDateColumn = 'public.driver.last_update_at';

const selectAll = `
SELECT public.driver.added_at,
  public.driver.added_via,
  public.driver.source,
  public.driver.last_update_at,
  public.driver.id,
  public.driver.departement_id,
  public.driver.added_by,
  public.driver.birth_date,
  public.driver.first_name,
  public.driver.last_name,
  public.driver.professional_licence,
  public."user".email as added_by_name
FROM public.driver
LEFT OUTER JOIN public."user" on public."user".id = public.driver.added_by
ORDER BY id
`;

export { tableName, insertDateColumn, updateDateColumn, selectAll };
