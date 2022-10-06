// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from '../../../features/shared/taxiPostgre/taxiPostgre';

export async function pg_1_0_11_remove_hailing(): Promise<void> {
  await postgrePool.query(`DROP TABLE IF EXISTS public."hail" CASCADE`);
  await postgrePool.query(`DROP SEQUENCE IF EXISTS hail_id_seq`);
  await postgrePool.query(`ALTER TABLE public."user"
  DROP COLUMN IF EXISTS is_hail_enabled,
  DROP COLUMN IF EXISTS hail_endpoint_production;`);
}
