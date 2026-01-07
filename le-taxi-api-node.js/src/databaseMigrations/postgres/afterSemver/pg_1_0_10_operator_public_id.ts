// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_10_operator_public_id(): Promise<void> {
  await postgrePool.query(
    `ALTER TABLE public."user" ADD COLUMN public_id uuid NULL;`,
  );
  await postgrePool.query(
    `CREATE UNIQUE INDEX user_public_id_unique ON public."user"(public_id);`,
  );
}
