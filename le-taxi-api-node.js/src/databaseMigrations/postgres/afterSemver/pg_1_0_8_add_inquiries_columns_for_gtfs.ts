// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_8_add_inquiries_columns_for_gtfs(): Promise<void> {
  await postgrePool.query(`
  ALTER TABLE public."user"
  ADD COLUMN standard_booking_inquiries_starts_at timestamp without time zone NULL,
  ADD COLUMN minivan_booking_inquiries_starts_at timestamp without time zone NULL,
  ADD COLUMN special_need_booking_inquiries_starts_at timestamp without time zone NULL;
`);
}
