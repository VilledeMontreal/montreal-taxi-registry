// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert = require("assert");
import { configs } from "../../../config/configs";
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_7_set_admin_password(
  options: string
): Promise<void> {
  await postgrePool.query(
    `
  UPDATE public."user"
  SET password_v2 = $1
  WHERE email = $2;
`,
    [options, configs.security.adminUser]
  );
}
