// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const tableName = 'public.taxi';
const insertDateColumn = 'public.taxi.added_at';
const updateDateColumn = 'public.taxi.last_update_at';

const selectAll = `
SELECT public.taxi.added_at,
  public.taxi.added_via,
  public.taxi.source,
  public.taxi.last_update_at,
  public.taxi.id,
  public.taxi.vehicle_id,
  public.taxi.ads_id,
  public.taxi.added_by,
  public.taxi.driver_id,
  public.taxi.rating,
  public.taxi.private,
  null as current_hail_id,
  public.taxi.ban_begin,
  public.taxi.ban_end,
  public."user".email as added_by_name
FROM public.taxi
LEFT OUTER JOIN public."user" on public."user".id = public.taxi.added_by
ORDER BY id
`;

export { tableName, insertDateColumn, updateDateColumn, selectAll };
