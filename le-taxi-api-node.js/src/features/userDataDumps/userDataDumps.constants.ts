// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const selectAll = `
SELECT
  R.id as id,
  R.active as is_active,
  R.commercial_name as name,
  L.role_id as role_id
FROM public.user as R
LEFT JOIN public.roles_users as L ON R.id = L.user_id;
`;
