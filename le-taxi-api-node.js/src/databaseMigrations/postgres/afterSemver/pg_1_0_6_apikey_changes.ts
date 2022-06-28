// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../../config/configs';
import { postgrePool } from '../../../features/shared/taxiPostgre/taxiPostgre';

export async function pg_1_0_6_apikey_changes(): Promise<void> {
  const client = await postgrePool.connect();
  try {
    await client.query(`BEGIN`);
    await client.query(`ALTER TABLE public."user" ADD COLUMN apikey_v2 varchar(255) NULL`);
    await client.query(
      `UPDATE public."user" SET apikey_v2 = encode(encrypt_iv(apikey::bytea, $1, '0000000000000000', 'aes-cbc'), 'hex')`,
      [configs.security.secret]
    );
    await client.query(`ALTER TABLE public."user" ALTER COLUMN apikey_v2 SET NOT NULL`);
    await client.query(`ALTER TABLE public."user" ALTER COLUMN apikey SET DEFAULT 'obsolete'`);
    await client.query(`COMMIT`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.release();
  }

  await postgrePool.query(`ALTER TABLE public."user" ADD COLUMN password_v2 varchar(255) NULL;`);
}
