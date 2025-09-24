// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_1_1_add_vehicle_property_bonjour(): Promise<void> {
  await postgrePool.query(`ALTER TABLE public."vehicle_description"
  ADD COLUMN IF NOT EXISTS bonjour boolean DEFAULT false;`);
}
