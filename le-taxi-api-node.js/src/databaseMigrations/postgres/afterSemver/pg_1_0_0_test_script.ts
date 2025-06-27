// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_0_test_script(): Promise<void> {
  await postgrePool.query(
    `ALTER TABLE test_table ADD COLUMN column_to_be_remove boolean;`
  );
}
