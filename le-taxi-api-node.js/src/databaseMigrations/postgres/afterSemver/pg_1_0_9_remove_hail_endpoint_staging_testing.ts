// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_9_remove_hail_endpoint_staging_testing(): Promise<void> {
  await postgrePool.query(`
  ALTER TABLE public."user"
  DROP COLUMN hail_endpoint_staging,
  DROP COLUMN hail_endpoint_testing;
`);
}
