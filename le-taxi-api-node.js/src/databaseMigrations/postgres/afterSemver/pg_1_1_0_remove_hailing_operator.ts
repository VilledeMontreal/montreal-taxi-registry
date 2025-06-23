// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_1_0_remove_hailing_operator(): Promise<void> {
  await postgrePool.query(`ALTER TABLE public."user"
  DROP COLUMN IF EXISTS operator_api_key,
  DROP COLUMN IF EXISTS operator_header_name;`);
}
