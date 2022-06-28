// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from '../../../features/shared/taxiPostgre/taxiPostgre';

export async function pg_1_0_5_drop_user_phone_number_customer(): Promise<void> {
  await postgrePool.query(`ALTER TABLE public."user"
  DROP COLUMN phone_number_customer,
  DROP COLUMN apikey,
  DROP COLUMN password;
`);
}
