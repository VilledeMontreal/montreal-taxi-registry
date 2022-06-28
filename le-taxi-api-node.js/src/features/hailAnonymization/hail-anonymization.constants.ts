// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const anonymText: string = 'anonymized';

export const anonymizeRecords = `
  UPDATE
    public.hail
  SET
    customer_address = '${anonymText}',
    customer_phone_number = '${anonymText}',
    taxi_phone_number = '${anonymText}',
    customer_lat = null,
    customer_lon = null
  WHERE
    read_only_after BETWEEN $1::timestamp without time zone AND $2::timestamp without time zone
  `;

export const readLastAnonymizationDate = `SELECT last_processed_read_only_after FROM public.anonymization`;

export const insertLastAnonymizationDate = `
  INSERT INTO
    public.anonymization
  VALUES ($1::timestamp without time zone)
`;

export const updateLastAnonymizationDate = `
  UPDATE
    public.anonymization
  SET
    last_processed_read_only_after = $1::timestamp without time zone
`;
