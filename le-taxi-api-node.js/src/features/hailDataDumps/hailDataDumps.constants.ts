// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const selectInPeriod = `
WITH hail_read_only_after as(
  SELECT
    id,
    added_by,
    taxi_id,
    operateur_id,
    customer_address,
    customer_phone_number,
    customer_lat,
    customer_lon,
    rating_ride,
    rating_ride_reason,
    incident_customer_reason,
    taxi_phone_number,
    incident_taxi_reason,
    reporting_customer,
    reporting_customer_reason,
    status as last_persisted_status,
    last_status_change as last_persisted_status_change,
    change_to_accepted_by_customer,
    change_to_accepted_by_taxi,
    change_to_declined_by_customer,
    change_to_declined_by_taxi,
    change_to_failure,
    change_to_incident_customer,
    change_to_incident_taxi,
    change_to_received_by_operator,
    change_to_received_by_taxi,
    change_to_sent_to_operator,
    change_to_customer_on_board,
    change_to_finished,
    read_only_after,
    creation_datetime,
    last_update_at
  FROM public.hail
  WHERE read_only_after >= $1::timestamp without time zone AND read_only_after < $2::timestamp without time zone)
SELECT * from hail_read_only_after
`;

const statusHistoryFields = [
  {
    change: 'change_to_accepted_by_customer',
    status: 'accepted_by_customer'
  },
  {
    change: 'change_to_accepted_by_taxi',
    status: 'accepted_by_taxi'
  },
  {
    change: 'change_to_declined_by_customer',
    status: 'declined_by_customer'
  },
  {
    change: 'change_to_declined_by_taxi',
    status: 'declined_by_taxi'
  },
  {
    change: 'change_to_failure',
    status: 'failure'
  },
  {
    change: 'change_to_incident_customer',
    status: 'incident_customer'
  },
  {
    change: 'change_to_incident_taxi',
    status: 'incident_taxi'
  },
  {
    change: 'change_to_received_by_operator',
    status: 'received_by_operator'
  },
  {
    change: 'change_to_received_by_taxi',
    status: 'received_by_taxi'
  },
  {
    change: 'change_to_sent_to_operator',
    status: 'sent_to_operator'
  },
  {
    change: 'change_to_customer_on_board',
    status: 'customer_on_board'
  },
  {
    change: 'change_to_finished',
    status: 'finished'
  }
];

export { selectInPeriod, statusHistoryFields };
