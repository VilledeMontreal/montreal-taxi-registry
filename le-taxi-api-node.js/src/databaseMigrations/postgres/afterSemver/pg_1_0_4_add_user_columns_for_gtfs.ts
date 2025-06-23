// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_4_add_user_columns_for_gtfs(): Promise<void> {
  await postgrePool.query(`
  ALTER TABLE public."user"
  ADD COLUMN website_url varchar(2048) NULL,
  ADD COLUMN standard_booking_phone_number varchar(2048) NULL,
  ADD COLUMN standard_booking_website_url varchar(2048) NULL,
  ADD COLUMN standard_booking_android_deeplink_uri varchar(2048) NULL,
  ADD COLUMN standard_booking_android_store_uri varchar(2048) NULL,
  ADD COLUMN standard_booking_ios_deeplink_uri varchar(2048) NULL,
  ADD COLUMN standard_booking_ios_store_uri varchar(2048) NULL,
  ADD COLUMN standard_booking_is_promoted_to_public bool NULL,
  ADD COLUMN minivan_booking_is_available_from_web_url bool NULL,
  ADD COLUMN minivan_booking_is_available_from_android_uri bool NULL,
  ADD COLUMN minivan_booking_is_available_from_ios_uri bool NULL,
  ADD COLUMN minivan_booking_is_promoted_to_public bool NULL,
  ADD COLUMN special_need_booking_phone_number varchar(2048) NULL,
  ADD COLUMN special_need_booking_website_url varchar(2048) NULL,
  ADD COLUMN special_need_booking_android_deeplink_uri varchar(2048) NULL,
  ADD COLUMN special_need_booking_android_store_uri varchar(2048) NULL,
  ADD COLUMN special_need_booking_ios_deeplink_uri varchar(2048) NULL,
  ADD COLUMN special_need_booking_ios_store_uri varchar(2048) NULL,
  ADD COLUMN special_need_booking_is_promoted_to_public bool NULL;
`);
}
