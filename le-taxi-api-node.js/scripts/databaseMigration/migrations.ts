// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { mdb_1_0_0_test_script } from '../../src/databaseMigrations/mongodb/afterSemver/mdb_1_0_0_test_script';
import { mdb_1_0_1_test_script } from '../../src/databaseMigrations/mongodb/afterSemver/mdb_1_0_1_test_script';
import { pg_1_0_0_test_script } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_0_test_script';
import { pg_1_0_10_operator_public_id } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_10_operator_public_id';
import { pg_1_0_11_remove_hailing } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_11_remove_hailing';
import { pg_1_0_12_remove_hailing_operator } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_12_remove_hailing_operator';
import { pg_1_0_1_test_script } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_1_test_script';
import { pg_1_0_2_create_anonymization_table } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_2_create_anonymization_table';
import { pg_1_0_3_create_trips_tables } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_3_create_trips_tables';
import { pg_1_0_4_add_user_columns_for_gtfs } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_4_add_user_columns_for_gtfs';
import { pg_1_0_5_drop_user_phone_number_customer } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_5_drop_user_phone_number_customer';
import { pg_1_0_6_apikey_changes } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_6_apikey_changes';
import { pg_1_0_7_set_admin_password } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_7_set_admin_password';
import { pg_1_0_8_add_inquiries_columns_for_gtfs } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_8_add_inquiries_columns_for_gtfs';
import { pg_1_0_9_remove_hail_endpoint_staging_testing } from '../../src/databaseMigrations/postgres/afterSemver/pg_1_0_9_remove_hail_endpoint_staging_testing';
import { DatabaseMigration } from './databaseMigration.types';

export const migrationsByDatabaseTypeAndVersion: { [key: string]: { [key: string]: DatabaseMigration } } = {
  mongodb: {
    '1.0.1': mdb_1_0_1_test_script,
    '1.0.0': mdb_1_0_0_test_script
  },
  postgresql: {
    '1.0.12': pg_1_0_12_remove_hailing_operator,
    '1.0.11': pg_1_0_11_remove_hailing,
    '1.0.10': pg_1_0_10_operator_public_id,
    '1.0.9': pg_1_0_9_remove_hail_endpoint_staging_testing,
    '1.0.8': pg_1_0_8_add_inquiries_columns_for_gtfs,
    '1.0.7': pg_1_0_7_set_admin_password,
    '1.0.6': pg_1_0_6_apikey_changes,
    '1.0.5': pg_1_0_5_drop_user_phone_number_customer,
    '1.0.4': pg_1_0_4_add_user_columns_for_gtfs,
    '1.0.3': pg_1_0_3_create_trips_tables,
    '1.0.2': pg_1_0_2_create_anonymization_table,
    '1.0.1': pg_1_0_1_test_script,
    '1.0.0': pg_1_0_0_test_script
  }
};
