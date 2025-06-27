// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_2_create_anonymization_table(): Promise<void> {
  await postgrePool.query(`
CREATE TABLE public.anonymization (
  last_processed_read_only_after timestamp without time zone NOT NULL
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE UNIQUE INDEX anonymization_ensure_no_more_than_1_rows
ON public.anonymization((last_processed_read_only_after IS NOT NULL));

CREATE INDEX read_only_after_index ON public.hail USING btree (
  read_only_after DESC NULLS LAST
);
`);
}
